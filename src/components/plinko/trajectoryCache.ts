import { SLOT_PATH_COUNTS } from './types';

export type TrajectoryCacheSource = 'static' | 'dynamic';

export interface TrajectoryConfig {
  seed: number;
  timeStepMs: number;
  spawnOffsetRatio: number;
  initialVelocityX: number;
  // 轨迹点替代钉子路径
  trajectoryPoints?: TrajectoryPoint[];
}

export interface TrajectoryPoint {
  x: number; // 相对于三角形宽度的比例 (0-1)
  y: number; // 相对于三角形高度的比例 (0-1)
  hit: boolean; // 是否碰到钉子
  pinIndex?: number; // 碰到的钉子索引
  // 相对于轨迹起点的时间差（毫秒）
  timestamp?: number;
}

interface TrajectoryRow extends TrajectoryConfig {
  slotIndex: number;
}

interface CreateTrajectoryCacheOptions {
  staticConfigsPerSlot: number;
  dynamicConfigsPerSlot: number;
  deterministicMode?: boolean;
  deterministicSeed?: number;
}

const DEFAULT_STEP_MS = 1000 / 30;

const toFinite = (value: string | number, fallback: number) => {
  const next = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(next) ? next : fallback;
};

const normalizeNumber = (value: number, digits: number) => Number(value.toFixed(digits));
const TRAJECTORY_POSITION_DIGITS = 12;
const TRAJECTORY_TIME_DIGITS = 6;

const normalizeTrajectoryPoint = (point: TrajectoryPoint): TrajectoryPoint => ({
  x: normalizeNumber(point.x, TRAJECTORY_POSITION_DIGITS),
  y: normalizeNumber(point.y, TRAJECTORY_POSITION_DIGITS),
  hit: point.hit,
  pinIndex: point.pinIndex,
  timestamp: point.timestamp != null && Number.isFinite(point.timestamp)
    ? normalizeNumber(Math.max(0, point.timestamp), TRAJECTORY_TIME_DIGITS)
    : undefined,
});

const normalizeTrajectoryConfig = (config: TrajectoryConfig): TrajectoryConfig => ({
  seed: Math.floor(config.seed),
  timeStepMs: normalizeNumber(config.timeStepMs, 4),
  spawnOffsetRatio: normalizeNumber(config.spawnOffsetRatio, 6),
  initialVelocityX: normalizeNumber(config.initialVelocityX, 6),
  trajectoryPoints: config.trajectoryPoints && config.trajectoryPoints.length > 0
    ? config.trajectoryPoints.map(normalizeTrajectoryPoint)
    : undefined,
});

const buildConfigDedupKey = (config: TrajectoryConfig) => {
  // 去重时只关心空间路径和碰撞标记，不把时间差算进 key，
  // 这样同一路径不同采样时间仍视为同一条配置，避免重复。
  const pointsPart = (config.trajectoryPoints ?? [])
    .map((p) => `${p.x.toFixed(TRAJECTORY_POSITION_DIGITS)},${p.y.toFixed(TRAJECTORY_POSITION_DIGITS)},${p.hit ? 1 : 0}`)
    .join('|');
  return [
    Math.floor(config.seed),
    normalizeNumber(config.timeStepMs, 4),
    normalizeNumber(config.spawnOffsetRatio, 6),
    normalizeNumber(config.initialVelocityX, 6),
    pointsPart,
  ].join(',');
};

export const createSeededRandom = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let v = Math.imul(t ^ (t >>> 15), 1 | t);
    v ^= v + Math.imul(v ^ (v >>> 7), 61 | v);
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
};

export const parseTrajectoryCsv = (csvText: string): TrajectoryRow[] => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  if (lines.length <= 1) return [];

  const rows: TrajectoryRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(',').map((part) => part.trim());
    const [slotRaw, seedRaw, stepRaw, offsetRaw, vxRaw, pointsRaw] = parts;
    const slotIndex = Math.floor(toFinite(slotRaw, -1));
    const seed = Math.floor(toFinite(seedRaw, Date.now() + i));
    const timeStepMs = toFinite(stepRaw, DEFAULT_STEP_MS);
    const spawnOffsetRatio = toFinite(offsetRaw, 0);
    const initialVelocityX = toFinite(vxRaw, 0);
    // 解析轨迹点：格式为
    // 旧版：x1,y1,hit1|x2,y2,hit2|...
    // 新版：x1,y1,hit1,t1|x2,y2,hit2,t2|...  （t 为相对起点的毫秒数）
    const trajectoryPoints: TrajectoryPoint[] | undefined = typeof pointsRaw === 'string' && pointsRaw.length > 0
      ? pointsRaw
          .split('|')
          .map((part) => {
            const segments = part.split(',');
            const [xRaw, yRaw, hitRaw, tRaw] = segments;
            const x = Number(xRaw);
            const y = Number(yRaw);
            const hit = Number(hitRaw);
            const t = tRaw !== undefined ? Number(tRaw) : NaN;
            return {
              x: Number.isFinite(x) ? x : 0,
              y: Number.isFinite(y) ? y : 0,
              hit: hit === 1,
              pinIndex: undefined,
              timestamp: Number.isFinite(t) ? t : undefined,
            };
          })
          .filter((p) => p.x !== 0 || p.y !== 0)
      : undefined;

    if (slotIndex < 0) continue;

    rows.push({
      slotIndex,
      seed,
      timeStepMs,
      spawnOffsetRatio,
      initialVelocityX,
      trajectoryPoints: trajectoryPoints && trajectoryPoints.length > 0 ? trajectoryPoints : undefined,
    });
  }

  return rows;
};

export const loadTrajectoryCsv = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load trajectory csv: ${response.status}`);
  return response.text();
};

export const parseTrajectoryBinary = (buffer: ArrayBuffer): TrajectoryRow[] => {
  if (!buffer || buffer.byteLength < 8) return [];
  const view = new DataView(buffer);
  let offset = 0;
  const magic = view.getUint32(offset, true);
  offset += 4;
  // 'PLK2'
  if (magic !== 0x504C4B32) return [];

  const totalRows = view.getUint32(offset, true);
  offset += 4;
  const rows: TrajectoryRow[] = [];

  for (let r = 0; r < totalRows; r += 1) {
    if (offset + 1 + 4 + 4 + 4 + 4 + 2 + 2 > buffer.byteLength) break;
    const slotIndex = view.getUint8(offset);
    offset += 1;
    const seed = view.getInt32(offset, true);
    offset += 4;
    const timeStepMs = view.getFloat32(offset, true);
    offset += 4;
    const spawnOffsetRatio = view.getFloat32(offset, true);
    offset += 4;
    const initialVelocityX = view.getFloat32(offset, true);
    offset += 4;
    const pointCount = view.getUint16(offset, true);
    offset += 2;
    const hitCount = view.getUint16(offset, true);
    offset += 2;

    const trajectoryPoints: TrajectoryPoint[] = [];
    for (let i = 0; i < pointCount; i += 1) {
      // Each point has 15 bytes: x(4) + y(4) + timestamp(4) + hit(1) + pinIndexRaw(2)
      if (offset + 15 > buffer.byteLength) {
        console.warn(`[Plinko] Binary parsing truncated point data at offset ${offset}, buffer length: ${buffer.byteLength}`);
        break;
      }
      const x = view.getFloat32(offset, true);
      offset += 4;
      const y = view.getFloat32(offset, true);
      offset += 4;
      const timestamp = view.getFloat32(offset, true);
      offset += 4;
      const hit = view.getUint8(offset) === 1;
      offset += 1;
      const pinIndexRaw = view.getUint16(offset, true);
      offset += 2;
      trajectoryPoints.push({
        x,
        y,
        hit,
        pinIndex: pinIndexRaw === 65535 ? undefined : pinIndexRaw,
        timestamp,
      });
    }

    // Skip duplicated hitIndices tail (already represented in points)
    const hitBytes = hitCount * 2;
    if (offset + hitBytes <= buffer.byteLength) {
      offset += hitBytes;
    } else {
      console.warn(`[Plinko] Binary parsing truncated hitBytes at offset ${offset}, required: ${hitBytes}, buffer length: ${buffer.byteLength}`);
    }

    rows.push({
      slotIndex,
      seed,
      timeStepMs,
      spawnOffsetRatio,
      initialVelocityX,
      trajectoryPoints: trajectoryPoints.length > 0 ? trajectoryPoints : undefined,
    });
  }

  return rows;
};

const trajectoryBinaryInFlight = new Map<string, Promise<ArrayBuffer>>();
const TRAJECTORY_BINARY_CACHE_NAME = 'plinko-trajectory-binary-v1';
const TRAJECTORY_BINARY_CACHE_MAX_ENTRIES = 32;

const canUseCacheStorage = () => typeof window !== 'undefined' && 'caches' in window;
const isPlinkoTrajectoryBinaryPath = (pathname: string) =>
  /\/plinko-trajectory-cache(?:\.part\d+)?\.bin$/i.test(pathname);

const pruneTrajectoryBinaryCache = async (currentUrl: string) => {
  if (!canUseCacheStorage()) return;
  try {
    const cache = await caches.open(TRAJECTORY_BINARY_CACHE_NAME);
    const keys = await cache.keys();
    const current = new URL(currentUrl, window.location.href);
    const currentVersion = current.searchParams.get('v');
    const plinkoRequests = keys.filter((request) => {
      try {
        return isPlinkoTrajectoryBinaryPath(new URL(request.url).pathname);
      } catch {
        return false;
      }
    });

    if (currentVersion) {
      await Promise.all(
        plinkoRequests.map(async (request) => {
          try {
            const requestUrl = new URL(request.url);
            const requestVersion = requestUrl.searchParams.get('v');
            if (requestVersion && requestVersion !== currentVersion) {
              await cache.delete(request);
            }
          } catch {
            // ignore malformed request url
          }
        }),
      );
    }

    const nextKeys = await cache.keys();
    const nextPlinkoRequests = nextKeys.filter((request) => {
      try {
        return isPlinkoTrajectoryBinaryPath(new URL(request.url).pathname);
      } catch {
        return false;
      }
    });

    const overflow = nextPlinkoRequests.length - TRAJECTORY_BINARY_CACHE_MAX_ENTRIES;
    if (overflow > 0) {
      await Promise.all(nextPlinkoRequests.slice(0, overflow).map((request) => cache.delete(request)));
    }
  } catch {
    // ignore cache prune errors
  }
};

const readTrajectoryBinaryFromCache = async (url: string): Promise<ArrayBuffer | null> => {
  if (!canUseCacheStorage()) return null;
  try {
    const cache = await caches.open(TRAJECTORY_BINARY_CACHE_NAME);
    const cached = await cache.match(url);
    if (!cached || !cached.ok) return null;
    return await cached.arrayBuffer();
  } catch {
    return null;
  }
};

const writeTrajectoryBinaryToCache = async (url: string, response: Response) => {
  if (!canUseCacheStorage()) return;
  try {
    const cache = await caches.open(TRAJECTORY_BINARY_CACHE_NAME);
    await cache.put(url, response);
    await pruneTrajectoryBinaryCache(url);
  } catch {
    // ignore cache write errors and keep network result as source of truth
  }
};

export const loadTrajectoryBinary = async (url: string) => {
  const existing = trajectoryBinaryInFlight.get(url);
  if (existing) return existing;

  const request = (async () => {
    const cachedBuffer = await readTrajectoryBinaryFromCache(url);
    if (cachedBuffer) return cachedBuffer;

    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`Failed to load trajectory binary: ${response.status}`);
    void writeTrajectoryBinaryToCache(url, response.clone());
    return response.arrayBuffer();
  })();

  trajectoryBinaryInFlight.set(url, request);
  try {
    return await request;
  } finally {
    trajectoryBinaryInFlight.delete(url);
  }
};

export const loadTrajectoryBinaryChunks = async (urls: string[]): Promise<TrajectoryRow[]> => {
  if (!Array.isArray(urls) || urls.length === 0) return [];
  const buffers = await Promise.all(urls.map((url) => loadTrajectoryBinary(url)));
  
  const allRows: TrajectoryRow[] = [];
  
  // 尝试判断是否是新的独立PLK2块（每个块都有独立的magic头）
  // 或者是旧的直接切分字节的数据块
  const firstBuffer = buffers[0];
  if (firstBuffer && firstBuffer.byteLength >= 8) {
    const view = new DataView(firstBuffer);
    const magic = view.getUint32(0, true);
    if (magic === 0x504C4B32) {
      // 检查后续块是否也是独立的 PLK2 文件
      let isAllIndependent = true;
      for (let i = 1; i < buffers.length; i++) {
        const buf = buffers[i];
        if (buf.byteLength >= 8) {
          const v = new DataView(buf);
          if (v.getUint32(0, true) !== 0x504C4B32) {
            isAllIndependent = false;
            break;
          }
        } else {
          isAllIndependent = false;
          break;
        }
      }

      if (isAllIndependent) {
        // 如果全都是独立的 PLK2 块，分别解析并合并
        buffers.forEach((buffer) => {
          const rows = parseTrajectoryBinary(buffer);
          allRows.push(...rows);
        });
        return allRows;
      }
    }
  }

  // 旧版兼容：合并所有字节，然后一次性解析
  const totalBytes = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  buffers.forEach((buffer) => {
    const chunk = new Uint8Array(buffer);
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return parseTrajectoryBinary(merged.buffer);
};

export class PlinkoTrajectoryCache {
  private readonly staticConfigs = new Map<number, TrajectoryConfig[]>();
  private readonly dynamicConfigs = new Map<number, TrajectoryConfig[]>();
  private readonly staticHits = new Map<number, number[]>();
  private readonly seedHits = new Map<number, Map<number, number>>();
  private readonly options: CreateTrajectoryCacheOptions;
  private readonly random: () => number;
  private readonly collectedForExport: TrajectoryRow[] = [];
  private slotCount = 0;

  constructor(options: CreateTrajectoryCacheOptions) {
    this.options = options;
    const deterministicMode = options.deterministicMode === true;
    const deterministicSeed = Math.floor(options.deterministicSeed ?? 1_234_567_891);
    this.random = deterministicMode ? createSeededRandom(deterministicSeed) : Math.random;
  }

  setStaticRows(rows: TrajectoryRow[]) {
    this.staticConfigs.clear();
    this.staticHits.clear();
    this.seedHits.clear();

    if (rows.length === 0) {
      this.slotCount = 0;
      return;
    }

    this.slotCount = rows.reduce((max, row) => Math.max(max, row.slotIndex), 0) + 1;
    const grouped = new Map<number, TrajectoryConfig[]>();

    rows.forEach((row) => {
      const list = grouped.get(row.slotIndex) ?? [];
      list.push({
        seed: row.seed,
        timeStepMs: row.timeStepMs,
        spawnOffsetRatio: row.spawnOffsetRatio,
        initialVelocityX: row.initialVelocityX,
        trajectoryPoints: row.trajectoryPoints,
      });
      grouped.set(row.slotIndex, list);
    });

    grouped.forEach((list, slotIndex) => {
      const dedupedMap = new Map<string, TrajectoryConfig>();
      list.forEach((item) => {
        const normalized = normalizeTrajectoryConfig(item);
        dedupedMap.set(buildConfigDedupKey(normalized), normalized);
      });

      const cleaned = Array.from(dedupedMap.values()).sort((a, b) => {
        const aPathLength = a.trajectoryPoints?.length ?? 0;
        const bPathLength = b.trajectoryPoints?.length ?? 0;
        if (aPathLength !== bPathLength) return bPathLength - aPathLength;
        if (a.timeStepMs !== b.timeStepMs) return a.timeStepMs - b.timeStepMs;
        return a.seed - b.seed;
      });

      const limit = this.getStaticLimit(slotIndex);
      const selected = cleaned.slice(0, limit);
      this.staticConfigs.set(slotIndex, selected);
      this.staticHits.set(slotIndex, new Array(selected.length).fill(0));
      this.seedHits.set(slotIndex, new Map<number, number>());
    });
  }

  private getSeedHits(slotIndex: number, seed: number) {
    const slotSeedHits = this.seedHits.get(slotIndex);
    if (!slotSeedHits) return 0;
    return slotSeedHits.get(seed) ?? 0;
  }

  private bumpSeedHits(slotIndex: number, seed: number) {
    const slotSeedHits = this.seedHits.get(slotIndex) ?? new Map<number, number>();
    const next = (slotSeedHits.get(seed) ?? 0) + 1;
    slotSeedHits.set(seed, next);
    this.seedHits.set(slotIndex, slotSeedHits);
  }

  private withRuntimeVariation(slotIndex: number, config: TrajectoryConfig) {
    const seedHits = this.getSeedHits(slotIndex, config.seed);
    if (seedHits <= 0) return config;

    const mix = ((config.seed >>> 0) ^ ((slotIndex + 1) * 2654435761) ^ (seedHits * 2246822519)) >>> 0;
    const jitterRatio = ((mix % 1001) / 1000) - 0.5;
    const velocityJitter = jitterRatio * 0.08;
    const offsetJitter = jitterRatio * 0.03;

    return {
      ...config,
      initialVelocityX: Math.max(-1.4, Math.min(1.4, config.initialVelocityX + velocityJitter)),
      spawnOffsetRatio: Math.max(-1, Math.min(1, config.spawnOffsetRatio + offsetJitter)),
    };
  }

  private getCenterProximity(slotIndex: number) {
    if (this.slotCount <= 1) return 1;
    const center = (this.slotCount - 1) / 2;
    const maxDistance = center === 0 ? 1 : center;
    const distance = Math.abs(slotIndex - center);
    return Math.max(0, 1 - distance / maxDistance);
  }

  private getStaticLimit(slotIndex: number) {
    // 使用配置的每个槽位路径数量
    const configCount = SLOT_PATH_COUNTS[slotIndex];
    if (configCount !== undefined) return configCount;
    // 回退到原来的计算逻辑
    const base = Math.max(1, Math.floor(this.options.staticConfigsPerSlot));
    const centerProximity = this.getCenterProximity(slotIndex);
    const centerBonus = Math.round(base * 0.6 * centerProximity);
    return base + centerBonus;
  }

  private computeDynamicLimit(slotIndex: number) {
    const base = Math.min(50, Math.max(1, Math.floor(this.options.dynamicConfigsPerSlot)));
    const centerProximity = this.getCenterProximity(slotIndex);
    const edgeFloor = Math.max(8, Math.round(base * 0.45));
    const scaled = Math.round(edgeFloor + (base - edgeFloor) * centerProximity);
    return Math.min(50, Math.max(1, scaled));
  }

  takeConfig(slotIndex: number): { config: TrajectoryConfig; source: TrajectoryCacheSource } | null {
    // 优先使用静态配置
    const staticList = this.staticConfigs.get(slotIndex);
    const staticHitList = this.staticHits.get(slotIndex);
    if (staticList && staticList.length > 0 && staticHitList && staticHitList.length === staticList.length) {
      let minSeedHits = Number.POSITIVE_INFINITY;
      let minConfigHits = Number.POSITIVE_INFINITY;
      const tiedIndexes: number[] = [];

      for (let i = 0; i < staticHitList.length; i += 1) {
        const seedHits = this.getSeedHits(slotIndex, staticList[i]?.seed ?? 0);
        const configHits = staticHitList[i] ?? 0;

        if (seedHits < minSeedHits || (seedHits === minSeedHits && configHits < minConfigHits)) {
          minSeedHits = seedHits;
          minConfigHits = configHits;
          tiedIndexes.length = 0;
          tiedIndexes.push(i);
          continue;
        }

        if (seedHits === minSeedHits && configHits === minConfigHits) {
          tiedIndexes.push(i);
        }
      }

      const randomPick = tiedIndexes.length > 1
        ? Math.floor(this.random() * tiedIndexes.length)
        : 0;
      const selectedIndex = tiedIndexes[randomPick] ?? 0;

      staticHitList[selectedIndex] = (staticHitList[selectedIndex] ?? 0) + 1;
      const selected = staticList[selectedIndex];
      const varied = this.withRuntimeVariation(slotIndex, selected);
      this.bumpSeedHits(slotIndex, selected.seed);
      return { config: varied, source: 'static' };
    }

    // 静态配置用尽后，回退到动态配置
    const dynamicList = this.dynamicConfigs.get(slotIndex);
    if (dynamicList && dynamicList.length > 0) {
      let minSeedHits = Number.POSITIVE_INFINITY;
      const tiedIndexes: number[] = [];

      for (let i = 0; i < dynamicList.length; i += 1) {
        const seedHits = this.getSeedHits(slotIndex, dynamicList[i]?.seed ?? 0);
        if (seedHits < minSeedHits) {
          minSeedHits = seedHits;
          tiedIndexes.length = 0;
          tiedIndexes.push(i);
          continue;
        }

        if (seedHits === minSeedHits) {
          tiedIndexes.push(i);
        }
      }

      const randomPick = tiedIndexes.length > 1
        ? Math.floor(this.random() * tiedIndexes.length)
        : 0;
      const selectedIndex = tiedIndexes[randomPick] ?? 0;

      const [config] = dynamicList.splice(selectedIndex, 1);
      const varied = this.withRuntimeVariation(slotIndex, config);
      this.bumpSeedHits(slotIndex, config.seed);
      return { config: varied, source: 'dynamic' };
    }

    return null;
  }

  pushDynamic(slotIndex: number, config: TrajectoryConfig) {
    if (slotIndex + 1 > this.slotCount) {
      this.slotCount = slotIndex + 1;
    }

    const list = this.dynamicConfigs.get(slotIndex) ?? [];
    const limit = this.computeDynamicLimit(slotIndex);
    if (list.length >= limit) {
      return;
    }

    const normalized = normalizeTrajectoryConfig(config);
    const incomingKey = buildConfigDedupKey(normalized);
    const hasDuplicate = list.some((existing) => buildConfigDedupKey(existing) === incomingKey);
    if (hasDuplicate) return;

    list.push(normalized);
    this.dynamicConfigs.set(slotIndex, list);
  }

  private readonly collectedKeys = new Set<string>();

  collectForStatic(slotIndex: number, config: TrajectoryConfig) {
    const normalized = normalizeTrajectoryConfig(config);
    // 生成唯一键：seed + spawnOffsetRatio + 碰撞钉子序列
    const hitPins = (normalized.trajectoryPoints ?? [])
      .filter(p => p.hit && p.pinIndex !== undefined)
      .map(p => p.pinIndex)
      .join('|');
    const key = `${slotIndex}|${normalized.seed}|${normalized.spawnOffsetRatio.toFixed(6)}|${hitPins}`;
    
    // 去重：已存在的配置不再添加
    if (this.collectedKeys.has(key)) {
      return;
    }
    this.collectedKeys.add(key);
    
    this.collectedForExport.push({
      slotIndex,
      seed: normalized.seed,
      timeStepMs: normalized.timeStepMs,
      spawnOffsetRatio: normalized.spawnOffsetRatio,
      initialVelocityX: normalized.initialVelocityX,
      trajectoryPoints: normalized.trajectoryPoints,
    });
  }

  resetCollected() {
    this.collectedForExport.length = 0;
    this.collectedKeys.clear();
  }

  exportCollectedCsv() {
    const header = 'slotIndex,seed,timeStepMs,spawnOffsetRatio,initialVelocityX,trajectoryPoints';
    const body = this.collectedForExport
      .map((row) => {
        const pointsPart = (row.trajectoryPoints ?? [])
          .map((p) => {
            const base = `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.hit ? 1 : 0}`;
            // 追加时间差，单位毫秒，保留 2 位小数；旧数据没有时间差时不写
            if (p.timestamp != null && Number.isFinite(p.timestamp)) {
              return `${base},${Number(p.timestamp).toFixed(2)}`;
            }
            return base;
          })
          .join('|');
        return `${row.slotIndex},${row.seed},${row.timeStepMs.toFixed(4)},${row.spawnOffsetRatio.toFixed(6)},${row.initialVelocityX.toFixed(6)},${pointsPart}`;
      })
      .join('\n');
    return body.length > 0 ? `${header}\n${body}` : header;
  }

  // 二进制导出：存储完整轨迹点 + 碰撞钉子索引，高效紧凑
  exportCollectedBinaryChunks(maxChunkSize: number): ArrayBuffer[] {
    const totalRows = this.collectedForExport.length;
    if (totalRows === 0) return [];

    const rawRowInfos = this.collectedForExport.map(row => {
      const allPoints = row.trajectoryPoints ?? [];
      const sampledPoints = allPoints;
      const pointCount = sampledPoints.length;
      
      const hitIndices = allPoints
        .filter(p => p.hit && p.pinIndex !== undefined)
        .map(p => p.pinIndex!);
      const hitCount = hitIndices.length;
      
      const rowSize = 1 + 4 + 4 + 4 + 4 + 2 + 2 + pointCount * 15 + hitCount * 2;
      return { row, sampledPoints, pointCount, hitIndices, hitCount, rowSize };
    });

    const slotToInfos = new Map<number, typeof rawRowInfos[number][]>();
    rawRowInfos.forEach(info => {
      const list = slotToInfos.get(info.row.slotIndex) ?? [];
      list.push(info);
      slotToInfos.set(info.row.slotIndex, list);
    });

    const orderedInfos: typeof rawRowInfos = [];
    const slotIndexes = Array.from(slotToInfos.keys()).sort((a, b) => a - b);
    let remaining = rawRowInfos.length;
    while (remaining > 0) {
      for (const slotIndex of slotIndexes) {
        const list = slotToInfos.get(slotIndex);
        if (!list || list.length === 0) continue;
        const info = list.shift()!;
        orderedInfos.push(info);
        remaining -= 1;
      }
    }

    const chunks: ArrayBuffer[] = [];
    let currentChunkRows: typeof orderedInfos = [];
    let currentChunkSize = 8; // magic(4) + totalRows(4)

    const pushChunk = () => {
      if (currentChunkRows.length === 0) return;
      const buffer = new ArrayBuffer(currentChunkSize);
      const view = new DataView(buffer);
      let offset = 0;
      
      view.setUint32(offset, 0x504C4B32, true);
      offset += 4;
      view.setUint32(offset, currentChunkRows.length, true);
      offset += 4;
      
      currentChunkRows.forEach(({ row, sampledPoints, pointCount, hitIndices, hitCount }) => {
        view.setUint8(offset, Math.min(255, Math.max(0, row.slotIndex)));
        offset += 1;
        view.setInt32(offset, row.seed, true);
        offset += 4;
        view.setFloat32(offset, row.timeStepMs, true);
        offset += 4;
        view.setFloat32(offset, row.spawnOffsetRatio, true);
        offset += 4;
        view.setFloat32(offset, row.initialVelocityX, true);
        offset += 4;
        view.setUint16(offset, Math.min(65535, pointCount), true);
        offset += 2;
        view.setUint16(offset, Math.min(65535, hitCount), true);
        offset += 2;
        
        sampledPoints.forEach(p => {
          view.setFloat32(offset, p.x, true);
          offset += 4;
          view.setFloat32(offset, p.y, true);
          offset += 4;
          view.setFloat32(offset, p.timestamp ?? 0, true);
          offset += 4;
          view.setUint8(offset, p.hit ? 1 : 0);
          offset += 1;
          view.setUint16(offset, p.pinIndex ?? 65535, true);
          offset += 2;
        });
        
        hitIndices.forEach(pinIndex => {
          view.setUint16(offset, Math.min(65535, Math.max(0, pinIndex)), true);
          offset += 2;
        });
      });
      
      chunks.push(buffer);
      currentChunkRows = [];
      currentChunkSize = 8;
    };

    for (const info of orderedInfos) {
      if (currentChunkSize + info.rowSize > maxChunkSize && currentChunkRows.length > 0) {
        pushChunk();
      }
      currentChunkRows.push(info);
      currentChunkSize += info.rowSize;
    }
    pushChunk();

    return chunks;
  }

  // 保持旧版接口兼容
  exportCollectedBinary(): ArrayBuffer {
    const chunks = this.exportCollectedBinaryChunks(Infinity);
    return chunks.length > 0 ? chunks[0] : new ArrayBuffer(0);
  }

  getDynamicCount(slotIndex: number) {
    return this.dynamicConfigs.get(slotIndex)?.length ?? 0;
  }

  getDynamicLimit(slotIndex: number) {
    return this.computeDynamicLimit(slotIndex);
  }

  hasReplayConfig(slotIndex: number) {
    const staticList = this.staticConfigs.get(slotIndex);
    if (staticList && staticList.some((config) => (config.trajectoryPoints?.length ?? 0) > 0)) {
      return true;
    }

    const dynamicList = this.dynamicConfigs.get(slotIndex);
    if (dynamicList && dynamicList.some((config) => (config.trajectoryPoints?.length ?? 0) > 0)) {
      return true;
    }

    return false;
  }

  canAcceptDynamic(slotIndex: number) {
    return this.getDynamicCount(slotIndex) < this.computeDynamicLimit(slotIndex);
  }

  hasAnyDynamicCapacity(slotCountHint?: number) {
    const count = Math.max(this.slotCount, slotCountHint ?? 0);
    if (count <= 0) return false;
    for (let i = 0; i < count; i += 1) {
      if (this.canAcceptDynamic(i)) return true;
    }
    return false;
  }

  getSlotCount() {
    return this.slotCount;
  }

  getCollectedCounts(slotCountHint?: number): number[] {
    // 使用 SLOT_PATH_COUNTS 的长度确保所有槽位都被统计
    const expectedSlotCount = SLOT_PATH_COUNTS.length;
    const count = Math.max(this.slotCount, slotCountHint ?? 0, expectedSlotCount);
    const counts = new Array<number>(count).fill(0);
    this.collectedForExport.forEach((row) => {
      if (row.slotIndex >= 0 && row.slotIndex < counts.length) {
        counts[row.slotIndex] += 1;
      }
    });
    return counts;
  }
}
