// VIP 等级配置 - 根据实际 API 返回的字段
export interface IVipLevelConfig {
  id: number;
  vip: number; // VIP等级
  medal: "bronze" | "silver" | "gold" | "ruby" | "sapphire" | "platinum"; // 勋章类型
  xp: string; // 所需经验值
  group: string; // 分组
  level_up: string; // 升级奖励
  referral: string; // 推荐佣金
  cashback_other: string; // 每日返现 - 其他
  cashback_sport: string; // 每日返现 - 体育
  rakeback: string; // 返水
  created_at?: number;
  updated_at?: number;
  version?: number;
}

// VIP 奖励行配置
export interface VipRewardRow {
  icon: string;
  label: string;
  type: "currency" | "percentage" | "boolean";
  field: keyof IVipLevelConfig | string; // 对应的字段名
  getValue: (config: IVipLevelConfig) => string | boolean;
}
