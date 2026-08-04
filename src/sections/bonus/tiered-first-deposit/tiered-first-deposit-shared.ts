import { Decimal } from "decimal.js";
import type { ExchangeRates } from "@/types/currency";

export type TieredFirstDepositState = "not_deposited" | "processing" | "claimable" | "hidden";

export type TieredFirstDepositTier = {
  seq: number;
  threshold_amount: string | number;
  reward_amount: string | number;
  wager_multiplier?: string | number;
};

export type TieredFirstDepositSummary = {
  state: TieredFirstDepositState;
  visible: boolean;
  claimable: boolean;
  config_currency: string;
  tiers: TieredFirstDepositTier[];
  matched_tier_seq?: number;
  first_deposit_currency?: string;
  reward_amount?: string | number;
  reward_currency?: string;
};

type CurrencyConverter = (params: {
  amount: string | number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRates: ExchangeRates;
  decimals?: number;
}) => number;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const normalizeTieredFirstDepositSummary = (data: any): TieredFirstDepositSummary | null => {
  if (!data || typeof data !== "object") return null;

  return {
    state: data.state ?? "hidden",
    visible: Boolean(data.visible),
    claimable: Boolean(data.claimable),
    config_currency: data.config_currency || "USDT",
    tiers: Array.isArray(data.tiers) ? data.tiers : [],
    matched_tier_seq: data.matched_tier_seq != null ? Number(data.matched_tier_seq) : undefined,
    first_deposit_currency: data.first_deposit_currency || undefined,
    reward_amount: data.reward_amount,
    reward_currency: data.reward_currency || undefined
  };
};

export const getTieredFirstDepositMatchedTier = (
  summary: TieredFirstDepositSummary | null | undefined,
  matchedTierSeq?: number | null
) => {
  if (!summary) return null;
  const seq = matchedTierSeq ?? summary.matched_tier_seq;
  if (seq == null) return null;
  return summary.tiers.find((tier) => Number(tier.seq) === Number(seq)) ?? null;
};

export const getTieredFirstDepositMatchedReward = ({
  summary,
  depositAmount,
  depositCurrency,
  exchangeRates,
  convertCurrency
}: {
  summary: TieredFirstDepositSummary | null | undefined;
  depositAmount?: string | number;
  depositCurrency?: string;
  exchangeRates: ExchangeRates;
  convertCurrency: CurrencyConverter;
}) => {
  if (!summary || !depositCurrency || !Decimal(depositAmount || 0).gt(0)) {
    return null;
  }

  const tiers = [...summary.tiers].sort((a, b) => toNumber(a.threshold_amount) - toNumber(b.threshold_amount));
  if (tiers.length === 0) return null;

  const amountInConfigCurrency = convertCurrency({
    amount: depositAmount || 0,
    fromCurrency: depositCurrency,
    toCurrency: summary.config_currency,
    exchangeRates
  });

  const matchedTier = [...tiers]
    .reverse()
    .find((tier) => Decimal(amountInConfigCurrency || 0).gte(toNumber(tier.threshold_amount)));

  if (!matchedTier) return null;

  const rewardCurrency = depositCurrency;
  const rewardAmount = convertCurrency({
    amount: matchedTier.reward_amount || 0,
    fromCurrency: summary.config_currency,
    toCurrency: rewardCurrency,
    exchangeRates
  });

  return {
    tier: matchedTier,
    amount: new Decimal(rewardAmount || 0).toString(),
    currency: rewardCurrency
  };
};
