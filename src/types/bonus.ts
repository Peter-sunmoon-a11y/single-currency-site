/**
 * Calendar Bonus 相关类型定义
 */

// 原始的 Calendar Bonus 数据结构
export interface CalendarBonus {
  id: string | number;
  amount: string;
  start_time: number;
  end_time: number;
  status: number; // 0: 未领取, 1: 已领取
  handle_status: number;
  currency?: string;
  time?: string; // 添加处理后的时间字段
}

// 处理后的日期卡片数据结构
export interface CalendarItem {
  date: Date;
  day: number;
  month: string;
  dayOfWeek: string;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  claimTime?: string;
  amount?: number;
  // 新增字段，与参考代码对应
  dayName: string;
  isActive: boolean;
  claimAmount: string;
  totalAmount: string;
  completed: number;
  bonuses: CalendarBonus[];
  hasBonus: boolean;
}

// 全局下一个解锁奖励状态
export interface NextUnlockingBonus {
  cardIndex: number;
  bonusIndex: number;
  bonusId: string | number;
  startTime: number;
}

// 倒计时状态
export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface AchievementStep {
  id: number;
  achievement_id: number;
  achievement_name: string;
  number: number;
  reward_amount: string;
  reward_currency: string;
  step: number;
  created_at: string;
  updated_at: string;
  version: number;
  finish_number: number;
  total_number: number;
  locked: boolean;
  is_finish: boolean;
  is_claim: boolean;
  reward_achievement_log_id: number;
  buddy_ball_count: number;
}

export type IGetMondayVipBonus = {
  id: number;
  user_id: number;
  week_start_time: number;
  week_end_time: number;
  current_wager: string;
  max_wager: string;
  value: string;
  claim_start_time: number;
  claim_end_time: number;
  claim_time: number;
  status: number;
};

export type IVipBonusClaim = {
  id: number;
  user_id: number;
  item: string;
  value: number;
  sum: number;
  locked: string;
  created_at: number;
  updated_at: number;
  expire_at: number;
  free_spin_record_id: number;
  currency: string;
  claim?: Record<string, any>;
};
