import type { Currency } from "@/types/currency";

export interface BetHistoryQueryParams {
  page?: number;
  page_size?: number;
  asset?: string;
  game?: string;
  game_type?: string;
  provider?: string;
  time_range?: number;
  start_time?: number;
  end_time?: number;
  last_id?: number | string;
}

export interface BetHistoryRecord {
  id?: number | string;
  bet_id?: string;
  game_order_id?: string | number;
  order_id?: string | number;
  game_name?: string;
  game_provider?: string;
  order_time?: number | string;
  created_at?: number | string;
  updated_at?: number | string;
  bet_amount?: number | string;
  win_amount?: number | string;
  currency?: string;
  real_currency?: string;
  account_currency?: string;
  game_type?: string;
  asset?: string;
  status?: number | string;
  handle_status?: number | string;
  competitor_name?: string;
  sport_name?: string;
  tournament_name?: string;
  settlement_currency?: string;
  settlement_bet_amount?: number | string;
  settlement_win_amount?: number | string;
  game_currency?: string;
  game_bet_amount?: number | string;
  game_win_amount?: number | string;
  turnover_currency?: string;
  turnover_amount?: number | string;
  [key: string]: unknown;
  game_category_1?: string;
  game_category_2?: string;
}

export interface BetHistoryPagination {
  current_page?: number;
  last_page?: number;
  has_more?: boolean;
  total?: number;
  per_page?: number;
  page_size?: number;
  next_page?: number;
  last_id?: number | string;
  next_last_id?: number | string;
}

export interface BetHistoryFilterOption {
  label: string;
  value: string;
}

export interface BetHistoryFilterGroup {
  games?: BetHistoryFilterOption[];
  assets?: string[];
  currencies?: string[];
  providers?: BetHistoryFilterOption[];
  [key: string]: unknown;
}

export interface BetHistoryPayload {
  records: BetHistoryRecord[];
  pagination?: BetHistoryPagination | null;
  filters?: BetHistoryFilterGroup;
  currencies?: Currency[];
  [key: string]: unknown;
}

export interface BetHistoryResponse {
  code?: number;
  msg?: string;
  data?: BetHistoryPayload | BetHistoryRecord[];
  pagination?: BetHistoryPagination;
  filters?: BetHistoryFilterGroup;
  [key: string]: unknown;
}
