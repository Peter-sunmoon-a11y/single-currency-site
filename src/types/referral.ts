export interface ReferralListItem {
  id: string;
  down_line: string;
  down_line_username: string;
  refer_type: "direct" | "indirect";
  vip_level: number;
  reward: number;
  referral_code: string;
  regitration_date: number;
}

export interface GetReferralListParams {
  limit: number;
  last_id?: string;
  period?: "All" | "Today" | "Yesterday" | "This Week" | "Last Week" | "This Month" | "Last Month";
  type?: "All" | "direct" | "indirect";
  keyword?: string;
}

export interface ReferralListResponse {
  code: number;
  data: ReferralListItem[];
  msg?: string;
}

export interface AdTag {
  id: string;
  campaign: string;
  code: string;
  register_count: number;
  is_default: boolean;
  created_at: number;
  share_to_referee: string;
}

export interface AdTagListResponse {
  code: number;
  data: AdTag[];
  msg?: string;
}

export interface CreateAdTagParams {
  campaign: string;
  code: string;
  is_default?: boolean;
  share?: string;
}

export interface SetDefaultAdTagParams {
  id: string;
  campaign: string;
  code: string;
  is_default?: boolean;
  share?: string;
}

export interface SetDefaultAdTagResponse {
  code: number;
  data: AdTag;
  msg?: string;
}
export interface CommissionRecord {
  id: string;
  down_line: string;
  down_line_username: string;
  refer_type: "direct" | "indirect";
  game_type_2: string;
  reward: number;
  created_at: number;
}

export interface GetCommissionListParams {
  limit: number;
  page: number;
  up_line?: string;
}

export interface CommissionListResponse {
  code: number;
  data: CommissionRecord[];
  page: number;
  last_page: number;
  msg?: string;
}

export interface GetReferralRewardsListParams {
  limit: number;
  page: number;
}

export type ReferralRewardsRecord = {
  id: number;
  up_line: number;
  down_line: number;
  down_line_username: string;
  referral_code: string;
  reward: string;
  created_at: number;
  updated_at: number;
  downLineUserStatus: {
    user_id: number;
    vip: number;
  };
  downLineUser: {
    id: number;
    nickname: string;
  };
};

export interface ReferralRewardsListResponse {
  code: number;
  data: {
    code: number;
    data: ReferralRewardsRecord[];
    msg: string;
  };
  page: number;
  last_page: number;
  msg?: string;
}

export type IReferralDetail = {
  id: number;
  up_line: number;
  down_line: number;
  down_line_username: string;
  reward: string;
  down_line_level_before: number;
  down_line_level_after: number;
  created_at: number;
  updated_at: number;
  referral_code: string;
  type: string;
  refer_type: string;
  level_reward: string;
  group_reward: string;
  regitration_date: number;
  vip_level: number;
  username: string;
};

export type ICommissionDetail = {
  referral_code: string;
  referral_type: string;
  regitration_date: number;
  rewards_unlocked: string;
  username: string;
  vip_level: number;
  id: number;
};

export type IReferralRewardsDetail = {
  referral_code: string;
  referral_type: string;
  regitration_date: number;
  rewards_unlocked: string;
  username: string;
  vip_level: number;
  id: number;
};

export interface GlobalCommissionRecord {
  id: string;
  up_line: number;
  down_line: number;
  down_line_username: string;
  created_at: number;
  reward: string;
  refer_type: "direct" | "indirect";
  game_type_2: string;
  f1: string;
  f2: string;
  f3: string;
  f4: string;
  f5: string;
  f6: string;
  f7: string;
  f8: string;
  f9: string;
  f10: string;
  updated_at: number;
  version: number;
}

export interface GlobalCommissionsResponse {
  code: number;
  data: GlobalCommissionRecord[];
  msg: string;
}
