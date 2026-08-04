import {
  SLOT_COLORS_BG,
  PLINKO_TRAJECTORY_CONFIG,
  RENDER_COLORS,
} from "./types";
import {
  loadTrajectoryBinary,
  parseTrajectoryBinary,
} from "./trajectoryCache";
import type { BuddyBallApiPayload } from "./plinkoBoardTypes";

// ─── Constants ───────────────────────────────────────────────────────────────

export const ROWS = 11;
export const BASE_BALL_RADIUS = 7;
export const BALL_COUNT_SYNC_INTERVAL_MS = 15000;
export const BASE_STAKE_USDT = 0.01;
export const DEFAULT_FIXED_TIME_STEP_MS = 1000 / 144;
export const MAX_SUB_STEPS_PER_FRAME = 10;
export const HIDDEN_RECORDING_TIME_STEP_MS = 1000 / 240;
export const HIDDEN_RECORDING_MAX_SUB_STEPS_PER_FRAME = 16;
export const DETERMINISTIC_MODE = false;
export const DETERMINISTIC_SEED = 123456789;
export const TRAJECTORY_STATIC_CONFIGS_PER_SLOT = 20;
export const TRAJECTORY_DYNAMIC_CONFIGS_PER_SLOT = 50;
export const STARTUP_HIDDEN_WARMUP_TOTAL = 60;
export const STARTUP_HIDDEN_WARMUP_BATCH_SIZE = 1;
export const STARTUP_HIDDEN_WARMUP_INTERVAL_MS = 260;
export const STARTUP_HIDDEN_WARMUP_MAX_ACTIVE = 2;
export const PIN_BOUNCE_SOUND_COOLDOWN_MS = 156;
export const HIDDEN_BALL_MAX_LIFETIME_MS = 12000;
export const SLOT_BAG_VERTICAL_OFFSET_RATIO = 0.0;
export const SLOT_BAG_HEIGHT_RATIO = 1.8;
export const SLOT_BAG_MIN_TOP_RATIO = 0.62;
export const SLOT_BAG_MIN_HEIGHT_PX = 28;
export const ENABLE_STATIC_TRAJECTORY_COLLECTION = false;
export const AUTO_STATIC_COLLECTION_DELAY_MS = 0;
export const AUTO_STATIC_COLLECTION_INTERVAL_MS = 220;
export const AUTO_STATIC_COLLECTION_BATCH_SIZE = 1;
export const AUTO_STATIC_COLLECTION_MAX_ACTIVE_HIDDEN = 6;
export const VIRTUAL_BALL_RADIUS_SCALE = 1.15;
export const VIRTUAL_BALL_DENSITY = 0.005;
export const STATIC_BIN_CHUNK_MAX_BYTES = 199 * 1024;
export const BALL_TRAIL_MAX_POINTS = Math.min(
  96,
  Math.max(6, Math.floor(24))
);

export const PIN_COLOR = RENDER_COLORS.pin.baseFill;

// ─── Geometry helpers ────────────────────────────────────────────────────────

export const calculateTriangleGeometry = (canvasWidth: number, canvasHeight: number) => {
  // Leave a bit more breathing room around the board so the outer glow
  // and rounded top are not clipped on shorter mobile viewports.
  const targetTriangleWidth = canvasWidth * 0.84;
  const targetTriangleHeight = canvasHeight * 0.76;
  const imageAspectRatio = 0.8;
  const targetAspectRatio = targetTriangleWidth / targetTriangleHeight;

  let triangleWidth: number;
  let triangleHeight: number;

  if (imageAspectRatio > targetAspectRatio) {
    triangleWidth = targetTriangleWidth;
    triangleHeight = triangleWidth / imageAspectRatio;
  } else {
    triangleHeight = targetTriangleHeight;
    triangleWidth = triangleHeight * imageAspectRatio;
  }

  const triangleX = (canvasWidth - triangleWidth) / 2;
  const triangleY = canvasHeight * 0.19 + (targetTriangleHeight - triangleHeight) / 2;
  const triangleBottomY = triangleY + triangleHeight;

  return { triangleX, triangleY, triangleWidth, triangleHeight, triangleBottomY, targetTriangleWidth, targetTriangleHeight };
};

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const getTriangleCornerRadius = (triangleWidth: number, triangleHeight: number) =>
  Math.min(triangleWidth, triangleHeight) * 0.12;

export const getRestitutionScaleByTriangleWidth = (triangleWidth: number) => {
  const referenceWidth = 520;
  return clamp(triangleWidth / referenceWidth, 0.85, 1.05);
};

export const getBallRadiusByPinSpacingX = (pinSpacingX: number) =>
  Math.max(2, pinSpacingX * 0.25);

export const getUnifiedBallRadiusByPinSpacingX = (pinSpacingX: number) =>
  getBallRadiusByPinSpacingX(pinSpacingX) * VIRTUAL_BALL_RADIUS_SCALE;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const isCompleteTrajectory = (points: { y: number; timestamp?: number }[]) => {
  if (points.length < PLINKO_TRAJECTORY_CONFIG.minRecordedPoints) return false;
  const firstTs = points[0]?.timestamp ?? 0;
  const lastTs = points[points.length - 1]?.timestamp ?? firstTs;
  if ((lastTs - firstTs) < PLINKO_TRAJECTORY_CONFIG.minRecordedDurationMs) return false;
  const firstY = points[0]?.y ?? 0;
  const lastY = points[points.length - 1]?.y ?? firstY;
  if ((lastY - firstY) < PLINKO_TRAJECTORY_CONFIG.minRecordedVerticalTravel) return false;
  return lastY >= 0.88;
};

export const ensureStrictlyIncreasingTimestamps = <T extends { timestamp?: number }>(points: T[], minStepMs = 1): T[] => {
  let lastTs = Number.NEGATIVE_INFINITY;
  return points.map((point, index) => {
    const rawTs = point.timestamp ?? (index === 0 ? 0 : lastTs + minStepMs);
    const nextTs = index === 0
      ? Math.max(0, rawTs)
      : Math.max(rawTs, lastTs + minStepMs);
    lastTs = nextTs;
    return { ...point, timestamp: nextTs };
  });
};

// ─── Payload utilities ───────────────────────────────────────────────────────

export const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

export const normalizeBuddyBallPayload = (payload: unknown): BuddyBallApiPayload => {
  const base = (typeof payload === "object" && payload != null ? payload : {}) as Record<string, unknown>;
  const code = toFiniteNumber(base.code) ?? -1;
  const msg = typeof base.msg === "string" ? base.msg : "";
  const data = (typeof base.data === "object" && base.data != null ? base.data : {}) as Record<string, unknown>;
  return { code, msg, data };
};

export const extractBallCount = (payload: BuddyBallApiPayload): number | null => {
  const value = payload.data.balls;
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  const fallback = payload.data.count;
  if (typeof fallback === "number" && Number.isFinite(fallback)) return Math.max(0, Math.floor(fallback));
  return null;
};

export const arraysEqual = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const extractBuddyBallMultipliers = (payload: BuddyBallApiPayload): number[] | null => {
  const list = payload.data.list;
  if (!Array.isArray(list)) return null;

  const parsed = list
    .map((item) => {
      if (typeof item !== "object" || item == null) return null;
      const entry = item as Record<string, unknown>;
      const id = typeof entry.id === "number" ? entry.id : -1;
      const times = typeof entry.times === "number" ? entry.times : NaN;
      if (id <= 0 || !Number.isFinite(times)) return null;
      return { id, times: Math.max(0, Math.floor(times)) };
    })
    .filter((item): item is { id: number; times: number } => item != null)
    .sort((a, b) => a.id - b.id)
    .map((item) => item.times);

  if (parsed.length === 11) return parsed;
  if (parsed.length === 6) return [...parsed, ...parsed.slice(0, -1).reverse()];
  return null;
};

export const getSlotColorIndex = (slotIndex: number, slotCount: number) => {
  if (slotCount <= 1) return Math.floor((SLOT_COLORS_BG.length - 1) / 2);
  const maxPaletteIndex = SLOT_COLORS_BG.length - 1;
  return Math.round((slotIndex / (slotCount - 1)) * maxPaletteIndex);
};

// ─── Static trajectory loader ────────────────────────────────────────────────

type StaticTrajectoryRows = ReturnType<typeof parseTrajectoryBinary>;
let staticTrajectoryRowsCache: StaticTrajectoryRows | null = null;
let staticTrajectoryRowsPromise: Promise<StaticTrajectoryRows> | null = null;

export const loadStaticTrajectoryRowsOnce = (): Promise<StaticTrajectoryRows> => {
  if (staticTrajectoryRowsCache != null) return Promise.resolve(staticTrajectoryRowsCache);
  if (staticTrajectoryRowsPromise) return staticTrajectoryRowsPromise;

  staticTrajectoryRowsPromise = (async () => {
    const chunkUrls: string[] = [];

    console.log("[Plinko] 开始加载静态配置分片(chunks):", chunkUrls.length);

    if (chunkUrls.length === 0) {
      console.log("[Plinko] 当前未配置静态轨迹分片，跳过 BIN 回退加载");
      staticTrajectoryRowsCache = [];
      return [];
    }

    let mergedRows: StaticTrajectoryRows = [];
    for (const [index, chunkUrl] of chunkUrls.entries()) {
      try {
        const buffer = await loadTrajectoryBinary(chunkUrl);
        const rows = parseTrajectoryBinary(buffer);
        if (rows.length <= 0) {
          console.warn("[Plinko] 分片无有效轨迹数据，跳过:", { index, chunkUrl });
          continue;
        }
        mergedRows = [...mergedRows, ...rows];
        console.log("[Plinko] 分片加载完成并已生效:", {
          index,
          loadedChunkCount: index + 1,
          totalChunks: chunkUrls.length,
          mergedRows: mergedRows.length,
        });
      } catch (chunkError) {
        console.warn("[Plinko] 分片加载失败，继续后续分片:", { index, chunkUrl, chunkError });
      }
    }

    if (mergedRows.length > 0) {
      staticTrajectoryRowsCache = mergedRows;
      return mergedRows;
    }

    console.warn("[Plinko] 所有分片均不可用，返回空静态轨迹");
    staticTrajectoryRowsCache = [];
    return [];
  })().catch((error) => {
    staticTrajectoryRowsPromise = null;
    throw error;
  });

  return staticTrajectoryRowsPromise;
};
