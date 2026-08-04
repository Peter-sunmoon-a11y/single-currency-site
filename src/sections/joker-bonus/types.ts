export type JokerApiStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type JokerLocalStatus =
  | "pending_stored"
  | "reserving"
  | "reserved_ready"
  | "joker_visible"
  | "clicked"
  | "box_selecting"
  | "opening"
  | "opened_reward"
  | "claiming";

export interface JokerRewardPreview {
  masked?: boolean;
  reward_amount?: string;
  reward_currency?: string;
  reward_amount_usdt?: string;
  claim_amount?: string;
  claim_currency?: string;
  claim_currency_default?: string;
  claim_currency_options?: string[];
  reward_rule_snapshot?: {
    amount: string;
    currency: string;
    wager: string;
  };
}

export interface JokerInstancePayload {
  has_instance?: boolean;
  instance_id: number;
  display_token?: string;
  status: JokerApiStatus;
  status_label?: string;
  created_at?: number;
  expires_at: number;
  display_visible_seconds?: number;
  box_count?: number;
  display_payload?: Record<string, unknown>;
  reward_preview?: JokerRewardPreview;
  deposit_bonus_id?: number;
  result?: string;
}

export interface JokerApiResponse<T = unknown> {
  code?: number;
  msg?: string;
  ok?: boolean;
  reason?: string;
  data: T;
}

export interface JokerCurrentData {
  has_instance: boolean;
  reason?: string;
  instance_id?: number;
  status?: JokerApiStatus;
  created_at?: number;
  expires_at?: number;
  display_token?: string;
  display_visible_seconds?: number;
  box_count?: number;
  reward_preview?: JokerRewardPreview;
  display_payload?: Record<string, unknown>;
}

export interface JokerMqttPayload {
  event: "joker_bonus_instance_created" | string;
  id?: string;
  instance_id?: number;
  user_id?: number;
  branch?: string;
  tier_key?: string;
  stat_date?: string;
  status?: string;
  api_status?: JokerApiStatus;
  created_at?: number;
  expires_at?: number;
  display_visible_seconds?: number;
  box_count?: number;
  source?: string;
  timestamp?: number;
}

export interface JokerPendingInstance {
  instance_id: number;
  status: JokerLocalStatus;
  api_status: JokerApiStatus;
  source: "mqtt" | "current";
  received_at_ms: number;
  created_at: number;
  expires_at: number;
  display_visible_seconds: number;
  box_count: number;
  display_token: string;
  reserved_at_ms: number;
  shown_at_ms: number;
  clicked_at_ms: number;
  selected_box_index: number | null;
  reward: JokerRewardPreview | null;
  last_error: string | null;
}

export interface JokerPendingState {
  version: 1;
  user_id: number;
  updated_at_ms: number;
  instances: Record<string, JokerPendingInstance>;
}
