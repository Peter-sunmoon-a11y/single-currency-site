import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { useHaptics } from "@/hooks/useHaptics";
import { useSound } from "@/hooks/useSound";
import Matter from "matter-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";

import { MultiplierSlots } from "./MultiplierSlots";
import { createParticles } from "./Particles";
import { createSeededRandom, parseTrajectoryBinary, PlinkoTrajectoryCache, TrajectoryConfig } from "./trajectoryCache";
import {
  MULTIPLIERS,
  PLINKO_PHYSICS_CONFIG,
  PLINKO_TRAJECTORY_CONFIG,
  RENDER_COLORS,
  SLOT_PATH_COUNTS,
  STARTING_BALLS
} from "./types";
import { WinTicker } from "./WinTicker";

import type { Particle, GameState } from "./types";
import type {
  BuddyBallRequestType,
  BuddyBallApiPayload,
  TrajectoryPoint,
  BallMeta,
  CorrectionSnapshot,
  CorrectionStats,
  ExchangeRateInfo,
  WinEntry,
  PlinkoBoardProps
} from "./plinkoBoardTypes";

export type { BuddyBallApi } from "./plinkoBoardTypes";
import {
  ROWS,
  BASE_BALL_RADIUS,
  BALL_COUNT_SYNC_INTERVAL_MS,
  BASE_STAKE_USDT,
  DEFAULT_FIXED_TIME_STEP_MS,
  MAX_SUB_STEPS_PER_FRAME,
  HIDDEN_RECORDING_TIME_STEP_MS,
  HIDDEN_RECORDING_MAX_SUB_STEPS_PER_FRAME,
  DETERMINISTIC_MODE,
  DETERMINISTIC_SEED,
  TRAJECTORY_STATIC_CONFIGS_PER_SLOT,
  TRAJECTORY_DYNAMIC_CONFIGS_PER_SLOT,
  STARTUP_HIDDEN_WARMUP_TOTAL,
  STARTUP_HIDDEN_WARMUP_BATCH_SIZE,
  STARTUP_HIDDEN_WARMUP_INTERVAL_MS,
  STARTUP_HIDDEN_WARMUP_MAX_ACTIVE,
  PIN_BOUNCE_SOUND_COOLDOWN_MS,
  HIDDEN_BALL_MAX_LIFETIME_MS,
  SLOT_BAG_VERTICAL_OFFSET_RATIO,
  SLOT_BAG_HEIGHT_RATIO,
  SLOT_BAG_MIN_TOP_RATIO,
  SLOT_BAG_MIN_HEIGHT_PX,
  ENABLE_STATIC_TRAJECTORY_COLLECTION,
  AUTO_STATIC_COLLECTION_DELAY_MS,
  AUTO_STATIC_COLLECTION_INTERVAL_MS,
  AUTO_STATIC_COLLECTION_BATCH_SIZE,
  AUTO_STATIC_COLLECTION_MAX_ACTIVE_HIDDEN,
  VIRTUAL_BALL_RADIUS_SCALE,
  VIRTUAL_BALL_DENSITY,
  STATIC_BIN_CHUNK_MAX_BYTES,
  BALL_TRAIL_MAX_POINTS,
  PIN_COLOR,
  calculateTriangleGeometry,
  clamp,
  getTriangleCornerRadius,
  getRestitutionScaleByTriangleWidth,
  getUnifiedBallRadiusByPinSpacingX,
  lerp,
  isCompleteTrajectory,
  ensureStrictlyIncreasingTimestamps,
  toFiniteNumber,
  extractBallCount,
  arraysEqual,
  extractBuddyBallMultipliers,
  getSlotColorIndex,
  loadStaticTrajectoryRowsOnce
} from "./plinkoBoardUtils";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Modal, useModal } from "@/components/ui/Modal";

const MAX_CONCURRENT_DROP_REQUESTS = 4;
const PLAY_BATCH_OPTIONS = [1, 5, 10, 20, 50, 100] as const;

export const PlinkoBoard = ({ dropX, buddyBallApi }: PlinkoBoardProps) => {
  const { t } = useTranslation(["common", "buddyBalls"]);
  const user = useBoundStore((state) => state.user);
  const { exchangeRates, formatCurrency, getCurrencySymbol, convertCurrency } = useCurrencyData();
  const formatCurrencyRef = useRef(formatCurrency);
  const getCurrencySymbolRef = useRef(getCurrencySymbol);
  const convertCurrencyRef = useRef(convertCurrency);
  const exchangeRatesRef = useRef(exchangeRates);
  const currencyFiatRef = useRef(user?.currency_fiat || "USD");
  useEffect(() => {
    formatCurrencyRef.current = formatCurrency;
  }, [formatCurrency]);
  useEffect(() => {
    getCurrencySymbolRef.current = getCurrencySymbol;
  }, [getCurrencySymbol]);
  useEffect(() => {
    convertCurrencyRef.current = convertCurrency;
  }, [convertCurrency]);
  useEffect(() => {
    exchangeRatesRef.current = exchangeRates;
  }, [exchangeRates]);
  useEffect(() => {
    currencyFiatRef.current = user?.currency_fiat || "USD";
  }, [user]);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const animationRef = useRef<number | null>(null);

  // 使用系统背景色
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [gameState, setGameState] = useState<GameState>({
    ballsLeft: STARTING_BALLS,
    lastWin: 0,
    isShaking: false
  });
  const [isSlotConfigLoaded, setIsSlotConfigLoaded] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [highlightColors, setHighlightColors] = useState<{ [key: number]: string }>({});
  const [slotMultipliers, setSlotMultipliers] = useState<number[]>(MULTIPLIERS);
  const exchangeRateInfo = useMemo((): ExchangeRateInfo => {
    const currency_fiat = user?.currency_fiat || "USD";
    const usdtRateRaw = toFiniteNumber(exchangeRates["USDT"]) ?? 1;
    const exchangeRate = convertCurrencyRef.current({
      amount: 1,
      fromCurrency: "USDT",
      toCurrency: currency_fiat,
      exchangeRates
    });
    if (!exchangeRate || exchangeRate <= 0) {
      return { usdtRate: usdtRateRaw, exchangeRate: 1, currencySymbol: "$" };
    }
    const currencySymbol = getCurrencySymbolRef.current(currency_fiat) ?? "$";
    return { usdtRate: usdtRateRaw, exchangeRate, currencySymbol };
  }, [user, exchangeRates]);
  const plinkoThemePalette = useMemo(() => {
    const s = getComputedStyle(document.documentElement);
    const v = (name: string) => s.getPropertyValue(name).trim();
    const primary = v("--color-primary") || "oklch(65% 0.18 250)";
    const secondary = v("--color-secondary") || "oklch(60% 0.16 300)";
    const accent = v("--color-accent") || "oklch(70% 0.16 140)";
    const warning = v("--color-warning") || "oklch(78% 0.17 80)";
    const info = v("--color-info") || "oklch(72% 0.14 240)";
    const base200 = v("--color-base-200") || "oklch(24% 0.02 260)";
    const base300 = v("--color-base-300") || "oklch(20% 0.02 260)";
    const baseContent = v("--color-base-content") || "oklch(92% 0.01 260)";
    //console.log('[PlinkoTheme]', themeState.finalTheme?.name, colors?.base300, colors?.baseContent);
    const centerHighlightSide = `color-mix(in oklab, ${primary} 76%, ${baseContent})`;
    const centerHighlightMiddle = `color-mix(in oklab, ${primary} 64%, ${baseContent})`;
    return {
      slotBackgrounds: [
        `color-mix(in oklab, ${warning} 18%, ${base300})`,
        `color-mix(in oklab, ${secondary} 16%, ${base300})`,
        `color-mix(in oklab, ${accent} 14%, ${base300})`,
        `color-mix(in oklab, ${info} 14%, ${base300})`,
        `color-mix(in oklab, ${primary} 10%, ${base300})`,
        `color-mix(in oklab, ${baseContent} 6%, ${base300})`,
        `color-mix(in oklab, ${primary} 10%, ${base300})`,
        `color-mix(in oklab, ${info} 14%, ${base300})`,
        `color-mix(in oklab, ${accent} 14%, ${base300})`,
        `color-mix(in oklab, ${secondary} 16%, ${base300})`,
        `color-mix(in oklab, ${warning} 18%, ${base300})`
      ],
      slotBorders: [
        `color-mix(in oklab, ${warning} 38%, ${base200})`,
        `color-mix(in oklab, ${secondary} 34%, ${base200})`,
        `color-mix(in oklab, ${accent} 30%, ${base200})`,
        `color-mix(in oklab, ${info} 30%, ${base200})`,
        `color-mix(in oklab, ${primary} 24%, ${base200})`,
        `color-mix(in oklab, ${baseContent} 14%, ${base200})`,
        `color-mix(in oklab, ${primary} 24%, ${base200})`,
        `color-mix(in oklab, ${info} 30%, ${base200})`,
        `color-mix(in oklab, ${accent} 30%, ${base200})`,
        `color-mix(in oklab, ${secondary} 34%, ${base200})`,
        `color-mix(in oklab, ${warning} 38%, ${base200})`
      ],
      slotText: Array.from({ length: 11 }, () => baseContent),
      slotHighlights: [warning, secondary, accent, info, centerHighlightSide, centerHighlightMiddle, centerHighlightSide, info, accent, secondary, warning],
      slotBagNormal: `color-mix(in oklab, ${base300} 84%, ${base200})`,
      slotBagBorder: `color-mix(in oklab, ${baseContent} 14%, ${base300})`,
      triangle: {
        borderInner: `color-mix(in oklab, ${baseContent} 18%, ${base300})`,
        borderOuter: `color-mix(in oklab, ${baseContent} 10%, ${base300})`,
        highlight: primary,
        highlightCore: `color-mix(in oklab, ${baseContent} 42%, ${primary})`,
        highlightShadowOuter: `color-mix(in oklab, ${primary} 62%, transparent)`
      },
      buttonBg: `color-mix(in oklab, ${primary} 80%, ${base300})`,
      buttonBgDisabled: `color-mix(in oklab, ${baseContent} 18%, ${base300})`,
      buttonText: baseContent,
      buttonTextDisabled: `color-mix(in oklab, ${baseContent} 60%, ${base300})`
    };
  }, []);
  const [isReady, setIsReady] = useState(false);
  const [winHistory, setWinHistory] = useState<WinEntry[]>([]);
  const [slotLayoutRevision, setSlotLayoutRevision] = useState(0);
  const [ballsPerRound, setBallsPerRound] = useState<number>(1);
  const [resolvedSlotsTop, setResolvedSlotsTop] = useState<number | null>(null);
  const startupWarmupStartedRef = useRef(false);
  const staticCollectorStartedRef = useRef(false);
  const staticCollectorRunningRef = useRef(false);
  const staticTrajectoryReadyRef = useRef(false);
  const trajectoryLoadingToastShownRef = useRef(false);
  const activeDropRequestsRef = useRef(0);
  const pendingBallReservationsRef = useRef(0);
  const unresolvedVisibleBallsRef = useRef(0);
  const queuedBatchDropsRef = useRef(0);
  const isPumpingDropQueueRef = useRef(false);
  const deterministicGameplayRandomRef = useRef(createSeededRandom(Math.floor(DETERMINISTIC_SEED)));
  const deterministicWarmupRandomRef = useRef(createSeededRandom(Math.floor(DETERMINISTIC_SEED ^ 0x9e3779b9)));
  const glowingPinsRef = useRef<Map<string, { x: number; y: number; intensity: number }>>(new Map());
  const glowingPinCooldownRef = useRef<Map<string, number>>(new Map());
  const ballTrailsRef = useRef<Map<number, { x: number; y: number; t: number }[]>>(new Map());
  const ballImageRef = useRef<HTMLImageElement | null>(null);
  const triangleGeometryRef = useRef<{
    triangleX: number;
    triangleY: number;
    triangleWidth: number;
    triangleHeight: number;
    triangleBottomY: number;
    triangleTopY: number;
    realBtmY: number
  } | null>(null);
  const pinBodiesRef = useRef<Matter.Body[]>([]);
  const slotSensorsRef = useRef<Matter.Body[]>([]);
  const ballsLeftRef = useRef(gameState.ballsLeft);
  const isBallCountSyncInFlightRef = useRef(false);
  const slotMultipliersRef = useRef(slotMultipliers);
  const exchangeRateInfoRef = useRef(exchangeRateInfo);
  const activeSlotRef = useRef<number | null>(activeSlot);
  const highlightColorsRef = useRef<{ [key: number]: string }>(highlightColors);
  const targetSlotRef = useRef<number | null>(null); // 存储服务器指定的目标槽位
  const bottomRowPinsRef = useRef<{ x: number; y: number; index: number }[]>([]); // 存储最底部一排钉子的位置
  const serverRewardRef = useRef<{ slotIndex: number; multiplier: number } | null>(null); // 存储服务器指定的奖励信息
  const lastGetBallPayloadRef = useRef<BuddyBallApiPayload | null>(null);
  const lastGetBallRawMessageRef = useRef<any>(null);
  const trajectoryCacheRef = useRef(new PlinkoTrajectoryCache({
    staticConfigsPerSlot: Math.max(1, Math.floor(TRAJECTORY_STATIC_CONFIGS_PER_SLOT)),
    dynamicConfigsPerSlot: Math.max(1, Math.floor(TRAJECTORY_DYNAMIC_CONFIGS_PER_SLOT)),
    deterministicMode: DETERMINISTIC_MODE,
    deterministicSeed: Math.floor(DETERMINISTIC_SEED)
  }));
  const correctionStatsRef = useRef<{
    totalSettledBalls: number;
    totalInterventions: number;
    totalCorrectionEnergy: number;
    totalImpacts: number;
    recent: CorrectionSnapshot[];
  }>({
    totalSettledBalls: 0,
    totalInterventions: 0,
    totalCorrectionEnergy: 0,
    totalImpacts: 0,
    recent: []
  });

  const { playSound, unlockAudio } = useSound();
  const { vibrate } = useHaptics();
  const nextRandom = useCallback(() => {
    if (DETERMINISTIC_MODE) {
      return deterministicGameplayRandomRef.current();
    }
    return Math.random();
  }, []);
  const nextWarmupRandom = useCallback(() => {
    if (DETERMINISTIC_MODE) {
      return deterministicWarmupRandomRef.current();
    }
    return Math.random();
  }, []);

  const sendBuddyBallRequest = useCallback(async (type: BuddyBallRequestType): Promise<BuddyBallApiPayload> => {
    try {
      switch (type) {
        case "GetBallCount":
          return await buddyBallApi.getBallCount();
        case "GetBuddyBallConfig":
          return await buddyBallApi.getBuddyBallConfig();
        case "GetBall":
          return await buddyBallApi.getBall();
        default:
          return { code: -1, msg: "Unknown request type", data: {} };
      }
    } catch (err) {
      console.error("[BuddyBallRequest]", type, "error", err);
      return { code: -1, msg: `${type} error`, data: {} };
    }
  }, [buddyBallApi]);

  const syncBallCount = useCallback(async () => {
    if (isBallCountSyncInFlightRef.current) return;
    isBallCountSyncInFlightRef.current = true;

    try {
      const payload = await sendBuddyBallRequest("GetBallCount");
      const nextCount = extractBallCount(payload);
      if (nextCount == null) return;
      setGameState((prev) => {
        if (unresolvedVisibleBallsRef.current > 0 && nextCount < prev.ballsLeft) {
          return prev;
        }
        return prev.ballsLeft === nextCount ? prev : { ...prev, ballsLeft: nextCount };
      });
    } finally {
      isBallCountSyncInFlightRef.current = false;
    }
  }, [sendBuddyBallRequest]);

  const syncBuddyBallConfig = useCallback(async () => {
    try {
      const payload = await sendBuddyBallRequest("GetBuddyBallConfig");
      if (payload.code !== 0) return;
      const nextMultipliers = extractBuddyBallMultipliers(payload);
      if (!nextMultipliers) return;
      setSlotMultipliers((prev) => (arraysEqual(prev, nextMultipliers) ? prev : nextMultipliers));
    } finally {
      setIsSlotConfigLoaded(true);
    }
  }, [sendBuddyBallRequest]);

  // Keep ref in sync with state to avoid stale closures
  useEffect(() => {
    ballsLeftRef.current = gameState.ballsLeft;
  }, [gameState.ballsLeft]);

  useEffect(() => {
    slotMultipliersRef.current = slotMultipliers;
  }, [slotMultipliers]);

  useEffect(() => {
    exchangeRateInfoRef.current = exchangeRateInfo;
  }, [exchangeRateInfo]);

  useEffect(() => {
    setWinHistory((prev) => {
      const { exchangeRate, currencySymbol } = exchangeRateInfoRef.current;
      if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) return prev;
      const currency_fiat = currencyFiatRef.current;
      return prev.map((win) => {
        const amountUsdt = win.amountUsdt != null && Number.isFinite(win.amountUsdt)
          ? win.amountUsdt
          : (Number.isFinite(win.amount) ? win.amount / exchangeRate : 0);
        const nextAmount = convertCurrencyRef.current({
          amount: amountUsdt,
          fromCurrency: "USDT",
          toCurrency: currency_fiat,
          exchangeRates: exchangeRatesRef.current
        });
        const nextDisplayAmount = formatCurrencyRef.current({
          amount: nextAmount,
          currency: currency_fiat,
          showSymbol: true,
          showCode: false
        }).formatted;
        return {
          ...win,
          amount: nextAmount,
          amountUsdt,
          displayAmount: nextDisplayAmount,
          currencySymbol
        };
      });
    });
  }, [exchangeRateInfo]);

  useEffect(() => {
    activeSlotRef.current = activeSlot;
  }, [activeSlot]);

  useEffect(() => {
    highlightColorsRef.current = highlightColors;
  }, [highlightColors]);

  const spawnHiddenNaturalBall = useCallback((baseDropX?: number) => {
    if (!engineRef.current) return false;

    const geom = triangleGeometryRef.current;
    if (!geom || dimensions.width <= 0 || dimensions.height <= 0) return false;

    const restitutionScale = getRestitutionScaleByTriangleWidth(geom.triangleWidth);
    const localPinSpacingX = geom.triangleWidth * 0.11;
    const localPinSpacingY = geom.triangleHeight * 0.092;
    const ballRadius = getUnifiedBallRadiusByPinSpacingX(localPinSpacingX);

    // 隐藏球横向抖动收窄，减少“气球感”与机械左右飘
    const spawnJitterX = localPinSpacingX * 0.38;
    const seed = Math.floor(nextWarmupRandom() * 2_147_483_647);
    const random = createSeededRandom(seed);
    const spawnOffsetRatio = random() * 2 - 1;
    const offsetX = Math.max(-1, Math.min(1, spawnOffsetRatio)) * spawnJitterX;
    const rawX = (baseDropX ?? dimensions.width / 2) + offsetX;
    const topRowLeftPinX = geom.triangleX + (geom.triangleWidth - localPinSpacingX) / 2;
    const topRowRightPinX = topRowLeftPinX + localPinSpacingX;
    const minSpawnX = geom.triangleX + ballRadius * 2;
    const maxSpawnX = geom.triangleX + geom.triangleWidth - ballRadius * 2;
    const x = clamp(rawX, Math.max(minSpawnX, topRowLeftPinX), Math.min(maxSpawnX, topRowRightPinX));

    const firstRowPinY = geom.triangleY - geom.triangleHeight * 0.02;
    // 纵坐标硬约束：最顶部钉子上方两行钉子间距
    const y = firstRowPinY - localPinSpacingY;
    const initialVelocityX = (random() * 2 - 1) * (0.15 + Math.random() * 0.18); // 增加随机范围 0.15-0.33，改善自然感
    const initialVelocityY = 0.04 + Math.random() * 0.06; // 增加随机范围 0.04-0.10，避免机械感
    const hiddenSpawnTime = performance.now();
    const spawnRelX = Math.max(0, Math.min(1, (x - geom.triangleX) / geom.triangleWidth));
    const spawnRelY = (y - geom.triangleY) / geom.triangleHeight;

    const hiddenBall = Matter.Bodies.circle(x, y, ballRadius, {
      restitution: PLINKO_PHYSICS_CONFIG.ball.restitutionBase * restitutionScale,
      friction: PLINKO_PHYSICS_CONFIG.ball.friction,
      frictionStatic: PLINKO_PHYSICS_CONFIG.ball.frictionStatic,
      frictionAir: PLINKO_PHYSICS_CONFIG.ball.frictionAir,
      density: VIRTUAL_BALL_DENSITY,
      label: "ball",
      collisionFilter: {
        group: -1
      }
    });

    // 收窄初始角速度，避免球一接触钉子侧边就突然滚开
    const initialAngularVelocity = (Math.random() * 0.04 - 0.02);

    hiddenBall.plugin = {
      ...(hiddenBall.plugin ?? {}),
      plinkoMeta: {
        hidden: true,
        hiddenSettled: false,
        hiddenSpawnTime,
        hiddenPhysicsElapsedMs: 0,
        hiddenHighPrecisionUntilMs: 0,
        seed,
        timeStepMs: PLINKO_TRAJECTORY_CONFIG.hiddenRecordingContactTimeStepMs,
        spawnOffsetRatio,
        initialVelocityX,
        cacheSource: "natural",
        targetSlotIndex: null,
        // 新的轨迹点系统
        trajectoryPoints: [],
        trajectoryCursor: 0,
        // 隐藏球专用 - 记录物理路径用于生成轨迹点
        physicsPath: [{
          x: spawnRelX,
          y: spawnRelY,
          hit: false,
          timestamp: 0
        }],
        // 碰撞计数器
        hitCount: 0,
        lastHitTime: 0
      } satisfies BallMeta
    };

    Matter.Body.setVelocity(hiddenBall, { x: initialVelocityX, y: initialVelocityY });
    Matter.Body.setAngularVelocity(hiddenBall, initialAngularVelocity);
    Matter.Composite.add(engineRef.current.world, hiddenBall);
    return true;
  }, [dimensions.width, dimensions.height, nextWarmupRandom]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const rows = await loadStaticTrajectoryRowsOnce();
        if (cancelled) return;
        trajectoryCacheRef.current.setStaticRows(rows);
        const counts = trajectoryCacheRef.current.getCollectedCounts(slotMultipliers.length);
        console.log("[Plinko] 静态配置加载完成，各槽位配置数量:", counts);
        staticTrajectoryReadyRef.current = rows.length > 0;
      } catch (error) {
        console.warn("[Plinko] 静态配置加载失败:", error);
        staticTrajectoryReadyRef.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    type DebugWindow = Window & {
      __plinkoCorrectionStatus?: () => CorrectionStats;
    };

    const debugWindow = window as DebugWindow;
    debugWindow.__plinkoCorrectionStatus = () => {
      const stats = correctionStatsRef.current;
      const totalSettledBalls = stats.totalSettledBalls;
      return {
        totalSettledBalls,
        totalInterventions: stats.totalInterventions,
        totalCorrectionEnergy: stats.totalCorrectionEnergy,
        totalImpacts: stats.totalImpacts,
        averageInterventionsPerBall: totalSettledBalls > 0 ? stats.totalInterventions / totalSettledBalls : 0,
        averageCorrectionEnergyPerBall: totalSettledBalls > 0 ? stats.totalCorrectionEnergy / totalSettledBalls : 0,
        averageImpactsPerBall: totalSettledBalls > 0 ? stats.totalImpacts / totalSettledBalls : 0,
        recent: [...stats.recent]
      };
    };

    return () => {
      delete debugWindow.__plinkoCorrectionStatus;
    };
  }, []);


  useEffect(() => {
    void syncBallCount();
  }, [syncBallCount]);

  useEffect(() => {
    void syncBuddyBallConfig();
  }, [syncBuddyBallConfig]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const syncWhenVisible = () => {
      if (document.visibilityState !== "visible") return;
      void syncBallCount();
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void syncBallCount();
    }, BALL_COUNT_SYNC_INTERVAL_MS);

    window.addEventListener("focus", syncWhenVisible);
    document.addEventListener("visibilitychange", syncWhenVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", syncWhenVisible);
      document.removeEventListener("visibilitychange", syncWhenVisible);
    };
  }, [syncBallCount]);

  // 加载球的图片
  useEffect(() => {
    const img = new Image();
    img.src = "/images/games/buddyballs/ball.png";
    img.onload = () => {
      ballImageRef.current = img;
    };
  }, []);

  // 使用统一的三角形几何计算函数
  const triangleGeometry =
    dimensions.width > 0 && dimensions.height > 0
      ? calculateTriangleGeometry(dimensions.width, dimensions.height)
      : { triangleWidth: 0, triangleHeight: 0, triangleBottomY: 0 };

  // 钉子参数
  const pinSpacingX = triangleGeometry.triangleWidth * 0.11; // 钉子水平间距
  const pinSpacingY = triangleGeometry.triangleHeight * 0.092; // 钉子垂直间距
  const boardBallRadius = dimensions.width > 0 ? getUnifiedBallRadiusByPinSpacingX(pinSpacingX) : BASE_BALL_RADIUS * VIRTUAL_BALL_RADIUS_SCALE;

  // 球袋计算：基于底部钉子位置计算球袋位置
  // 11个球袋分布在12个钉子之间
  const bottomPins = bottomRowPinsRef.current;
  let slotPositions: { x: number; index: number }[] = [];

  if (bottomPins.length === 12) {
    // 基于钉子位置计算球袋中心位置
    for (let i = 0; i < 11; i++) {
      // 第i个球袋在第i个和第i+1个钉子之间
      const leftPin = bottomPins[i];
      const rightPin = bottomPins[i + 1];
      const slotCenterX = (leftPin.x + rightPin.x) / 2;
      slotPositions.push({ x: slotCenterX, index: i });
    }
  } else {
    // 回退到原来的计算方式
    const baseSize = Math.min(dimensions.width, dimensions.height);
    const slotWidth = baseSize * 0.083;
    const slotStartX = (dimensions.width - slotWidth * 11) / 2;
    for (let i = 0; i < 11; i++) {
      slotPositions.push({ x: slotStartX + i * slotWidth + slotWidth / 2, index: i });
    }
  }

  // 计算球袋宽度（用于渲染）
  const slotCenters = slotPositions.map((item) => item.x);
  const slotWidth = slotPositions.length >= 2
    ? Math.abs(slotPositions[1].x - slotPositions[0].x) * 0.95  // 球袋宽度是钉子间距的80%
    : Math.min(dimensions.width, dimensions.height) * 0.083;  // 回退宽度

  const slotGap = slotPositions.length >= 2
    ? Math.abs(slotPositions[1].x - slotPositions[0].x) * 0.2  // 球袋间隙是钉子间距的20%
    : slotWidth * 0.1;  // 回退间隙

  const slotHeight = Math.max(pinSpacingY * SLOT_BAG_HEIGHT_RATIO, SLOT_BAG_MIN_HEIGHT_PX); // 小分辨率下兜底最小高度，避免球袋视觉过小
  const triangleCornerRadius = getTriangleCornerRadius(triangleGeometry.triangleWidth, triangleGeometry.triangleHeight);
  const renderedTriangleBottomEdgeY = triangleGeometry.triangleBottomY + triangleGeometry.triangleHeight * 0.25 + triangleCornerRadius * 0.35;
  // 球袋 Y 规则：
  // 1) 必须在最底排钉子之下（至少相邻两行高度差 * 0.59）
  // 2) 尽量让球袋底边贴近三角形真实底边
  const bottomPinsForSlots = bottomRowPinsRef.current;
  const bottomPinRowYForSlots = bottomPinsForSlots.length > 0
    ? Math.max(...bottomPinsForSlots.map((pin) => pin.y))
    : NaN;

  // 回退：如果底排钉子尚未就绪，再用三角形真实底边估算
  const realTriangleBottomEdgeY = triangleGeometryRef.current?.realBtmY ?? renderedTriangleBottomEdgeY;
  const minTopBelowPins = Number.isFinite(bottomPinRowYForSlots)
    ? (bottomPinRowYForSlots + pinSpacingY * SLOT_BAG_MIN_TOP_RATIO)
    : NaN;
  const alignBottomTop = realTriangleBottomEdgeY - slotHeight;
  const desiredSlotsTop = Number.isFinite(minTopBelowPins)
    ? Math.max(minTopBelowPins, alignBottomTop)
    : alignBottomTop;
  const slotsMinTop = Number.isFinite(minTopBelowPins) ? minTopBelowPins : undefined;
  // 小屏幕下容器是 overflow-hidden，球袋容易被底部裁剪；使用与球袋高度相关的边距，避免固定像素在不同分辨率下偏差
  const bottomSafeMargin = Math.max(7, slotHeight * 0.08); // 留 4px 兜底，避免球袋底部被裁
  const maxTopWithinViewport = dimensions.height > 0
    ? Math.max(0, dimensions.height - slotHeight - bottomSafeMargin)
    : Number.NaN;
  // 规则优先：当可视区不足时，宁可允许球袋下探，也不破坏 0.59 的基准线
  const safeSlotsTop = dimensions.height > 0
    ? (
      Number.isFinite(minTopBelowPins) && Number.isFinite(maxTopWithinViewport) && minTopBelowPins > maxTopWithinViewport
        ? Math.max(0, minTopBelowPins)
        : clamp(desiredSlotsTop, 0, maxTopWithinViewport)
    )
    : desiredSlotsTop;
  const renderedSlotsTop = resolvedSlotsTop ?? safeSlotsTop;
  const slotSensorHeight = Math.max(8, slotHeight * 0.95);
  const slotSensorWidth = Math.max(8, slotWidth + slotGap * 0.98);
  const slotSensorCenterY = renderedSlotsTop + slotSensorHeight * 0.5 - slotHeight * 0.05;
  const isSlotLayoutReady = resolvedSlotsTop != null;
  const isPlayDisabled = gameState.ballsLeft <= 0;

  useEffect(() => {
    if (dimensions.height <= 0) {
      setResolvedSlotsTop(null);
      return;
    }
    // 每次布局变化先隐藏球袋，等待背景/钉子稳定后再显示
    setResolvedSlotsTop(null);

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        const geom = triangleGeometryRef.current;
        const bottomPins = bottomRowPinsRef.current;
        if (!geom || bottomPins.length < 12) return;
        const bottomPinRowY = bottomPins.length > 0 ? Math.max(...bottomPins.map((pin) => pin.y)) : NaN;
        const realBottomY = geom?.realBtmY ?? renderedTriangleBottomEdgeY;
        const virtualNextPinY = Number.isFinite(bottomPinRowY) ? bottomPinRowY + pinSpacingY : NaN;
        const fallbackCenterY = realBottomY - pinSpacingY * SLOT_BAG_VERTICAL_OFFSET_RATIO + slotHeight * 0.5;
        const centerY = Number.isFinite(virtualNextPinY) ? virtualNextPinY : fallbackCenterY;
        const top = centerY - slotHeight * 0.5;
        const maxTop = Math.max(0, dimensions.height - slotHeight - bottomSafeMargin);
        const minTop = Number.isFinite(bottomPinRowY)
          ? (bottomPinRowY + pinSpacingY * SLOT_BAG_MIN_TOP_RATIO)
          : Number.NaN;
        const safeTop = Number.isFinite(minTop) && minTop > maxTop
          ? Math.max(0, minTop)
          : clamp(top, 0, maxTop);
        setResolvedSlotsTop(safeTop);
      });
    });

    return () => {
      if (raf1) window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [dimensions.height, pinSpacingY, slotHeight, renderedTriangleBottomEdgeY, bottomSafeMargin, slotLayoutRevision]);

  // 绘制完成后复检：确保球袋顶部不高于“最底排钉子 + 0.59 * 行距”的限制线
  useEffect(() => {
    if (resolvedSlotsTop == null) return;
    let rafId = 0;
    rafId = window.requestAnimationFrame(() => {
      const bottomPins = bottomRowPinsRef.current;
      if (bottomPins.length < 12) return;
      const bottomPinRowY = Math.max(...bottomPins.map((pin) => pin.y));
      const minAllowedTop = bottomPinRowY + pinSpacingY * SLOT_BAG_MIN_TOP_RATIO;
      if (resolvedSlotsTop < minAllowedTop) {
        const maxTop = Math.max(0, dimensions.height - slotHeight - bottomSafeMargin);
        const correctedTop = minAllowedTop > maxTop
          ? minAllowedTop
          : clamp(minAllowedTop, 0, maxTop);
        if (correctedTop > resolvedSlotsTop) {
          setResolvedSlotsTop(correctedTop);
        }
      }
    });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [resolvedSlotsTop, pinSpacingY, slotHeight, bottomSafeMargin, dimensions.height]);

  // 跟随二次确认后的球袋布局，动态对齐槽位碰撞器，保证显示与物理一致
  useEffect(() => {
    const sensors = slotSensorsRef.current;
    if (!engineRef.current || sensors.length === 0) return;
    if (!Number.isFinite(slotSensorCenterY)) return;
    if (slotCenters.length === 0) return;

    sensors.forEach((sensor, index) => {
      const centerX = slotCenters[index];
      if (!sensor || !Number.isFinite(centerX)) return;
      Matter.Body.setPosition(sensor, { x: centerX, y: slotSensorCenterY });
    });
  }, [slotCenters, slotSensorCenterY, slotLayoutRevision]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDimensions({ width: rect.width, height: rect.height });
        }
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    const timeout = setTimeout(updateDimensions, 100);
    // 使用ResizeObserver监听容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(timeout);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: PLINKO_PHYSICS_CONFIG.world.gravityY },
      enableSleeping: false
    });
    // 大幅提高迭代次数以确保碰撞精度和稳定性
    // 真实的物理模拟需要更高的精度来避免卡顿
    engine.positionIterations = 30;
    engine.velocityIterations = 25;
    engine.constraintIterations = 12;

    engineRef.current = engine;

    const pins: Matter.Body[] = [];
    const slotSensors: Matter.Body[] = [];
    const bottomPinBarriers: Matter.Body[] = [];
    bottomRowPinsRef.current = [];
    // 使用提取的函数计算三角形几何（与渲染时一致）
    const {
      triangleX,
      triangleY,
      triangleWidth,
      triangleHeight,
      triangleBottomY
    } = calculateTriangleGeometry(width, height);

    const restitutionScale = getRestitutionScaleByTriangleWidth(triangleWidth);

    // 存储到ref供渲染使用
    triangleGeometryRef.current = {
      triangleX,
      triangleY,
      triangleWidth,
      triangleHeight,
      triangleBottomY,
      triangleTopY: triangleY,
      realBtmY: triangleBottomY
    };

    const cornerRadius = getTriangleCornerRadius(triangleWidth, triangleHeight);
    const bottomOffsetY = triangleHeight * 0.25; // 底边向下偏移25%
    let realBtmY = triangleBottomY + bottomOffsetY + cornerRadius * 0.35;

    // 基于三角形背景的钉子布局 - 位置相对固定，大小跟随
    const pinDiameter = triangleWidth * 0.035; // 钉子直径跟随三角形宽度缩放
    const pinRadius = pinDiameter / 3;
    const pinSpacingX = triangleWidth * 0.11; // 钉子水平间距跟随三角形宽度缩放
    const pinSpacingY = triangleHeight * 0.092; // 钉子垂直间距跟随三角形高度缩放

    // 首先获取三角形面板的位置和尺寸
    const trianglePanel = {
      x: triangleX,
      y: triangleY,
      width: triangleWidth,
      height: triangleHeight
    };

    // 以三角形面板位置为基础创建钉子
    // 计算三角形面板内的钉子起始位置（只计算一次）
    const panelStartX = trianglePanel.x; // 三角形面板左上角X
    const panelStartY = trianglePanel.y; // 三角形面板左上角Y
    const firstRowStartY = panelStartY - trianglePanel.height * 0.02; // 第一行钉子的Y位置

    let pinGlobalIndex = 0;
    for (let row = 0; row < ROWS; row++) {
      const pinsInRow = row + 2;
      const rowWidth = (pinsInRow - 1) * pinSpacingX;
      const startX = panelStartX + (trianglePanel.width - rowWidth) / 2; // 基于三角形面板居中
      const startY = firstRowStartY; // 使用第一行的起始Y位置

      for (let col = 0; col < pinsInRow; col++) {
        // 基于三角形面板位置计算钉子位置
        const pinX = startX + col * pinSpacingX;
        const pinY = startY + row * pinSpacingY;

        const pin = Matter.Bodies.circle(
          pinX,
          pinY,
          pinRadius, // 使用缩放后的半径
          {
            isStatic: true,
            // 调小弹性，并随分辨率（triangleWidth）做缩放，保持不同屏幕手感一致
            restitution: (
              PLINKO_PHYSICS_CONFIG.pin.restitutionBase
              + (Math.random() * PLINKO_PHYSICS_CONFIG.pin.restitutionJitter - PLINKO_PHYSICS_CONFIG.pin.restitutionJitter * 0.5)
            ) * restitutionScale,
            friction: PLINKO_PHYSICS_CONFIG.pin.friction,
            frictionStatic: PLINKO_PHYSICS_CONFIG.pin.frictionStatic,
            label: "pin"
          }
        );
        pin.plugin = {
          ...(pin.plugin ?? {}),
          plinkoPinIndex: pinGlobalIndex
        };
        pinGlobalIndex += 1;

        pins.push(pin);

        // 如果是最底部一排（最后一排），存储钉子位置
        if (row === ROWS - 1) {
          bottomRowPinsRef.current.push({ x: pinX, y: pinY, index: col });

          // 最左和最右边缘钉子下方不加墙，避免影响边缘球袋落球路径
          const isEdgeBottomPin = col === 0 || col === pinsInRow - 1;
          if (!isEdgeBottomPin) {
            const barrierWidth = Math.max(pinDiameter * 1.15, 4);
            const barrierHeight = Math.max(pinSpacingY * 1.18, 8);
            const barrier = Matter.Bodies.rectangle(
              pinX,
              pinY + pinRadius + barrierHeight * 0.5 + 1,
              barrierWidth,
              barrierHeight,
              {
                isStatic: true,
                label: "bottom-pin-barrier",
                restitution: PLINKO_PHYSICS_CONFIG.bottomBarrier.restitution,
                friction: PLINKO_PHYSICS_CONFIG.bottomBarrier.friction,
                slop: 0,
                render: {
                  fillStyle: "transparent",
                  strokeStyle: "transparent",
                  lineWidth: 0
                }
              }
            );
            bottomPinBarriers.push(barrier);
          }
        }
      }
    }

    // 为每个球袋创建触发器：球碰到即判定落袋
    if (bottomRowPinsRef.current.length >= 12) {
      const slotCount = bottomRowPinsRef.current.length - 1;
      for (let i = 0; i < slotCount; i += 1) {
        const leftPin = bottomRowPinsRef.current[i];
        const rightPin = bottomRowPinsRef.current[i + 1];
        const centerX = (leftPin.x + rightPin.x) / 2;
        const sensor = Matter.Bodies.rectangle(centerX, slotSensorCenterY, slotSensorWidth, slotSensorHeight, {
          isStatic: true,
          isSensor: true,
          label: "slot-sensor",
          render: {
            fillStyle: "transparent",
            strokeStyle: "transparent",
            lineWidth: 0
          }
        });
        sensor.plugin = {
          ...(sensor.plugin ?? {}),
          plinkoSlotIndex: i // 0-based 槽位索引
        };
        slotSensors.push(sensor);
      }
    }
    slotSensorsRef.current = slotSensors;

    // 创建圆角三角形墙壁，包围所有钉子
    // 三角形顶点（扩展以包围钉子，腰长增长，底边缩短，整体向下偏移）
    const wallOffsetY = triangleHeight * 0.12; // 向下偏移12%
    const topLowerOffsetY = triangleHeight * 0.06; // 顶部额外下移3%
    const triangleTopY = triangleY - triangleHeight * 0.05 + wallOffsetY + topLowerOffsetY;
    const triangleLeftX = triangleX - triangleWidth * 0.42; // 向左扩展45%（腰长增长）
    const triangleRightX = triangleX + triangleWidth * 1.42; // 向右扩展45%（腰长增长）
    const bottomShrink = triangleWidth * 0.25; // 底部向内收缩26%（底边缩短）
    realBtmY = triangleBottomY + bottomOffsetY + cornerRadius * 0.35;

    // 保存到ref供dropBall使用
    triangleGeometryRef.current = {
      triangleX,
      triangleY,
      triangleWidth,
      triangleHeight,
      triangleBottomY,
      triangleTopY,
      realBtmY
    };
    setSlotLayoutRevision((v) => v + 1);

    // 计算圆角三角形的顶点（提高细分让圆角更平滑）
    const createRoundedCorner = (centerX: number, centerY: number, startAngle: number, endAngle: number, radius: number) => {
      const points = [];
      const segments = 10;
      for (let i = 0; i <= segments; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / segments);
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      }
      return points;
    };

    // 三角形三个顶点
    const topCorner = { x: triangleX + triangleWidth / 2, y: triangleTopY };
    const leftCorner = { x: triangleLeftX + bottomShrink, y: triangleBottomY + bottomOffsetY }; // 向内收缩并下移
    const rightCorner = { x: triangleRightX - bottomShrink, y: triangleBottomY + bottomOffsetY }; // 向内收缩并下移

    // 构建圆角三角形顶点路径（3个角分别使用3个独立圆弧）
    const topCornerArc = createRoundedCorner(
      topCorner.x,
      topCorner.y + cornerRadius,
      -Math.PI * 1.15,
      -Math.PI * 0.15,
      cornerRadius
    );

    const rightCornerArc = createRoundedCorner(
      rightCorner.x - cornerRadius,
      rightCorner.y - cornerRadius,
      -Math.PI * 0.1,
      Math.PI * 0.55,
      cornerRadius
    );

    const leftCornerArc = createRoundedCorner(
      leftCorner.x + cornerRadius,
      leftCorner.y - cornerRadius,
      Math.PI * 0.45,
      Math.PI * 1.1,
      cornerRadius
    );

    const roundedTriangleVertices = [
      ...topCornerArc,
      { x: rightCorner.x - cornerRadius * 0.45, y: rightCorner.y - cornerRadius * 1.35 },
      ...rightCornerArc,
      { x: (leftCorner.x + rightCorner.x) / 2, y: triangleBottomY + cornerRadius * 0.35 },
      ...leftCornerArc,
      { x: leftCorner.x + cornerRadius * 0.45, y: leftCorner.y - cornerRadius * 1.35 }
    ];

    // 创建圆角三角形墙壁（仅用于背景绘制，保持现有绘制逻辑）
    const roundedTriangleWall = Matter.Bodies.fromVertices(
      (triangleLeftX + triangleRightX) / 2,
      (triangleTopY + triangleBottomY) / 2,
      [roundedTriangleVertices],
      {
        isStatic: true,
        isSensor: true,
        label: "wall-triangle",
        restitution: PLINKO_PHYSICS_CONFIG.wall.restitution,
        friction: PLINKO_PHYSICS_CONFIG.wall.friction,
        collisionFilter: {
          mask: 0
        },
        render: {
          fillStyle: "transparent",
          strokeStyle: "transparent",
          lineWidth: 0
        }
      }
    );

    // 用矩形段构造碰撞墙：
    // 1) 顶部两个钉子上方1倍钉子纵向间距的三面矩形墙
    // 2) 底部左右顶点钉子向外的短斜墙（长度=1.5倍钉子纵向间距）
    // 3) 将首尾连接，形成完整包围
    const topRowStartX = panelStartX + (trianglePanel.width - pinSpacingX) / 2;
    const topRowY = firstRowStartY - 20;
    const topLeftPin = { x: topRowStartX, y: topRowY };
    const topRightPin = { x: topRowStartX + pinSpacingX, y: topRowY };

    const bottomRowPins = ROWS + 1;
    const bottomRowWidth = (bottomRowPins - 1) * pinSpacingX;
    const bottomRowStartX = panelStartX + (trianglePanel.width - bottomRowWidth) / 2;
    const bottomRowY = firstRowStartY + (ROWS - 1) * pinSpacingY;
    const bottomLeftPin = { x: bottomRowStartX, y: bottomRowY };
    const bottomRightPin = { x: bottomRowStartX + (bottomRowPins - 1) * pinSpacingX, y: bottomRowY };

    // 顶部墙向上加高，避免个别分辨率下球出现在墙体之上
    const topWallY = topRowY - pinSpacingY * 1.7;
    const topWallBottomY = topRowY;
    const topWallLeftX = topLeftPin.x - pinSpacingX;
    const topWallRightX = topRightPin.x + pinSpacingX;

    const shortWallLength = pinSpacingY * 1.5;
    const shortWallExtendDown = pinSpacingY * 0.9;
    const shortWallAngle = (80 * Math.PI) / 180;  //墙的倾斜度
    const shortWallVerticalOffset = pinSpacingY * 2;
    const rightShortWallBaseStart = {
      x: bottomRightPin.x + pinSpacingX * 0.5,
      y: bottomRightPin.y + shortWallVerticalOffset / 3
    };
    const leftShortWallBaseStart = {
      x: bottomLeftPin.x - pinSpacingX * 0.5,
      y: bottomLeftPin.y + shortWallVerticalOffset / 3
    };
    const rightShortWallEnd = {
      x: rightShortWallBaseStart.x + Math.cos(shortWallAngle) * shortWallLength,
      y: rightShortWallBaseStart.y - Math.sin(shortWallAngle) * shortWallLength
    };
    const leftShortWallEnd = {
      x: leftShortWallBaseStart.x - Math.cos(shortWallAngle) * shortWallLength,
      y: leftShortWallBaseStart.y - Math.sin(shortWallAngle) * shortWallLength
    };
    // 仅向底部延长斜墙：保持顶部端点不变，把底部端点沿原方向向下拉长
    const rightDirX = rightShortWallBaseStart.x - rightShortWallEnd.x;
    const rightDirY = rightShortWallBaseStart.y - rightShortWallEnd.y;
    const rightDirLen = Math.hypot(rightDirX, rightDirY) || 1;
    const rightShortWallStart = {
      x: rightShortWallBaseStart.x + (rightDirX / rightDirLen) * shortWallExtendDown,
      y: rightShortWallBaseStart.y + (rightDirY / rightDirLen) * shortWallExtendDown
    };
    const leftDirX = leftShortWallBaseStart.x - leftShortWallEnd.x;
    const leftDirY = leftShortWallBaseStart.y - leftShortWallEnd.y;
    const leftDirLen = Math.hypot(leftDirX, leftDirY) || 1;
    const leftShortWallStart = {
      x: leftShortWallBaseStart.x + (leftDirX / leftDirLen) * shortWallExtendDown,
      y: leftShortWallBaseStart.y + (leftDirY / leftDirLen) * shortWallExtendDown
    };

    const segmentThickness = Math.max(8, pinSpacingY * 0.55);
    const collisionSegments: Array<[{ x: number; y: number }, { x: number; y: number }]> = [
      [{ x: topWallLeftX, y: topWallBottomY }, { x: topWallLeftX, y: topWallY }],
      [{ x: topWallLeftX, y: topWallY }, { x: topWallRightX, y: topWallY }],
      [{ x: topWallRightX, y: topWallY }, { x: topWallRightX, y: topWallBottomY }],
      [{ x: topWallRightX, y: topWallBottomY }, rightShortWallEnd],
      [rightShortWallEnd, rightShortWallStart],
      [{ x: topWallLeftX, y: topWallBottomY }, leftShortWallEnd],
      [leftShortWallEnd, leftShortWallStart]
    ];
    const segmentWalls = collisionSegments.map(([from, to]) => {
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const length = Math.hypot(to.x - from.x, to.y - from.y);
      const angle = Math.atan2(to.y - from.y, to.x - from.x);

      return Matter.Bodies.rectangle(midX, midY, length, segmentThickness, {
        isStatic: true,
        angle,
        label: "wall-triangle-segment",
        restitution: PLINKO_PHYSICS_CONFIG.wall.restitution,
        friction: PLINKO_PHYSICS_CONFIG.wall.friction,
        render: {
          fillStyle: "transparent",
          strokeStyle: "transparent",
          lineWidth: 0
        }
      });
    });

    const walls = [roundedTriangleWall, ...segmentWalls];

    Matter.Composite.add(engine.world, [...pins, ...walls, ...slotSensors, ...bottomPinBarriers]);
    pinBodiesRef.current = pins;

    Matter.Events.on(engine, "collisionStart", (event: Matter.IEventCollision<Matter.Engine>) => {
      event.pairs.forEach((pair: Matter.Pair) => {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        if (labels.includes("ball") && labels.includes("pin")) {
          const pin = pair.bodyA.label === "pin" ? pair.bodyA : pair.bodyB;
          const ball = pair.bodyA.label === "ball" ? pair.bodyA : pair.bodyB;
          const meta = (ball.plugin?.plinkoMeta as BallMeta | undefined) ?? null;
          const isHiddenBall = meta?.hidden === true;

          const now = performance.now();

          // 仅非回放球使用碰撞高亮；回放球由时间轴触发高亮
          const isReplayBall = !isHiddenBall && !!meta && meta.trajectoryPoints.length > 0;
          if (!isHiddenBall && !isReplayBall) {
            const key = `${Math.round(pin.position.x)},${Math.round(pin.position.y)}`;
            const lastGlowAt = glowingPinCooldownRef.current.get(key) ?? 0;
            if (now - lastGlowAt >= PIN_BOUNCE_SOUND_COOLDOWN_MS) {
              glowingPinsRef.current.set(key, {
                x: pin.position.x,
                y: pin.position.y,
                intensity: 1.0
              });
              glowingPinCooldownRef.current.set(key, now);
            }
          }

          const pinIndexRaw = (pin.plugin as { plinkoPinIndex?: unknown } | undefined)?.plinkoPinIndex;
          const pinIndex = typeof pinIndexRaw === "number" && Number.isFinite(pinIndexRaw)
            ? Math.max(0, Math.floor(pinIndexRaw))
            : -1;

          // 记录轨迹点（相对于三角形的位置）
          if (meta) {
            const geom = triangleGeometryRef.current;
            if (geom) {
              // 计算相对于三角形的位置比例
              const relX = (ball.position.x - geom.triangleX) / geom.triangleWidth;
              const relY = (ball.position.y - geom.triangleY) / geom.triangleHeight;

              // 记录轨迹点
              const point = {
                x: clamp(
                  relX,
                  -PLINKO_TRAJECTORY_CONFIG.edgeOverscanRatio,
                  1 + PLINKO_TRAJECTORY_CONFIG.edgeOverscanRatio
                ),
                y: Math.max(0, Math.min(1, relY)),
                hit: true,
                pinIndex: pinIndex >= 0 ? pinIndex : undefined
              };

              // 隐藏球：记录到physicsPath用于后续生成轨迹
              if (isHiddenBall && !meta.hiddenSettled && meta.physicsPath) {
                meta.lastPinContactAt = now;
                meta.lastPinContactX = pin.position.x;
                meta.physicsPath.push({
                  x: point.x,
                  y: point.y,
                  hit: true,
                  pinIndex: point.pinIndex,
                  timestamp: meta.hiddenPhysicsElapsedMs ?? 0
                });
                meta.hiddenHighPrecisionUntilMs = Math.max(
                  meta.hiddenHighPrecisionUntilMs ?? 0,
                  (meta.hiddenPhysicsElapsedMs ?? 0) + PLINKO_TRAJECTORY_CONFIG.hiddenRecordingPostHitWindowMs
                );
              }

              // 碰撞计数用于音效
              if (!isHiddenBall && !isReplayBall) {
                const gapMs = now - meta.lastHitTime;
                if (gapMs >= PIN_BOUNCE_SOUND_COOLDOWN_MS) {
                  meta.hitCount++;
                  meta.lastHitTime = now;
                  const vx = ball.velocity.x;
                  const vy = ball.velocity.y;
                  const speed = Math.hypot(vx, vy);
                  const deltaSpeed = meta.lastBounceSpeed != null ? Math.abs(speed - meta.lastBounceSpeed) : 0;
                  meta.lastBounceSpeed = speed;
                  const normal = pair.collision.normal;
                  const nx = normal?.x ?? 0;
                  const ny = normal?.y ?? -1;
                  const normalSpeed = Math.abs(vx * nx + vy * ny);
                  const tangentSpeed = Math.abs(vx * -ny + vy * nx);
                  const lateralRatio = speed > 0.0001 ? clamp(vx / speed, -1, 1) : 0;
                  const impact = clamp((normalSpeed - 0.14) / 2.5, 0, 1);
                  const glide = clamp(tangentSpeed / 3.1, 0, 1);
                  const delta = clamp(deltaSpeed / 2.1, 0, 1);
                  const cadence = clamp((150 - gapMs) / 78, 0, 1);
                  const latticePhase = pinIndex >= 0
                    ? Math.sin(pinIndex * 0.93 + meta.hitCount * 0.81)
                    : Math.sin(meta.hitCount * 0.81)
                  ;
                  const latticeAccent = 0.5 + latticePhase * 0.5;
                  const bodyAccent = clamp(impact * 0.56 + delta * 0.2 + cadence * 0.14 + latticeAccent * 0.1, 0, 1);
                  const brightness = clamp(impact * 0.34 + glide * 0.46 + (lateralRatio * 0.5 + 0.5) * 0.2, 0, 1);
                  const transient = clamp(impact * 0.52 + delta * 0.28 + cadence * 0.2, 0, 1);
                  const shaped = Math.pow(
                    clamp(impact * 0.58 + glide * 0.16 + delta * 0.16 + cadence * 0.1, 0, 1),
                    0.76
                  );
                  const rapidSoftBounce = gapMs < 118 && shaped < 0.34 && transient < 0.42;
                  if (!rapidSoftBounce) {
                    const pinBounceVolumeScale = 0.62;
                    const pinBounceDynamics = 10;
                    const minVolume = 0.003;
                    const maxVolume = 0.9;
                    // Gate low-impact collisions so tiny momentum hits don't sound unexpectedly loud.
                    const impactGate = Math.pow(
                      clamp((impact - 0.08) / 0.92, 0, 1),
                      1.1 + 0.45 * pinBounceDynamics
                    );
                    const impactEnergy = Math.pow(impactGate, 1.1 + 0.55 * pinBounceDynamics);
                    const volumeShape = Math.pow(clamp(shaped * 0.35 + impactEnergy * 0.65, 0, 1), 1.7);
                    const silenceGate = Math.pow(clamp((impactEnergy - 0.045) / 0.955, 0, 1), 0.8);
                    const lowMomentumDamping = (0.08 + impactEnergy * 0.92) * silenceGate;
                    const softCollisionDamping = (0.26 + Math.pow(shaped, 1.2) * 0.34) * lowMomentumDamping;
                    const impactWeightedAccent = impact * 0.82 + bodyAccent * 0.18;
                    const volume = minVolume
                      * Math.pow(maxVolume / minVolume, volumeShape)
                      * (0.48 + impactWeightedAccent * 0.18)
                      * softCollisionDamping
                      * pinBounceVolumeScale;
                    const impactRate = Math.pow(impactGate, 0.85);
                    const baseRate = clamp(
                      0.84
                      + impactRate * 0.24
                      + brightness * 0.08
                      + lateralRatio * 0.05
                      + (Math.random() - 0.5) * 0.028,
                      0.84,
                      1.15
                    );
                    const detuneCents = Math.max(-90, Math.min(90, lateralRatio * 36 + (glide - 0.5) * 28 + (Math.random() - 0.5) * 14));
                    const soundBrightness = clamp(brightness * (0.2 + impactGate * 0.8), 0, 1);
                    const soundTransient = clamp(transient * (0.28 + impactGate * 0.72), 0, 1);
                    playSound("bounce", {
                      volume,
                      playbackRate: baseRate,
                      brightness: soundBrightness,
                      transient: soundTransient,
                      accent: bodyAccent,
                      detuneCents
                    });
                    vibrate("light");
                  }
                }
              }
            }
          }
        }
        if (labels.includes("ball") && labels.includes("slot-sensor")) {
          const ball = pair.bodyA.label === "ball" ? pair.bodyA : pair.bodyB;
          const sensor = pair.bodyA.label === "slot-sensor" ? pair.bodyA : pair.bodyB;
          const meta = (ball.plugin?.plinkoMeta as BallMeta | undefined) ?? null;
          const slotIndexRaw = (sensor.plugin as { plinkoSlotIndex?: unknown } | undefined)?.plinkoSlotIndex;
          const slotIndex = typeof slotIndexRaw === "number" && Number.isFinite(slotIndexRaw)
            ? Math.max(0, Math.floor(slotIndexRaw))
            : -1;
          if (slotIndex < 0 || slotIndex >= slotMultipliersRef.current.length) return;

          if (!meta) return;
          if (meta.hidden !== true) return;

          if (meta.hiddenSettled === true || !meta.physicsPath) return;

          // 落袋后立即结算并停止记录，避免袋内/袋后轨迹污染样本
          meta.hiddenPendingSlotIndex = slotIndex;
          meta.hiddenSettledSlotIndex = slotIndex;
          meta.hiddenSettledAt = meta.hiddenPhysicsElapsedMs ?? 0;
          meta.hiddenSettled = true;
        }
        // Hard bounce effect on walls
        if (labels.includes("ball") && (labels.includes("wall-triangle") || labels.includes("wall-triangle-segment"))) {
          const ball = pair.bodyA.label === "ball" ? pair.bodyA : pair.bodyB;
          const meta = (ball.plugin?.plinkoMeta as BallMeta | undefined) ?? null;
          if (meta?.hidden !== true) {
            const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
            const momentum = (ball.mass ?? 1) * speed;
            const intensity = clamp((momentum - 0.15) / 2.9, 0, 1);
            const shaped = Math.pow(intensity, 0.55);
            const minVolume = 0.04;
            const maxVolume = 1.35;
            const volume = minVolume * Math.pow(maxVolume / minVolume, shaped);
            playSound("bounce", {
              volume,
              playbackRate: 0.88 + shaped * 0.24
            });
            vibrate("medium");
          }
        }
      });
    });

    setIsReady(true);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      Matter.Engine.clear(engine);
      Matter.Composite.clear(engine.world, false);
      pinBodiesRef.current = [];
      slotSensorsRef.current = [];
      engineRef.current = null;
      startupWarmupStartedRef.current = false;
      setIsReady(false);
    };
  }, [dimensions, playSound, vibrate, nextRandom]);

  useEffect(() => {
    if (!isReady || !engineRef.current || !canvasRef.current) return;

    const engine = engineRef.current;
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const bgCtx = bgCanvas?.getContext("2d");
    if (!ctx || !bgCtx) return;

    const { width, height } = dimensions;

    // 使用与渲染一致的球袋中心，确保显示/判定一致
    const renderSlotCenters = slotCenters.length === slotMultipliers.length
      ? slotCenters
      : (() => {
        const fallbackWidth = Math.min(width, height) * 0.083;
        const fallbackStartX = (width - fallbackWidth * slotMultipliers.length) / 2;
        return Array.from({ length: slotMultipliers.length }, (_, i) => fallbackStartX + i * fallbackWidth + fallbackWidth / 2);
      })();

    let lastTime = performance.now();
    let accumulator = 0;

    const loop = () => {
      const currentTime = performance.now();
      const delta = Math.min(50, currentTime - lastTime);
      lastTime = currentTime;

      const hiddenBallsForSampling = Matter.Composite
        .allBodies(engine.world)
        .filter((body) => body.label === "ball" && ((body.plugin?.plinkoMeta as BallMeta | undefined)?.hidden))
      ;
      const hasHiddenBalls = hiddenBallsForSampling.length > 0;
      const stepMs = hasHiddenBalls ? HIDDEN_RECORDING_TIME_STEP_MS : DEFAULT_FIXED_TIME_STEP_MS;
      const maxSubSteps = hasHiddenBalls ? HIDDEN_RECORDING_MAX_SUB_STEPS_PER_FRAME : MAX_SUB_STEPS_PER_FRAME;
      accumulator += delta;
      let steps = 0;
      while (accumulator >= stepMs && (DETERMINISTIC_MODE || steps < maxSubSteps)) {
        const hiddenBalls = Matter.Composite
          .allBodies(engine.world)
          .filter((body) => body.label === "ball" && ((body.plugin?.plinkoMeta as BallMeta | undefined)?.hidden));
        hiddenBalls.forEach((body) => {
          const meta = (body.plugin?.plinkoMeta as BallMeta | undefined) ?? null;
          if (!meta || meta.hiddenSettled || !meta.physicsPath) return;
          meta.hiddenPhysicsElapsedMs = (meta.hiddenPhysicsElapsedMs ?? 0) + stepMs;
        });
        Matter.Engine.update(engine, stepMs);
        hiddenBalls.forEach((body) => {
          const meta = (body.plugin?.plinkoMeta as BallMeta | undefined) ?? null;
          const geom = triangleGeometryRef.current;
          if (!meta || !geom || meta.hiddenSettled || !meta.physicsPath) return;
          const relX = clamp(
            (body.position.x - geom.triangleX) / geom.triangleWidth,
            -PLINKO_TRAJECTORY_CONFIG.edgeOverscanRatio,
            1 + PLINKO_TRAJECTORY_CONFIG.edgeOverscanRatio
          );
          const relY = (body.position.y - geom.triangleY) / geom.triangleHeight;
          meta.physicsPath.push({
            x: relX,
            y: relY,
            hit: false,
            timestamp: meta.hiddenPhysicsElapsedMs ?? 0
          });

          // 移除防卡顿机制 - 通过优化物理参数从根本上解决问题
          // 真实的弹珠游戏不应该需要防卡顿机制
        });
        accumulator -= stepMs;
        steps += 1;
      }
      if (!DETERMINISTIC_MODE && !hasHiddenBalls && steps >= maxSubSteps && accumulator > stepMs * 4) {
        accumulator = stepMs * 2;
      }

      // 轨迹跟随：每渲染帧只执行一次（不依赖物理子步数量）
      const updateTrajectoryPositions = (frameDeltaMs: number) => {
        const now = performance.now();
        const replayDeltaMs = Math.max(0, Math.min(frameDeltaMs, 50));
        const highlightPinByIndex = (pinIndex: number) => {
          const pins = Matter.Composite.allBodies(engine.world).filter(
            (body: Matter.Body) => body.label === "pin"
          );
          const targetPin = pins.find((pin: Matter.Body) => {
            const idx = (pin.plugin as { plinkoPinIndex?: number } | undefined)?.plinkoPinIndex;
            return idx === pinIndex;
          });
          if (!targetPin) return;
          const pinKey = `${Math.round(targetPin.position.x)},${Math.round(targetPin.position.y)}`;
          const lastGlowAt = glowingPinCooldownRef.current.get(pinKey) ?? 0;
          if (now - lastGlowAt < PIN_BOUNCE_SOUND_COOLDOWN_MS) return false;
          glowingPinsRef.current.set(pinKey, {
            x: targetPin.position.x,
            y: targetPin.position.y,
            intensity: 1.0
          });
          glowingPinCooldownRef.current.set(pinKey, now);
          return true;
        };
        const triggerReplayBounce = (meta: BallMeta) => {
          if (now - meta.lastHitTime < PIN_BOUNCE_SOUND_COOLDOWN_MS) return;
          meta.hitCount += 1;
          meta.lastHitTime = now;
          playSound("bounce", {
            volume: 0.55,
            playbackRate: 1
          });
          vibrate("light");
        };
        const trajectoryBalls = Matter.Composite.allBodies(engine.world).filter(
          (body: Matter.Body) => body.label === "ball"
        );

        trajectoryBalls.forEach((ball: Matter.Body, index: number) => {
          const meta = (ball.plugin?.plinkoMeta as BallMeta | undefined) ?? null;
          if (!meta) return;

          // 隐藏球：轨迹采样已改为固定物理步记录
          if (meta.hidden) {
            return;
          }

          // 调试：检查轨迹点数量
          if (meta.trajectoryPoints.length === 0) {
            console.log(`[Ball ${index}] 没有轨迹点，走物理模拟`);
            return;
          }

          const geom = triangleGeometryRef.current;
          if (!geom) return;

          // 禁用物理
          if (!ball.isStatic) {
            Matter.Body.setStatic(ball, true);
          }

          // 回放进度按受控帧增量推进，避免卡顿时直接跳到轨迹末尾
          if (meta.trajectoryElapsedMs == null) {
            meta.trajectoryElapsedMs = 0;
            if (meta.trajectoryStartTime == null) {
              meta.trajectoryStartTime = now;
            }
          } else {
            meta.trajectoryElapsedMs += replayDeltaMs;
          }
          const elapsedMs = meta.trajectoryElapsedMs;

          // 找到当前时间应该处于哪两个轨迹点之间（按时间差匹配）
          let prevIndex = -1;
          let nextIndex = -1;

          for (let i = 0; i < meta.trajectoryPoints.length; i++) {
            const pointTime = meta.trajectoryPoints[i].timestamp ?? 0;
            if (pointTime <= elapsedMs) {
              prevIndex = i;
            } else {
              nextIndex = i;
              break;
            }
          }

          // 边界：早于首点 -> 贴首点；晚于末点 -> 贴末点
          if (prevIndex < 0) {
            const firstPoint = meta.trajectoryPoints[0];
            Matter.Body.setPosition(ball, {
              x: geom.triangleX + firstPoint.x * geom.triangleWidth,
              y: geom.triangleY + firstPoint.y * geom.triangleHeight
            });
            meta.trajectoryCursor = 0;
            return;
          }
          if (nextIndex < 0 || prevIndex >= meta.trajectoryPoints.length - 1) {
            const lastPoint = meta.trajectoryPoints[meta.trajectoryPoints.length - 1];
            const lastPointTime = lastPoint.timestamp ?? elapsedMs;
            const settleDurationMs = 180;
            const settleProgress = Math.max(0, Math.min(1, (elapsedMs - lastPointTime) / settleDurationMs));
            const targetSlotIndex = meta.targetSlotIndex;
            const lastAbsX = geom.triangleX + lastPoint.x * geom.triangleWidth;
            const lastAbsY = geom.triangleY + lastPoint.y * geom.triangleHeight;
            const bagTargetX = targetSlotIndex != null && targetSlotIndex >= 0 && targetSlotIndex < renderSlotCenters.length
              ? (renderSlotCenters[targetSlotIndex] ?? lastAbsX)
              : lastAbsX;
            const bagTop = meta.visibleBagTop ?? renderedSlotsTop;
            const bagTargetY = bagTop + slotHeight * 0.56;
            Matter.Body.setPosition(ball, {
              x: lerp(lastAbsX, bagTargetX, settleProgress),
              y: lerp(lastAbsY, bagTargetY, settleProgress)
            });
            while (meta.trajectoryCursor < meta.trajectoryPoints.length) {
              const point = meta.trajectoryPoints[meta.trajectoryCursor];
              if (point.hit && point.pinIndex !== undefined) {
                highlightPinByIndex(point.pinIndex);
                triggerReplayBounce(meta);
              }
              meta.trajectoryCursor += 1;
            }
            if (
              settleProgress >= 1 &&
              meta.targetSlotIndex != null &&
              meta.targetSlotIndex >= 0 &&
              meta.targetSlotIndex < slotMultipliers.length
            ) {
              meta.trajectoryCompleted = true;
            }
            return;
          }

          // 正常区间：在相邻时间点之间做线性插值
          if (prevIndex >= 0 && nextIndex >= 0 && nextIndex < meta.trajectoryPoints.length) {
            const prevPoint = meta.trajectoryPoints[prevIndex];
            const nextPoint = meta.trajectoryPoints[nextIndex];

            const prevTime = prevPoint.timestamp ?? 0;
            const nextTime = nextPoint.timestamp ?? prevTime + 16; // 默认16ms

            // 计算插值比例（0-1）
            const timeRange = nextTime - prevTime;
            const t = timeRange > 0 ? (elapsedMs - prevTime) / timeRange : 0;
            const clampedT = Math.max(0, Math.min(1, t));

            // 使用线性插值（无过冲），避免平滑曲线在边缘段产生“直落/穿钉”伪影
            const interpX = lerp(prevPoint.x, nextPoint.x, clampedT);
            const interpY = lerp(prevPoint.y, nextPoint.y, clampedT);

            const targetAbsX = geom.triangleX + interpX * geom.triangleWidth;
            const targetAbsY = geom.triangleY + interpY * geom.triangleHeight;
            Matter.Body.setPosition(ball, { x: targetAbsX, y: targetAbsY });

            // 基于“时间跨越”触发高亮：每个 hit 点只触发一次
            while (meta.trajectoryCursor < meta.trajectoryPoints.length) {
              const point = meta.trajectoryPoints[meta.trajectoryCursor];
              const pointTime = point.timestamp ?? 0;
              if (pointTime > elapsedMs) {
                break;
              }
              if (point.hit && point.pinIndex !== undefined) {
                const didHighlight = highlightPinByIndex(point.pinIndex);
                if (didHighlight) {
                  triggerReplayBounce(meta);
                }
              }
              meta.trajectoryCursor += 1;
            }

            // 调试输出
            if (index === 0 || index === 1) {
              //console.log(`[Ball ${index}] elapsed=${elapsedMs.toFixed(1)}ms, prev=${prevIndex}, next=${nextIndex}, t=${clampedT.toFixed(2)}`);
            }
          }
        });
      };

      // 物理更新后，执行轨迹跟随（每渲染帧一次）
      updateTrajectoryPositions(delta);

      const balls = Matter.Composite.allBodies(engine.world).filter(
        (body: Matter.Body) => body.label === "ball"
      );

      balls.forEach((ball: Matter.Body) => {
        let shouldRemoveBall = false;
        const meta = (ball.plugin?.plinkoMeta as BallMeta | undefined) ?? null;
        const isHiddenBall = meta?.hidden === true;

        // 可见球：在物理帧中处理轨迹点（通过 beforeUpdate 事件已处理）
        // 这里只处理到达目标后的逻辑和落袋检测

        // 移除旧的引导修正逻辑（使用轨迹点后不再需要）
        // if (meta && !isHiddenBall && Math.abs(meta.pendingCorrectionX) > 1e-5) { ... }

        // 可见球：轨迹走完后直接落袋（不参与位置判断）
        if (meta && !isHiddenBall) {
          if (!meta.visibleSettled) {
            const visibleAliveMs = meta.trajectoryStartTime != null ? (performance.now() - meta.trajectoryStartTime) : 0;
            const bagTop = meta.visibleBagTop ?? renderedSlotsTop;
            if (visibleAliveMs > 12000 && !meta.trajectoryCompleted) {
              console.warn("[Ball] Force completing stuck visible ball after 12s");
              meta.trajectoryCompleted = true;
              Matter.Body.setPosition(ball, { x: ball.position.x, y: bagTop + slotHeight * 0.56 });
            }

            const bagEntryY = bagTop + slotHeight * 0.22;
            const hasEnteredBagArea = (ball.position.y + (ball.circleRadius ?? boardBallRadius)) >= bagEntryY;

            // 修复球突然消失的问题：只有在轨迹播放完毕(trajectoryCompleted)且进入落袋区后，才执行落袋结算和销毁。
            // 之前这里判断条件有问题，可能导致还没播放完就被提前结算销毁了。
            if (meta.trajectoryCompleted && hasEnteredBagArea) {
              const hasTargetSlot = meta.assignedSlotIndex != null || meta.targetSlotIndex != null;
              if (hasTargetSlot) {
                const targetSlotIndex = meta.assignedSlotIndex ?? meta.targetSlotIndex ?? 0;
                if (targetSlotIndex >= 0 && targetSlotIndex < slotMultipliers.length) {
                  const finalSlotIndex = targetSlotIndex;
                  const finalMultiplier = meta.rewardMultiplier ?? slotMultipliers[finalSlotIndex] ?? 0;
                  const { currencySymbol } = exchangeRateInfoRef.current;
                  const currency_fiat = currencyFiatRef.current;
                  const amountUsdt = finalMultiplier * BASE_STAKE_USDT;
                  const finalAmount = convertCurrencyRef.current({
                    amount: amountUsdt,
                    fromCurrency: "USDT",
                    toCurrency: currency_fiat,
                    exchangeRates: exchangeRatesRef.current
                  });
                  const displayAmount = formatCurrencyRef.current({
                    amount: finalAmount,
                    currency: currency_fiat,
                    showSymbol: true,
                    showCode: false
                  }).formatted;
                  const colorIndex = getSlotColorIndex(finalSlotIndex, slotMultipliers.length);
                  const slotHighlightColor = plinkoThemePalette.slotHighlights[colorIndex] ?? plinkoThemePalette.slotHighlights[plinkoThemePalette.slotHighlights.length - 1];
                  buddyBallApi.onBallFallDown?.();
                  setActiveSlot(finalSlotIndex);
                  setHighlightColors(prev => ({
                    ...prev,
                    [finalSlotIndex]: plinkoThemePalette.slotHighlights[colorIndex] ?? plinkoThemePalette.slotHighlights[plinkoThemePalette.slotHighlights.length - 1]
                  }));
                  setTimeout(() => setActiveSlot(null), 500);
                  setTimeout(() => setHighlightColors(prev => ({ ...prev, [finalSlotIndex]: "" })), 1800);
                  setWinHistory(prev => [{
                    id: Date.now() + nextRandom(),
                    amount: finalAmount,
                    amountUsdt,
                    displayAmount,
                    currencySymbol,
                    colorBg: plinkoThemePalette.slotBackgrounds[colorIndex] ?? plinkoThemePalette.slotBackgrounds[plinkoThemePalette.slotBackgrounds.length - 1],
                    colorBorder: plinkoThemePalette.slotBorders[colorIndex] ?? plinkoThemePalette.slotBorders[plinkoThemePalette.slotBorders.length - 1],
                    colorNum: plinkoThemePalette.slotText[colorIndex] ?? plinkoThemePalette.slotText[plinkoThemePalette.slotText.length - 1]
                  }, ...prev.slice(0, 14)]);
                  setGameState((prev) => ({ ...prev, lastWin: finalAmount }));
                  const slotCenterX = renderSlotCenters[finalSlotIndex] ?? (width / 2);
                  const slotCenterY = bagTop - slotHeight * 0.5;
                  const isJackpotSlot = finalSlotIndex === slotMultipliers.length - 1;
                  if (isJackpotSlot) {
                    playSound("jackpot");
                    vibrate("success");
                    setGameState((prev) => ({ ...prev, isShaking: true }));
                    setTimeout(() => setGameState((prev) => ({ ...prev, isShaking: false })), 300);
                    setParticles((prev) => [
                      ...prev,
                      ...createParticles(slotCenterX, slotCenterY, slotHighlightColor, 40)
                    ]);
                  } else if (finalMultiplier >= 16) {
                    playSound("win");
                    vibrate("medium");
                    setParticles((prev) => [
                      ...prev,
                      ...createParticles(slotCenterX, slotCenterY, slotHighlightColor, 20)
                    ]);
                  } else {
                    playSound("land");
                    vibrate("light");
                  }
                  meta.visibleSettled = true;
                  shouldRemoveBall = true;
                }
              }
            }
          }
        }

        // 隐藏球落袋判断：按底排钉子索引直接确定袋号
        if (isHiddenBall && meta) {
          if (meta.hiddenSettled && !meta.hiddenTimedOut) {
            // 落袋后、销毁前：按最终槽位写入缓存
            const finalSlotIndex = meta.hiddenSettledSlotIndex ?? meta.hiddenPendingSlotIndex;
            const hiddenAliveMs = meta.hiddenSpawnTime != null ? (performance.now() - meta.hiddenSpawnTime) : 0;
            const isTimeout = hiddenAliveMs >= HIDDEN_BALL_MAX_LIFETIME_MS;

            if (
              !isTimeout &&
              finalSlotIndex != null &&
              finalSlotIndex >= 0 &&
              finalSlotIndex < slotMultipliers.length &&
              meta.physicsPath &&
              meta.physicsPath.length > 0 &&
              isCompleteTrajectory(meta.physicsPath)
            ) {
              const trimmedPhysicsPath = meta.hiddenSettledAt != null
                ? meta.physicsPath.filter((p) => p.timestamp <= meta.hiddenSettledAt!)
                : meta.physicsPath;
              const sourcePath = trimmedPhysicsPath.length > 0 ? trimmedPhysicsPath : meta.physicsPath;
              const firstTimestamp = sourcePath[0]?.timestamp ?? performance.now();
              const trajectoryPoints: TrajectoryPoint[] = ensureStrictlyIncreasingTimestamps(
                sourcePath.map((p) => ({
                  x: p.x,
                  y: p.y,
                  hit: p.hit,
                  pinIndex: p.pinIndex,
                  timestamp: (p.timestamp - firstTimestamp)
                }))
              );
              const dynamicConfig: TrajectoryConfig = {
                seed: meta.seed,
                timeStepMs: meta.timeStepMs,
                spawnOffsetRatio: meta.spawnOffsetRatio,
                initialVelocityX: meta.initialVelocityX,
                trajectoryPoints
              };
              trajectoryCacheRef.current.pushDynamic(finalSlotIndex, dynamicConfig);
              if (ENABLE_STATIC_TRAJECTORY_COLLECTION) {
                trajectoryCacheRef.current.collectForStatic(finalSlotIndex, dynamicConfig);
              }
            }
            meta.physicsPath = [];
            shouldRemoveBall = true;
          } else {
            const hiddenAliveMs = meta.hiddenSpawnTime != null ? (performance.now() - meta.hiddenSpawnTime) : 0;
            //const hasPendingSlot = meta.hiddenPendingSlotIndex != null && meta.hiddenPendingSlotIndex >= 0;

            if (hiddenAliveMs >= HIDDEN_BALL_MAX_LIFETIME_MS) {
              meta.hiddenTimedOut = true;
              // 超时未落袋：只标记超时并移除，不写入任何轨迹缓存
              shouldRemoveBall = true;
            }
          }
        }

        const removeRadius = ball.circleRadius ?? boardBallRadius;
        // 兜底移除：只要超出屏幕底部，或者隐藏球已经结算，就移除
        if (!shouldRemoveBall && (ball.position.y > height + removeRadius * 2 || (isHiddenBall && meta?.hiddenSettled))) {
          if (isHiddenBall && meta && !meta.hiddenSettled) {
            // 隐藏球自然出屏幕后才结算；若未命中传感器，则按最近袋心推断落袋
            let slotIndex = meta.hiddenPendingSlotIndex;
            if (slotIndex == null || slotIndex < 0 || slotIndex >= slotMultipliers.length) {
              let nearest = -1;
              let nearestDist = Number.POSITIVE_INFINITY;
              for (let i = 0; i < renderSlotCenters.length; i += 1) {
                const dist = Math.abs(ball.position.x - renderSlotCenters[i]);
                if (dist < nearestDist) {
                  nearestDist = dist;
                  nearest = i;
                }
              }
              slotIndex = nearest >= 0 ? nearest : undefined;
            }
            meta.hiddenSettledSlotIndex = slotIndex ?? undefined;
            meta.hiddenSettledAt = meta.hiddenPhysicsElapsedMs ?? 0;
            // 检查是否超时
            const hiddenAliveMs = meta.hiddenSpawnTime != null ? (performance.now() - meta.hiddenSpawnTime) : 0;
            if (hiddenAliveMs >= HIDDEN_BALL_MAX_LIFETIME_MS) {
              meta.hiddenTimedOut = true;
            }
            meta.hiddenSettled = true;
          }
          shouldRemoveBall = true;
          if (isHiddenBall) {
            //console.log(`[HiddenBall] removing, y=${ball.position.y.toFixed(1)}, height=${height}`);
          }
          serverRewardRef.current = null;
        }

        if (shouldRemoveBall) {
          ballTrailsRef.current.delete(ball.id);
          Matter.Composite.remove(engine.world, ball);
        }
      });

      // Render
      ctx.clearRect(0, 0, width, height);
      bgCtx.clearRect(0, 0, width, height);

      // 禁用任何透视变换，确保2D渲染
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      bgCtx.setTransform(1, 0, 0, 1, 0, 0);

      const bodies = Matter.Composite.allBodies(engine.world);

      // 计算三角形背景实际尺寸（contain模式）
      const { triangleWidth: actualTriangleWidth } = calculateTriangleGeometry(width, height);

      // 计算钉子半径用于渲染（基于实际三角形宽度）
      const pinDiameter = actualTriangleWidth * 0.035;
      const pinRadius = pinDiameter / 3;
      const currentActiveSlot = activeSlotRef.current;
      const triangleHighlightColor = currentActiveSlot != null ? plinkoThemePalette.triangle.highlight : null;
      const triangleHighlightCore = currentActiveSlot != null ? plinkoThemePalette.triangle.highlightCore : null;

      // Fade out glowing pins
      glowingPinsRef.current.forEach((glowData, key) => {
        glowData.intensity -= 0.05;
        if (glowData.intensity <= 0) {
          glowingPinsRef.current.delete(key);
        }
      });

      // Debug: 绘制三角形起始位置和钉子阵起始位置
      /*const geom = triangleGeometryRef.current;
      if (geom) {
        const pinSpacingX = geom.triangleWidth * 0.11;
        const firstRowWidth = (2 - 1) * pinSpacingX; // 第一行2个钉子
        //const pinStartX = geom.triangleX + (geom.triangleWidth - firstRowWidth) / 2;
        //const pinStartY = geom.triangleY + geom.triangleHeight * 0.05; // 钉子阵第一行Y位置

        const pinStartX = geom.triangleX;
        const pinStartY = geom.triangleY;

        ctx.save();
        // 三角形起始位置（左上角）- 红色方块
          ctx.fillStyle = RENDER_COLORS.debug.wallMain;
          ctx.fillRect(geom.triangleX - 4, geom.triangleY - 4, 8, 8);
          ctx.fillText('三角形起点', geom.triangleX + 8, geom.triangleY);
          // 钉子阵起始位置（第一行中心）- 红色圆圈
          ctx.beginPath();
          ctx.arc(pinStartX, pinStartY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText('钉子起点', pinStartX + 10, pinStartY);
          ctx.restore();
        }*/

      // Debug: 绘制三角形起始位置和钉子阵起始位置
      /*const geom = triangleGeometryRef.current;
      if (geom) {
        const pinSpacingX = geom.triangleWidth * 0.11;
        const firstRowWidth = (2 - 1) * pinSpacingX; // 第一行2个钉子
        //const pinStartX = geom.triangleX + (geom.triangleWidth - firstRowWidth) / 2;
        //const pinStartY = geom.triangleY + geom.triangleHeight * 0.05; // 钉子阵第一行Y位置

        const pinStartX = geom.triangleX;
        const pinStartY = geom.triangleY;

        ctx.save();
        // 三角形起始位置（左上角）- 红色方块
        ctx.fillStyle = RENDER_COLORS.debug.wallMain;
      ctx.fillRect(geom.triangleX - 4, geom.triangleY - 4, 8, 8);
      ctx.fillText('三角形起点', geom.triangleX + 8, geom.triangleY);
      // 钉子阵起始位置（第一行中心）- 红色圆圈
      ctx.beginPath();
      ctx.arc(pinStartX, pinStartY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('钉子起点', pinStartX + 10, pinStartY);
      ctx.restore();
    }*/

      // 先绘制圆角三角形背景（绿色）到背景层
      bodies.forEach((body: Matter.Body) => {
        if (body.label === "wall-triangle") {
          bgCtx.save();
          bgCtx.lineJoin = "round";
          bgCtx.lineCap = "round";

          if (body.vertices && body.vertices.length > 0) {
            const outerOffset = 8;
            const centerX = body.vertices.reduce((sum, v) => sum + v.x, 0) / body.vertices.length;
            const centerY = body.vertices.reduce((sum, v) => sum + v.y, 0) / body.vertices.length;
            const outerVertices = body.vertices.map((vertex) => {
              const dx = vertex.x - centerX;
              const dy = vertex.y - centerY;
              const length = Math.sqrt(dx * dx + dy * dy) || 1;
              const scale = (length + outerOffset) / length;
              return {
                x: centerX + dx * scale,
                y: centerY + dy * scale
              };
            });

            const borderThickness = pinDiameter * 1.4;

            // 绘制外层边框（在外侧）
            bgCtx.save();
            bgCtx.beginPath();
            bgCtx.moveTo(outerVertices[0].x, outerVertices[0].y);
            for (let i = 1; i < outerVertices.length; i++) {
              bgCtx.lineTo(outerVertices[i].x, outerVertices[i].y);
            }
            bgCtx.closePath();

            bgCtx.lineWidth = borderThickness;
            bgCtx.strokeStyle = plinkoThemePalette.triangle.borderOuter;
            bgCtx.shadowColor = plinkoThemePalette.triangle.borderOuter;
            bgCtx.shadowBlur = 0;
            bgCtx.stroke();
            bgCtx.restore();

            // 绘制内层边框（在原始位置）
            bgCtx.beginPath();
            bgCtx.moveTo(body.vertices[0].x, body.vertices[0].y);
            for (let i = 1; i < body.vertices.length; i++) {
              bgCtx.lineTo(body.vertices[i].x, body.vertices[i].y);
            }
            bgCtx.closePath();

            bgCtx.lineWidth = Math.max(2, pinDiameter * 0.5);
            bgCtx.strokeStyle = plinkoThemePalette.triangle.borderInner;
            bgCtx.shadowColor = plinkoThemePalette.triangle.borderInner;
            bgCtx.shadowBlur = 8;
            bgCtx.stroke();

            if (triangleHighlightColor && triangleHighlightCore) {
              bgCtx.save();
              bgCtx.beginPath();
              bgCtx.moveTo(outerVertices[0].x, outerVertices[0].y);
              for (let i = 1; i < outerVertices.length; i++) {
                bgCtx.lineTo(outerVertices[i].x, outerVertices[i].y);
              }
              bgCtx.closePath();
              bgCtx.lineWidth = 10;
              bgCtx.strokeStyle = plinkoThemePalette.triangle.highlightShadowOuter;
              bgCtx.shadowColor = plinkoThemePalette.triangle.highlightShadowOuter;
              bgCtx.shadowBlur = 14;
              bgCtx.stroke();
              bgCtx.restore();

              bgCtx.save();
              bgCtx.beginPath();
              bgCtx.moveTo(outerVertices[0].x, outerVertices[0].y);
              for (let i = 1; i < outerVertices.length; i++) {
                bgCtx.lineTo(outerVertices[i].x, outerVertices[i].y);
              }
              bgCtx.closePath();
              bgCtx.lineWidth = 5;
              bgCtx.strokeStyle = triangleHighlightColor;
              bgCtx.shadowColor = triangleHighlightColor;
              bgCtx.shadowBlur = 12;
              bgCtx.stroke();
              bgCtx.restore();

              bgCtx.save();
              bgCtx.beginPath();
              bgCtx.moveTo(outerVertices[0].x, outerVertices[0].y);
              for (let i = 1; i < outerVertices.length; i++) {
                bgCtx.lineTo(outerVertices[i].x, outerVertices[i].y);
              }
              bgCtx.closePath();
              bgCtx.lineWidth = 5;
              bgCtx.strokeStyle = triangleHighlightCore;
              bgCtx.shadowColor = triangleHighlightCore;
              bgCtx.shadowBlur = 10;
              bgCtx.stroke();
              bgCtx.restore();
            }
          }
          bgCtx.restore();
        }
      });

      /*
      // 可视化球袋碰撞体（slot-sensor）
      bodies.forEach((body: Matter.Body) => {
        if (body.label !== 'slot-sensor') return;
        if (!body.vertices || body.vertices.length === 0) return;
        bgCtx.save();
        bgCtx.globalCompositeOperation = 'source-over';
        bgCtx.beginPath();
        bgCtx.moveTo(body.vertices[0].x, body.vertices[0].y);
        for (let i = 1; i < body.vertices.length; i += 1) {
          bgCtx.lineTo(body.vertices[i].x, body.vertices[i].y);
        }
        bgCtx.closePath();
        bgCtx.fillStyle = RENDER_COLORS.debug.slotSensorFill;
        bgCtx.strokeStyle = RENDER_COLORS.debug.slotSensorStroke;
        bgCtx.lineWidth = 1;
        bgCtx.stroke();
        bgCtx.fill();
        bgCtx.restore();
      });

      // 可视化钉子碰撞体（pin）
      bodies.forEach((body: Matter.Body) => {
        if (body.label !== 'pin') return;
        if (!body.vertices || body.vertices.length === 0) return;
        bgCtx.save();
        bgCtx.globalCompositeOperation = 'source-over';
        bgCtx.beginPath();
        bgCtx.moveTo(body.vertices[0].x, body.vertices[0].y);
        for (let i = 1; i < body.vertices.length; i += 1) {
          bgCtx.lineTo(body.vertices[i].x, body.vertices[i].y);
        }
        bgCtx.closePath();
        bgCtx.fillStyle = RENDER_COLORS.debug.pinSensorFill;
        bgCtx.strokeStyle = RENDER_COLORS.debug.pinSensorStroke;
        bgCtx.lineWidth = 1.5;
        bgCtx.fill();
        bgCtx.stroke();
        bgCtx.restore();
      });
      */

      bodies.forEach((body: Matter.Body) => {
        if (body.label === "pin") {
          const key = `${Math.round(body.position.x)},${Math.round(body.position.y)}`;
          const glowData = glowingPinsRef.current.get(key);

          bgCtx.save();
          // 禁用任何可能的透视或深度效果
          bgCtx.globalAlpha = 1;
          bgCtx.globalCompositeOperation = "source-over";

          bgCtx.beginPath();
          bgCtx.arc(body.position.x, body.position.y, pinRadius, 0, Math.PI * 2);

          if (glowData && glowData.intensity > 0) {
            // Glowing pin - yellow highlight
            bgCtx.fillStyle = `rgba(${RENDER_COLORS.pin.glowFillBase}, ${0.62 + glowData.intensity * 0.38})`;
            bgCtx.strokeStyle = RENDER_COLORS.pin.glowStroke;
            bgCtx.lineWidth = 2.2;
            bgCtx.shadowColor = RENDER_COLORS.pin.glowShadow;
            bgCtx.shadowBlur = 22 * glowData.intensity;
            bgCtx.fill();
            bgCtx.stroke();
          } else {
            bgCtx.fillStyle = PIN_COLOR;
            bgCtx.strokeStyle = RENDER_COLORS.pin.baseStroke;
            bgCtx.lineWidth = 3; // 描边宽度增加
            // 添加阴影效果
            //bgCtx.shadowColor = RENDER_COLORS.pin.baseShadow;
            //bgCtx.shadowBlur = 5;
            //bgCtx.shadowOffsetX = 0;
            //bgCtx.shadowOffsetY = 3;
            bgCtx.fill(); // 先填充
            bgCtx.stroke(); // 再绘制描边
          }

          bgCtx.fill();
          bgCtx.restore();
        } else if (body.label === "ball") {
          // no-op, balls render below in the same pass
        }
      });

      // 在前景层再绘制一层命中钉子高亮，避免最底排被球袋遮住
      glowingPinsRef.current.forEach((glowData) => {
        if (glowData.intensity <= 0) return;
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.arc(glowData.x, glowData.y, pinRadius * 1.15, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${RENDER_COLORS.pin.outerGlowFillBase}, ${0.26 + glowData.intensity * 0.34})`;
        ctx.shadowColor = RENDER_COLORS.pin.outerGlowShadow;
        ctx.shadowBlur = 26 * glowData.intensity;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(glowData.x, glowData.y, pinRadius * 0.72, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${RENDER_COLORS.pin.innerGlowFillBase}, ${0.44 + glowData.intensity * 0.28})`;
        ctx.fill();
        ctx.restore();
      });

      bodies.forEach((body: Matter.Body) => {
        if (body.label === "ball") {
          const meta = (body.plugin?.plinkoMeta as BallMeta | undefined) ?? null;
          const ballRadius = body.circleRadius ?? boardBallRadius;
          if (meta?.hidden) {
            ballTrailsRef.current.delete(body.id);
            // 调试：隐藏球用红色标出，便于观察落袋判定问题
            /*
            ctx.save();
            ctx.beginPath();
            ctx.arc(body.position.x, body.position.y, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 40, 40, 0.45)';
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255, 120, 120, 0.9)';
            ctx.stroke();
            ctx.restore();*/
            return;
          }

          const now = performance.now();
          const trailDurationMs = 170;
          const maxTrailPoints = BALL_TRAIL_MAX_POINTS;

          const trail = ballTrailsRef.current.get(body.id) || [];
          trail.unshift({ x: body.position.x, y: body.position.y, t: now });
          const cutoff = now - trailDurationMs;
          while (trail.length > 0 && trail[trail.length - 1].t < cutoff) trail.pop();
          if (trail.length > maxTrailPoints) trail.length = maxTrailPoints;
          ballTrailsRef.current.set(body.id, trail);

          for (let i = 1; i < trail.length; i += 1) {
            const pos = trail[i];
            const age = now - pos.t;
            if (age <= 0) continue;
            const t = Math.min(1, age / trailDurationMs);
            const fade = (1 - t) ** 1.7;
            const alpha = Math.min(0.92, 0.84 * fade);
            const radius = Math.max(0.8, ballRadius * (0.28 + 0.52 * fade));

            ctx.save();
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius * 1.08, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.28})`;
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${RENDER_COLORS.ball.trail}, ${alpha})`;
            ctx.shadowColor = `rgba(${RENDER_COLORS.ball.trail}, ${Math.min(1, alpha + 0.18)})`;
            ctx.shadowBlur = 18 * fade + 2;
            ctx.fill();
            ctx.restore();

            if (fade > 0.72) {
              ctx.save();
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, radius * 0.38, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.22})`;
              ctx.fill();
              ctx.restore();
            }
          }

          // Draw ball with image
          ctx.save();
          if (ballImageRef.current) {
            // 使用图片绘制球
            const size = ballRadius * 2;
            ctx.drawImage(
              ballImageRef.current,
              body.position.x - ballRadius,
              body.position.y - ballRadius,
              size,
              size
            );
          } else {
            // Fallback: 使用渐变绘制
            ctx.beginPath();
            ctx.arc(body.position.x, body.position.y, ballRadius, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
              body.position.x - 2, body.position.y - 2, 0,
              body.position.x, body.position.y, ballRadius
            );
            gradient.addColorStop(0, RENDER_COLORS.ball.gradientCenter);
            gradient.addColorStop(1, RENDER_COLORS.ball.gradientEdge);
            ctx.fillStyle = gradient;
            ctx.shadowColor = RENDER_COLORS.ball.base;
            ctx.shadowBlur = 15;
            ctx.fill();
          }
          ctx.restore();
        }
        // Walls are invisible but still functional for physics


        // Debug: 可视化所有墙壁位置（调试用，完成后可删除）
        /*let segmentIndex = 0;
        bodies.forEach((body: Matter.Body) => {
          if (body.label === 'wall-triangle' || body.label === 'wall-v-shape' || body.label === 'wall-top' || body.label === 'wall-left' || body.label === 'wall-right' || body.label === 'wall-triangle-segment') {
            const isSegment = body.label === 'wall-triangle-segment';
            ctx.save();
            ctx.strokeStyle = isSegment ? RENDER_COLORS.debug.wallSegment : RENDER_COLORS.debug.wallMain;
            ctx.lineWidth = 2;

            // 使用vertices绘制多边形墙壁（中空，只描边）
            if (body.vertices && body.vertices.length > 0) {
              ctx.beginPath();
              ctx.moveTo(body.vertices[0].x, body.vertices[0].y);
              for (let i = 1; i < body.vertices.length; i++) {
                ctx.lineTo(body.vertices[i].x, body.vertices[i].y);
              }
              ctx.closePath();
              // 不填充，只描边
              ctx.stroke();
            }

            // 标注文字（在中心位置）
            ctx.fillStyle = isSegment ? RENDER_COLORS.debug.wallSegment : RENDER_COLORS.debug.wallMain;
            ctx.font = '12px sans-serif';
            const label = isSegment
                         ? `矩形段-${segmentIndex++}`
                         : body.label === 'wall-triangle' ? '圆角三角墙' :
                         body.label === 'wall-v-shape' ? 'V形墙' :
                         body.label === 'wall-top' ? '顶部墙' :
                         body.label === 'wall-left' ? '左墙' : '右墙';
            ctx.fillText(label, body.position.x - 20, body.position.y + 4);
            ctx.restore();
          }
        });*/
      });

      animationRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isReady, dimensions, playSound, vibrate, slotMultipliers, nextRandom, plinkoThemePalette]);

  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.3,
            life: p.life - 0.02
          }))
          .filter((p) => p.life > 0)
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length]);

  useEffect(() => {
    if (!isReady || !engineRef.current) return;
    if (startupWarmupStartedRef.current) return;

    const warmupTotal = Math.max(0, Math.floor(STARTUP_HIDDEN_WARMUP_TOTAL));
    const warmupBatchSize = Math.max(1, Math.floor(STARTUP_HIDDEN_WARMUP_BATCH_SIZE));
    const warmupIntervalMs = Math.max(16, Math.floor(STARTUP_HIDDEN_WARMUP_INTERVAL_MS));
    const warmupMaxActive = Math.max(1, Math.floor(STARTUP_HIDDEN_WARMUP_MAX_ACTIVE));

    if (warmupTotal <= 0) return;
    if (!trajectoryCacheRef.current.hasAnyDynamicCapacity(slotMultipliers.length)) return;

    startupWarmupStartedRef.current = true;

    let produced = 0;
    const tick = () => {
      if (!engineRef.current) return;
      if (!trajectoryCacheRef.current.hasAnyDynamicCapacity(slotMultipliers.length)) return;

      const hiddenActive = Matter.Composite
        .allBodies(engineRef.current.world)
        .filter((body) => body.label === "ball" && (body.plugin?.plinkoMeta as BallMeta | undefined)?.hidden)
        .length;

      const remaining = warmupTotal - produced;
      if (remaining <= 0 || hiddenActive >= warmupMaxActive) return;

      const availableSlots = Math.max(0, warmupMaxActive - hiddenActive);
      const spawnCount = Math.min(warmupBatchSize, remaining, availableSlots);
      for (let i = 0; i < spawnCount; i += 1) {
        if (spawnHiddenNaturalBall(dimensions.width / 2)) {
          produced += 1;
        }
      }
    };

    tick();
    const intervalId = window.setInterval(() => {
      tick();
      if (produced >= warmupTotal || !trajectoryCacheRef.current.hasAnyDynamicCapacity(slotMultipliers.length)) {
        window.clearInterval(intervalId);
      }
    }, warmupIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isReady, dimensions.width, slotMultipliers.length, spawnHiddenNaturalBall]);

  useEffect(() => {
    if (!ENABLE_STATIC_TRAJECTORY_COLLECTION) return;
    if (!isReady || !engineRef.current) return;
    if (staticCollectorStartedRef.current) return;

    staticCollectorStartedRef.current = true;
    trajectoryCacheRef.current.resetCollected();

    const exportBinaryChunks = (maxSize: number) => trajectoryCacheRef.current.exportCollectedBinaryChunks(maxSize);
    const triggerDownload = (data: BlobPart, fileName: string, mime = "application/octet-stream") => {
      const blob = new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    };

    const downloadBinaryChunks = (baseFileName = "plinko-trajectory-cache") => {
      const maxChunk = Math.max(1, Math.floor(STATIC_BIN_CHUNK_MAX_BYTES));
      const buffers = exportBinaryChunks(maxChunk);
      if (buffers.length === 0) return;

      const names: string[] = [];
      buffers.forEach((buffer, index) => {
        const chunk = new Uint8Array(buffer);
        const name = `${baseFileName}.part${String(index + 1).padStart(2, "0")}.bin`;
        names.push(name);
        triggerDownload(chunk, name);
      });

      const manifestName = `${baseFileName}.manifest.json`;
      triggerDownload(JSON.stringify(names, null, 2), manifestName, "application/json");
    };

    const completeCollection = () => {
      staticCollectorRunningRef.current = false;
      const buffers = exportBinaryChunks(Infinity);
      if (buffers.length === 0 || buffers[0].byteLength === 0) return;
      const freshRows = parseTrajectoryBinary(buffers[0]);
      trajectoryCacheRef.current.setStaticRows(freshRows);
      downloadBinaryChunks("plinko-trajectory-cache");
      console.log("[PlinkoCollector] 自动静态采样完成，已更新当前静态配置并导出 BIN 与 manifest");
    };

    const tick = () => {
      if (!staticCollectorRunningRef.current) return;
      if (!engineRef.current) return;

      const counts = trajectoryCacheRef.current.getCollectedCounts(slotMultipliers.length);
      const complete = slotMultipliers.every((_, index) => {
        const target = SLOT_PATH_COUNTS[index] ?? 1;
        return (counts[index] ?? 0) >= target;
      });
      if (complete) {
        completeCollection();
        return;
      }

      const hiddenActive = Matter.Composite
        .allBodies(engineRef.current.world)
        .filter((body) => body.label === "ball" && ((body.plugin?.plinkoMeta as BallMeta | undefined)?.hidden))
        .length;

      if (hiddenActive >= AUTO_STATIC_COLLECTION_MAX_ACTIVE_HIDDEN) return;

      const availableSlots = Math.max(0, AUTO_STATIC_COLLECTION_MAX_ACTIVE_HIDDEN - hiddenActive);
      const spawnCount = Math.min(AUTO_STATIC_COLLECTION_BATCH_SIZE, availableSlots);
      for (let i = 0; i < spawnCount; i += 1) {
        void spawnHiddenNaturalBall(dimensions.width / 2);
      }
    };

    let intervalId: number | null = null;
    const startCollection = () => {
      if (!engineRef.current) return;
      staticCollectorRunningRef.current = true;
      console.log("[PlinkoCollector] 游戏启动后自动开始静态采样");
      tick();
      intervalId = window.setInterval(tick, AUTO_STATIC_COLLECTION_INTERVAL_MS);
    };

    let timerId: number | null = null;
    if (AUTO_STATIC_COLLECTION_DELAY_MS > 0) {
      timerId = window.setTimeout(startCollection, AUTO_STATIC_COLLECTION_DELAY_MS);
    } else {
      startCollection();
    }

    return () => {
      if (timerId != null) {
        window.clearTimeout(timerId);
      }
      if (intervalId != null) {
        window.clearInterval(intervalId);
      }
      staticCollectorRunningRef.current = false;
      staticCollectorStartedRef.current = false;
    };
  }, [isReady, dimensions.width, slotMultipliers, spawnHiddenNaturalBall]);

  const [activeDropRequests, setActiveDropRequests] = useState(0);
  const isDropInFlight = activeDropRequests > 0;
  const { isOpen: isBatchSelectorOpen, openModal: openBatchSelector, closeModal: closeBatchSelector } = useModal(false);

  const dropBall = useCallback(async () => {
    // Use ref for accurate current value (avoids stale closure)
    if (!engineRef.current) {
      console.warn("[Plinko][DropBlocked]", "engine_not_ready");
      return false;
    }
    if (ballsLeftRef.current <= 0) {
      console.info("[Plinko][DropBlocked]", "no_balls_left");
      return false;
    }
    if (ballsLeftRef.current - pendingBallReservationsRef.current <= 0) {
      console.info("[Plinko][DropBlocked]", "no_unreserved_balls_left", {
        ballsLeft: ballsLeftRef.current,
        pendingReservations: pendingBallReservationsRef.current
      });
      return false;
    }
    if (activeDropRequestsRef.current >= MAX_CONCURRENT_DROP_REQUESTS) {
      console.info("[Plinko][DropBlocked]", "max_concurrent_requests", {
        activeDropRequests: activeDropRequestsRef.current,
        maxConcurrentDropRequests: MAX_CONCURRENT_DROP_REQUESTS
      });
      return false;
    }

    pendingBallReservationsRef.current += 1;
    activeDropRequestsRef.current += 1;
    setActiveDropRequests(activeDropRequestsRef.current);
    let requestReleased = false;
    let reservationReleased = false;
    const releaseDropRequest = () => {
      if (requestReleased) return;
      requestReleased = true;
      activeDropRequestsRef.current = Math.max(0, activeDropRequestsRef.current - 1);
      setActiveDropRequests(activeDropRequestsRef.current);
    };
    const releaseReservation = () => {
      if (reservationReleased) return;
      reservationReleased = true;
      pendingBallReservationsRef.current = Math.max(0, pendingBallReservationsRef.current - 1);
    };
    const uiUnlockTimeoutId = typeof window !== "undefined"
      ? window.setTimeout(() => {
        console.warn("[Plinko][DropUnlock]", "ui_timeout_2s_no_response");
        releaseDropRequest();
      }, 2000)
      : null;

    try {
      const payload = await sendBuddyBallRequest("GetBall");

      if (payload.code !== 0) {
        console.warn("[Plinko][DropFailed]", "get_ball_error", { code: payload.code, msg: payload.msg });
        releaseReservation();
        return false;
      }

      // 解析服务器落点（原来在 handleMessage 里处理）
      lastGetBallPayloadRef.current = payload;
      const _location = toFiniteNumber(payload.data.location);
      if (_location != null) {
        const _matchingSlots = slotMultipliersRef.current
          .map((multiplier, index) => ({ multiplier, index }))
          .filter(item => item.multiplier === _location)
          .map(item => item.index);
        if (_matchingSlots.length > 0) {
          const _targetIdx = _matchingSlots[Math.floor(nextRandom() * _matchingSlots.length)];
          targetSlotRef.current = _targetIdx;
          serverRewardRef.current = { slotIndex: _targetIdx, multiplier: _location };
        } else {
          targetSlotRef.current = null;
          serverRewardRef.current = null;
        }
      } else {
        targetSlotRef.current = null;
        serverRewardRef.current = null;
      }

      if (uiUnlockTimeoutId != null) {
        window.clearTimeout(uiUnlockTimeoutId);
      }

      const geom = triangleGeometryRef.current;
      const spawnJitterX = geom ? pinSpacingX * 0.5 : dimensions.width * 0.02;
      const restitutionScale = geom ? getRestitutionScaleByTriangleWidth(geom.triangleWidth) : 1;
      const ballRadius = geom ? getUnifiedBallRadiusByPinSpacingX(geom.triangleWidth * 0.11) : BASE_BALL_RADIUS * VIRTUAL_BALL_RADIUS_SCALE;
      const requestedSlotIndex = targetSlotRef.current !== null && targetSlotRef.current >= 0 && targetSlotRef.current < slotMultipliers.length
        ? targetSlotRef.current
        : null;

      if (requestedSlotIndex == null) {
        console.error("[Plinko][Invariant]", "requestedSlotIndex_null_after_GetBall", {
          lastGetBallPayload: lastGetBallPayloadRef.current,
          lastGetBallRawMessage: lastGetBallRawMessageRef.current,
          slotMultipliers: slotMultipliers
        });
        return false;
      }

      const hasTrajectoryPool = trajectoryCacheRef.current.getSlotCount() > 0;
      let cachedTrajectory = hasTrajectoryPool ? trajectoryCacheRef.current.takeConfig(requestedSlotIndex) : null;
      let sourceTrajectory = cachedTrajectory?.config.trajectoryPoints ?? [];
      let hasReplayTrajectory = sourceTrajectory.length > 0;

      if (hasTrajectoryPool) {
        const maxTrajectoryWaitMs = 1200;
        let waitedMs = 0;
        while (!hasReplayTrajectory) {
          if (waitedMs === 0) {
            console.info("[Plinko] 可见球轨迹未就绪，开始等待缓存", {
              requestedSlotIndex
            });
            if (!trajectoryLoadingToastShownRef.current) {
              trajectoryLoadingToastShownRef.current = true;
              toast.info(t("common:loading", "Please wait a moment..."));
            }
            if (!trajectoryCacheRef.current.hasReplayConfig(requestedSlotIndex) && trajectoryCacheRef.current.hasAnyDynamicCapacity(slotMultipliers.length)) {
              void spawnHiddenNaturalBall(dropX ?? dimensions.width / 2);
            }
          } else if (waitedMs % 1000 === 0) {
            console.info("[Plinko] 仍在等待可见球轨迹", {
              requestedSlotIndex,
              waitedMs
            });
          }

          await new Promise<void>((resolve) => {
            if (typeof window === "undefined") {
              resolve();
              return;
            }
            window.setTimeout(resolve, 50);
          });

          waitedMs += 50;
          if (waitedMs >= maxTrajectoryWaitMs) {
            console.warn("[Plinko][TrajectoryFallback]", "wait_timeout_use_fallback", {
              requestedSlotIndex,
              waitedMs
            });
            break;
          }
          cachedTrajectory = trajectoryCacheRef.current.takeConfig(requestedSlotIndex);
          sourceTrajectory = cachedTrajectory?.config.trajectoryPoints ?? [];
          hasReplayTrajectory = sourceTrajectory.length > 0;
        }
      }

      if (!cachedTrajectory || !cachedTrajectory.config) {
        const fallbackSeed = Math.floor(nextRandom() * 2_147_483_647);
        const fallbackRandom = createSeededRandom(fallbackSeed);
        cachedTrajectory = {
          source: "dynamic",
          config: {
            seed: fallbackSeed,
            timeStepMs: PLINKO_TRAJECTORY_CONFIG.hiddenRecordingBaseTimeStepMs,
            spawnOffsetRatio: fallbackRandom() * 2 - 1,
            initialVelocityX: (fallbackRandom() * 2 - 1) * 0.18,
            trajectoryPoints: []
          }
        };
        sourceTrajectory = [];
        hasReplayTrajectory = false;
      }

      setGameState((prev) => ({
        ...prev,
        ballsLeft: Math.max(0, prev.ballsLeft - 1),
        lastWin: 0
      }));
      releaseReservation();

      playSound("drop");
      vibrate("medium");

      const seed = cachedTrajectory?.config.seed ?? Math.floor(nextRandom() * 2_147_483_647);
      const seededRandom = createSeededRandom(seed);
      const spawnOffsetRatio = cachedTrajectory?.config.spawnOffsetRatio ?? (seededRandom() * 2 - 1);
      const randomOffsetX = Math.max(-1, Math.min(1, spawnOffsetRatio)) * spawnJitterX;
      const rawX = (dropX ?? dimensions.width / 2) + randomOffsetX;
      const topRowLeftPinX = geom ? (geom.triangleX + (geom.triangleWidth - pinSpacingX) / 2) : ballRadius * 2;
      const topRowRightPinX = geom ? (topRowLeftPinX + pinSpacingX) : (dimensions.width - ballRadius * 2);
      const minSpawnX = geom ? geom.triangleX + ballRadius * 2 : ballRadius * 2;
      const maxSpawnX = geom ? geom.triangleX + geom.triangleWidth - ballRadius * 2 : dimensions.width - ballRadius * 2;
      const x = clamp(rawX, Math.max(minSpawnX, topRowLeftPinX), Math.min(maxSpawnX, topRowRightPinX));

      // 球生成点：三角形顶部墙体内，并且位于第一排钉子之上
      const firstRowPinY = geom
        ? geom.triangleY - geom.triangleHeight * 0.02
        : ballRadius * 4;
      // 纵坐标硬约束：最顶部钉子上方两行钉子间距
      const ballSpawnY = firstRowPinY - pinSpacingY * 2;

      const normalizedSpawnPoint = geom
        ? {
          x: Math.max(0, Math.min(1, (x - geom.triangleX) / geom.triangleWidth)),
          y: (ballSpawnY - geom.triangleY) / geom.triangleHeight,
          hit: false,
          timestamp: 0
        }
        : null;
      const playbackTrajectoryPoints = normalizedSpawnPoint && hasReplayTrajectory
        ? ensureStrictlyIncreasingTimestamps(
          [
            normalizedSpawnPoint,
            ...sourceTrajectory.map((point) => ({
              ...point,
              timestamp: (point.timestamp ?? 0) + PLINKO_TRAJECTORY_CONFIG.visibleReplayLeadInMs
            }))
          ]
        )
        : [];
      const spawnAbsX = normalizedSpawnPoint && hasReplayTrajectory && geom
        ? (geom.triangleX + normalizedSpawnPoint.x * geom.triangleWidth)
        : x;
      const spawnAbsY = normalizedSpawnPoint && hasReplayTrajectory && geom
        ? (geom.triangleY + normalizedSpawnPoint.y * geom.triangleHeight)
        : ballSpawnY;

      const ball = Matter.Bodies.circle(
        spawnAbsX,
        spawnAbsY,
        ballRadius,
        {
          isStatic: hasReplayTrajectory,
          restitution: PLINKO_PHYSICS_CONFIG.ball.restitutionBase * restitutionScale,
          friction: PLINKO_PHYSICS_CONFIG.ball.friction,
          frictionStatic: PLINKO_PHYSICS_CONFIG.ball.frictionStatic,
          frictionAir: PLINKO_PHYSICS_CONFIG.ball.frictionAir,
          density: VIRTUAL_BALL_DENSITY,
          label: "ball",
          collisionFilter: {
            group: -1
          }
        }
      );
      const selectedTimeStep = cachedTrajectory.config.timeStepMs ?? PLINKO_TRAJECTORY_CONFIG.hiddenRecordingBaseTimeStepMs;
      const selectedInitialVelocityX = cachedTrajectory.config.initialVelocityX;
      const assignedReward = serverRewardRef.current;
      const ballMeta: BallMeta = {
        hidden: false,
        requestId: undefined,
        seed,
        timeStepMs: selectedTimeStep,
        spawnOffsetRatio,
        initialVelocityX: selectedInitialVelocityX,
        cacheSource: cachedTrajectory.source,
        targetSlotIndex: requestedSlotIndex,
        assignedSlotIndex: assignedReward?.slotIndex ?? requestedSlotIndex,
        rewardMultiplier: assignedReward?.multiplier ?? (requestedSlotIndex != null ? (slotMultipliers[requestedSlotIndex] ?? 0) : null),
        // 使用轨迹点系统
        trajectoryPoints: playbackTrajectoryPoints,
        trajectoryCursor: 0,
        // 可见球轨迹开始时间
        trajectoryStartTime: performance.now(),
        visibleBagTop: renderedSlotsTop,
        // 碰撞计数
        hitCount: 0,
        lastHitTime: 0
      };
      ball.plugin = {
        ...(ball.plugin ?? {}),
        plinkoMeta: ballMeta
      };

      // 清除目标槽位和本次奖励引用，避免后续新球覆盖上一颗可见球的结算信息
      targetSlotRef.current = null;
      serverRewardRef.current = null;

      Matter.Composite.add(engineRef.current.world, ball);

      const hiddenWarmupCount = Math.max(0, Math.floor(2)); // HIDDEN_WARMUP_BALLS_PER_DROP = 2
      const canGenerateWarmup = hiddenWarmupCount > 0 && trajectoryCacheRef.current.hasAnyDynamicCapacity(slotMultipliers.length);
      for (let i = 0; canGenerateWarmup && i < hiddenWarmupCount; i += 1) {
        void spawnHiddenNaturalBall(dropX ?? dimensions.width / 2);
      }

      return true;
    } finally {
      if (uiUnlockTimeoutId != null) {
        window.clearTimeout(uiUnlockTimeoutId);
      }
      releaseReservation();
      releaseDropRequest();
    }
  }, [MAX_CONCURRENT_DROP_REQUESTS, dimensions.width, dimensions.height, dropX, playSound, vibrate, safeSlotsTop, slotHeight, sendBuddyBallRequest, slotMultipliers.length, targetSlotRef, spawnHiddenNaturalBall, nextRandom]);

  const pumpDropQueue = useCallback(() => {
    if (isPumpingDropQueueRef.current) return;
    isPumpingDropQueueRef.current = true;

    try {
      while (
        queuedBatchDropsRef.current > 0 &&
        engineRef.current &&
        ballsLeftRef.current - pendingBallReservationsRef.current > 0 &&
        activeDropRequestsRef.current < MAX_CONCURRENT_DROP_REQUESTS
        ) {
        queuedBatchDropsRef.current -= 1;
        void dropBall();
      }
    } finally {
      isPumpingDropQueueRef.current = false;
    }
  }, [dropBall]);

  const [isPlayPressing, setIsPlayPressing] = useState(false);

  useEffect(() => {
    if (isPlayDisabled) {
      setIsPlayPressing(false);
    }
  }, [isPlayDisabled]);

  useEffect(() => {
    if (queuedBatchDropsRef.current > 0) {
      pumpDropQueue();
    }
  }, [activeDropRequests, gameState.ballsLeft, pumpDropQueue]);

  const handlePressEnd = useCallback((e?: React.TouchEvent | React.MouseEvent) => {
    if (e && "touches" in e && e.cancelable) {
      e.preventDefault();
    }
    setIsPlayPressing(false);
  }, []);

  const scheduleDropBatch = useCallback((requestedCount: number) => {
    const availableToSchedule = Math.max(0, ballsLeftRef.current - pendingBallReservationsRef.current - queuedBatchDropsRef.current);
    const dropCount = Math.min(requestedCount, availableToSchedule);

    if (dropCount <= 0) {
      toast.info(t("common:noBallsLeft", "No balls left"));
      return;
    }

    queuedBatchDropsRef.current += dropCount;
    pumpDropQueue();
  }, [pumpDropQueue, t]);

  const handlePressStart = useCallback((e?: React.TouchEvent | React.MouseEvent) => {
    if (e && "touches" in e && e.cancelable) {
      e.preventDefault();
    }
    setIsPlayPressing(true);
    unlockAudio();
    if (!isSlotConfigLoaded) {
      toast.info(t("common:loading", "Configuration loading, please wait..."));
      return;
    }
    if (ballsLeftRef.current <= 0) {
      toast.info(t("common:noBallsLeft", "No balls left"));
      return;
    }
    scheduleDropBatch(ballsPerRound);
  }, [ballsPerRound, scheduleDropBatch, unlockAudio, isSlotConfigLoaded, t]);

  // handleGetMoreBalls function removed - no longer needed

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      queuedBatchDropsRef.current = 0;
    };
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <WinTicker wins={winHistory} />
      <div
        ref={containerRef}
        className={`flex-1 relative ${gameState.isShaking ? "animate-shake" : ""}`}
      >
        <div className={"w-full h-full absolute top-0"}>
          <canvas
            ref={bgCanvasRef}
            width={dimensions.width}
            height={dimensions.height}
          />
        </div>
        <div className={"h-full absolute top-0"}>
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
          />
        </div>

        {dimensions.width > 0 && isSlotLayoutReady && (
          <MultiplierSlots
            multipliers={slotMultipliers}
            slotWidth={slotWidth}
            slotGap={slotGap}
            slotHeight={slotHeight}
            slotCenters={slotCenters}
            activeSlot={activeSlot}
            triangleBottomY={renderedSlotsTop}
            minTop={slotsMinTop}
            highlightColors={highlightColors}
            slotBackgroundColors={plinkoThemePalette.slotBackgrounds}
            slotBorderColors={plinkoThemePalette.slotBorders}
            slotTextColors={plinkoThemePalette.slotText}
            slotBagNormalColor={plinkoThemePalette.slotBagNormal}
            slotBagNormalBorderColor={plinkoThemePalette.slotBagBorder}
            showValues={isSlotConfigLoaded}
          />
        )}
      </div>

      <div className={"mb-10 mt-10 flex justify-center relative"}>
        <button
          type="button"
          className="absolute btn btn-primary btn-soft btn-circle right-4 bottom-0 text-[12px] italic"
          onClick={openBatchSelector}
        >
          <span>{`x${ballsPerRound}`}</span>
        </button>

        <ConfirmBox
          loading={isDropInFlight}
          onMouseDown={(e) => handlePressStart(e)}
          onMouseUp={(e) => handlePressEnd(e)}
          onMouseLeave={(e) => handlePressEnd(e)}
          onTouchStart={(e) => handlePressStart(e)}
          onTouchEnd={(e) => handlePressEnd(e)}
          onTouchCancel={(e) => handlePressEnd(e)}
          onBlur={() => handlePressEnd()}
          aria-disabled={isPlayDisabled}
          className={`w-auto shrink-0 uppercase text-lg rounded-lg select-none relative overflow-hidden transition-transform duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            isPlayDisabled ? "opacity-40 grayscale cursor-not-allowed" :
              "cursor-pointer"
          } ${
            isPlayPressing && !isPlayDisabled
              ? "scale-95"
              : ""
          }`}
        >
              <span className={`transition-opacity duration-200 opacity-100`}>
                {t("common:common.play", "Play")}
              </span>
        </ConfirmBox>
      </div>

      <Modal
        isOpen={isBatchSelectorOpen}
        onClose={closeBatchSelector}
        title={t("buddyBalls:ballsPerRound")}
        position="modal-bottom"
      >
        <div className="grid grid-cols-5 gap-1">
          {PLAY_BATCH_OPTIONS.map((option) => {
            const isActive = ballsPerRound === option;
            return (
              <button
                key={option}
                type="button"
                className={`px-2 h-8 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-content"
                    : "bg-base-200 text-base-content hover:bg-base-200/80"
                }`}
                onClick={() => {
                  setBallsPerRound(option);
                  closeBatchSelector();
                }}
              >
                {`x${option}`}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};
