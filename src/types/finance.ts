export type ICoin = {
  id: number;
  currency: string;
  decimal: number;
  withdraw_fee_rate: string;
  withdraw_fee_fix: string;
  min_withdraw: string;
  max_withdraw: string;
  created_at: number;
  updated_at: number;
  network: string;
  contract_address: string;
  min_deposit: string;
};

export type ICurrency = {
  id: number;
  currency: string;
  currency_type: "CRYPTO" | "FIAT" | "REWARDS";
  decimal: number;
  min_withdraw: string;
  max_withdraw: string;
  min_deposit: string;
  created_at: number;
  updated_at: number;
  icon: string | null;
  display_decimal: number;
  display_name: string;
  swap_fee_rate: string;
  bet_gas_rate: string;
  can_swap_from: number;
  can_withdraw: number;
  can_swap_to: number;
  can_deposit: number;
  is_default: boolean;
  weight: number;
};

export type IFiatGateway = {
  _row_id: string;
  pay_bankcode: string;
  min: number;
  max: number;
  active: boolean;
  timeout: number;
  icon: string;
  recommended: number[];
  display_name: string;
  gateway_id: number;
  [key: string]: any;
};

export type ICryptoGateway = {
  min: number;
  max: number;
  network: string;
  display_name: string;
  fee_rate: number;
  fee_fix: number;
  gas_currency: string;
  recommended: number[];
  gateway_id: number;
  can_deposit: number;
  can_withdraw: number;
  icon: string;
};

export type CryptoGroup = {
  currency: string;
  networks: ICryptoGateway[];
  coins: ICoin[];
  min_deposit: string;
};
