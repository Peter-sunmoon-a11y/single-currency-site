/**
 * Free Spin 状态枚举
 */
export enum FreeSpinStatus {
  NOT_STARTED = 0, // 未开始
  ONGOING = 2, // 进行中
  CLAIM = 3, // 可领取
  CLAIMED = 4, // 已领取
  CANCELLED = 6, // 已取消
}

/**
 * Free Spin 奖励接口
 */
export interface IFreeSpinBonus {
  id: number | string;
  free_spin_code: string;
  bet_count: number; // 总旋转次数
  current_bet_count?: number; // 已使用次数
  remaining_bets?: number; // 剩余次数
  win_amount: string; // 赢得金额
  currency: string; // 货币类型
  turnover_limit_usdt: string; // 总流水要求
  current_turnover_limit_usdt: string; // 当前流水
  handle_status: FreeSpinStatus; // 处理状态
  status?: number;
  expired_at?: number; // 过期时间戳
  created_at?: number; // 创建时间戳
  updated_at?: number; // 更新时间戳
  claimed_at?: number; // 领取时间戳
  game_id?: string; // 游戏ID
  game_title?: string; // 游戏标题
  game_icon?: string; // 游戏图标
  template_key?: string; // 模板key
  max_win_limit?: string; // 最大赢得限制
  status_text?: string;
  handle_status_text?: string;
  is_expired?: boolean;
  is_turnover_requirement_met?: boolean;
  remaining_time?: number;
  init_start_at?: number;
  callback_end_at?: number;
  [key: string]: any;
}

/**
 * 状态标签映射
 */
export const FREE_SPIN_STATUS_LABELS: Record<FreeSpinStatus, string> = {
  [FreeSpinStatus.NOT_STARTED]: "Not Started",
  [FreeSpinStatus.ONGOING]: "Ongoing",
  [FreeSpinStatus.CLAIM]: "Claim",
  [FreeSpinStatus.CLAIMED]: "Claimed",
  [FreeSpinStatus.CANCELLED]: "Cancelled",
};

export const FREE_SPIN_STATUS_I18N_KEYS: Record<FreeSpinStatus, string> = {
  [FreeSpinStatus.NOT_STARTED]: "bonus:status.notStarted",
  [FreeSpinStatus.ONGOING]: "bonus:status.ongoing",
  [FreeSpinStatus.CLAIM]: "bonus:status.claim",
  [FreeSpinStatus.CLAIMED]: "bonus:status.claimed",
  [FreeSpinStatus.CANCELLED]: "bonus:status.cancelled",
};

/**
 * 状态样式类映射
 */
export const FREE_SPIN_STATUS_CLASSES: Record<FreeSpinStatus, string> = {
  [FreeSpinStatus.NOT_STARTED]: "border-warning text-warning",
  [FreeSpinStatus.ONGOING]: "border-info text-info",
  [FreeSpinStatus.CLAIM]: "border-primary bg-primary text-primary-content",
  [FreeSpinStatus.CLAIMED]: "border-success text-success",
  [FreeSpinStatus.CANCELLED]: "border-base-content/40 text-base-content/70",
};

const isTurnoverMet = (record?: Partial<IFreeSpinBonus>): boolean => {
  if (record?.is_turnover_requirement_met != null) {
    return Boolean(record.is_turnover_requirement_met);
  }

  const total = Number(record?.turnover_limit_usdt);
  const current = Number(record?.current_turnover_limit_usdt);
  if (!Number.isFinite(total) || total <= 0) {
    return true;
  }

  if (!Number.isFinite(current)) {
    return false;
  }

  return current >= total - 1e-6;
};

const normalizeStatus = (value?: number | string | null): FreeSpinStatus => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return FreeSpinStatus.NOT_STARTED;
  }
  if (numeric in FreeSpinStatus) {
    return numeric as FreeSpinStatus;
  }
  return FreeSpinStatus.NOT_STARTED;
};

export const resolveFreeSpinStatus = (record?: Partial<IFreeSpinBonus>): FreeSpinStatus => {
  const legacyStatus = Number(record?.handle_status ?? record?.status);
  if (legacyStatus === 5) {
    return FreeSpinStatus.CLAIMED;
  }

  const rawStatus = normalizeStatus(legacyStatus);

  if (rawStatus === FreeSpinStatus.CLAIMED) {
    return FreeSpinStatus.CLAIM;
  }

  if (rawStatus === FreeSpinStatus.ONGOING) {
    const currentTurnover = Number(record?.current_turnover_limit_usdt ?? 0);
    if (!Number.isFinite(currentTurnover) || currentTurnover <= 0) {
      return FreeSpinStatus.NOT_STARTED;
    }
  }

  if (rawStatus === FreeSpinStatus.CLAIM && !isTurnoverMet(record)) {
    return FreeSpinStatus.ONGOING;
  }

  return rawStatus;
};
