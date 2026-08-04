export interface RolloverRecord {
  id?: number | string;
  team_id?: number;
  user_id?: number;
  currency?: string;
  payment_gateway?: string;
  payment_gateway_id?: number;
  deposit_id?: string;
  amount?: string;
  status?: string;
  txid?: string | null;
  note?: string;
  created_at?: number;
  updated_at?: number;
  number?: string;
  expire_at?: number | null;
  network?: string;
  bonus?: string;
  wager?: string;
  max_wager?: string;
  promotion_id?: number;
  [key: string]: any;
}

export type RolloverStatusKey = "Not Started" | "Ongoing" | "Done" | "All Statuses";
export type RolloverTypeKey = "All" | "Deposit" | "Bonus";

export interface EnrichedRolloverRecord extends RolloverRecord {
  progressAmount: number;
  goalAmount: number;
  progressPercent: number;
  statusKey: string;
}
