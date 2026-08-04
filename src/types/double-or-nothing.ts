export type IDoubledUpProps = {
  don_record_id: string;
  is_win: boolean;
  final_amount: number;
};

export interface ICurrentPromo {
  promo_code: string;
  promo_type: number;
  expired_at: number;
  min_amount: string;
  bonus_amount: string;
  total_deposit: string;
}

export interface ICurrentPromoList {
  id: number;
  promo_code: string;
  promo_type: number;
  is_default: number;
  expired_at: number;
  created_at: number;
  min_amount: string;
  bonus_amount: string;
  total_deposit: string;
  bonus_rate: number;
  max_deposit: string;
  fiat_bonus_rate: number;
  crypto_bonus_rate: number;
}
