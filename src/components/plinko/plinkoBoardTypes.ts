// All TypeScript types and interfaces used by PlinkoBoard

export type BuddyBallRequestType = "GetBall" | "GetBallCount" | "GetBuddyBallConfig";

export type BuddyBallApiPayload = {
  code: number;
  msg: string;
  data: Record<string, unknown>;
};

export interface BuddyBallApi {
  getBuddyBallConfig: () => Promise<BuddyBallApiPayload>;
  getBallCount:       () => Promise<BuddyBallApiPayload>;
  getBall:            () => Promise<BuddyBallApiPayload>;
  onBallFallDown?:    () => void;
}

// 轨迹点数据结构 - 相对于三角形宽高比例位置
export interface TrajectoryPoint {
  x: number;          // 相对于三角形宽度的比例 (0-1)
  y: number;          // 相对于三角形高度的比例 (0-1)
  hit: boolean;       // 是否碰到钉子
  pinIndex?: number;  // 碰到的钉子索引
  timestamp?: number; // 采样时的时间戳（相对于轨迹开始的毫秒数）
}

export interface BallMeta {
  hidden: boolean;
  hiddenSettled?: boolean;
  hiddenTimedOut?: boolean;
  hiddenSpawnTime?: number;
  hiddenPhysicsElapsedMs?: number;
  hiddenHighPrecisionUntilMs?: number;
  requestId?: string;
  hiddenPendingSlotIndex?: number;
  hiddenSettledSlotIndex?: number;
  hiddenSettledAt?: number;
  seed: number;
  timeStepMs: number;
  spawnOffsetRatio: number;
  initialVelocityX: number;
  cacheSource: "static" | "dynamic" | "natural";
  targetSlotIndex: number | null;
  assignedSlotIndex?: number | null;
  rewardMultiplier?: number | null;
  trajectoryPoints: TrajectoryPoint[];
  trajectoryCursor: number;
  trajectoryElapsedMs?: number;
  // 隐藏球专用 - 记录物理路径用于生成轨迹点（带时间戳）
  physicsPath?: { x: number; y: number; hit: boolean; pinIndex?: number; timestamp: number }[];
  // 可见球专用
  trajectoryStartTime?: number;
  visibleBagTop?: number;
  // 碰撞计数器（用于音效）
  hitCount: number;
  lastHitTime: number;
  lastBounceSpeed?: number;
  lastPinContactAt?: number;
  lastPinContactX?: number;
  lastAntiStallAt?: number;
  trajectoryCompleted?: boolean;
  visibleSettled?: boolean;
}

export type CorrectionSnapshot = {
  slotIndex: number;
  interventions: number;
  correctionEnergy: number;
  impactCount: number;
  averageAbsImpactOffset: number;
  averageImpactDeltaMs: number;
};

export type CorrectionStats = {
  totalSettledBalls: number;
  totalInterventions: number;
  totalCorrectionEnergy: number;
  totalImpacts: number;
  averageInterventionsPerBall: number;
  averageCorrectionEnergyPerBall: number;
  averageImpactsPerBall: number;
  recent: CorrectionSnapshot[];
};

export type ExchangeRateInfo = {
  usdtRate: number;
  exchangeRate: number;
  currencySymbol: string;
};

export interface WinEntry {
  id: number;
  amount: number;
  amountUsdt?: number;
  displayAmount: string;
  currencySymbol: string;
  colorBg: string;
  colorBorder: string;
  colorNum: string;
}

export interface PlinkoBoardProps {
  dropX?: number;
  dropSpread?: number;
  targetSlotIndex?: number;
  buddyBallApi: Record<string, any>;
}
