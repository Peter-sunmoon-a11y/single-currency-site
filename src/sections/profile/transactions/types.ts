export interface Transaction {
  id?: string | number;
  type?: string;
  date?: string;
  amount?: number | string;
  currency?: string;
  fromAmount?: number | string;
  fromCurrency?: string;
  toAmount?: number | string;
  toCurrency?: string;
  status?: string | number;
  created_at?: number;
  updated_at?: number;
  from_amount?: number | string;
  from_currency?: string;
  to_amount?: number | string;
  to_currency?: string;
  reward?: number | string;
  reward_currency?: string;
  commission_amount?: number | string;
  amount_real?: number | string;
  bonus?: number | string;
  deposit_type?: string;
  withdraw_type?: string;
  network?: string;
  currency_code?: string;
  [key: string]: any;
}

export interface TransactionFilters {
  type: string;
  status: string;
  asset: string;
  period: string;
}

export type TransactionType = "Deposit" | "Withdraw" | "Bonus" | "Swap" | "Referral" | "Commission";
