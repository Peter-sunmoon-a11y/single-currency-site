import { VIP_REQUIREMENTS } from "@/sections/bonus/shared/config";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toArray = <T, >(value: T[] | null | undefined): T[] => (Array.isArray(value) ? value : []);

const toRecord = (value: unknown): Record<string, any> => (
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, any>
    : {}
);

export const resolveJesterIntroConfig = (value: unknown) => {
  const record = toRecord(value);
  const nestedData = toRecord(record.data);

  if (Object.keys(nestedData).length > 0 && !("title" in record) && !("min_vip" in record) && !("prizes" in record)) {
    return nestedData;
  }

  return record;
};

export const getJesterRequiredVipLevel = (config: Record<string, any>) => (
  toNumber(
    config?.min_vip_level ??
    VIP_REQUIREMENTS.jester.requiredLevel
  )
);

export const getJesterVisible = (config: Record<string, any>) => {
  const raw = config?.show ?? config?.enabled ?? config?.is_show ?? config?.visible ?? config?.display;
  if (raw === undefined || raw === null) return true;
  if (typeof raw === "boolean") return raw;
  return toNumber(raw) !== 0;
};

export const getJesterTitle = (config: Record<string, any>, fallbackTitle: string) => (
  config?.title ??
  config?.name ??
  config?.intro_title ??
  fallbackTitle
);

export const getJesterDescription = (config: Record<string, any>, fallbackDescription: string) => (
  config?.description ??
  config?.desc ??
  config?.intro_description ??
  config?.content ??
  fallbackDescription
);

export const getJesterPrizepoolText = (config: Record<string, any>) => (
  config?.prizepool_text ??
  config?.prize_pool_text ??
  config?.prizepool ??
  config?.prize_pool ??
  config?.prizepool_label ??
  config?.prize_pool_label ??
  ""
);

export const getJesterPrizes = (config: Record<string, any>) => (
  toArray<Record<string, any>>(
    config?.prizes ??
    config?.prize_list ??
    config?.prizeList ??
    config?.rewards ??
    config?.reward_list ??
    config?.award_list ??
    config?.list
  )
);

export const formatJesterPrizeValue = (item: Record<string, any>) => {
  const directText = item?.display_amount ?? item?.amount_text ?? item?.prize_text ?? item?.value_text ?? item?.reward_text;
  if (directText) return String(directText);

  const amountRaw = item?.amount ?? item?.value ?? item?.reward_amount ?? item?.prize_amount;
  const amount = Number(amountRaw);
  const amountText = Number.isFinite(amount) ? amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : amountRaw;
  const prefix = item?.currency_symbol ?? item?.symbol ?? item?.prefix ?? "";
  const suffix = item?.currency_code ?? item?.currency ?? item?.unit ?? item?.suffix ?? "";

  return `${prefix}${amountText ?? ""}${suffix ? ` ${suffix}` : ""}`.trim();
};

export const getJesterPrizeAmountAndCurrency = (item: Record<string, any>) => {
  const amountRaw = item?.amount ?? item?.value ?? item?.reward_amount ?? item?.prize_amount;
  const amount = Number(amountRaw);
  const currency = String(item?.currency_code ?? item?.currency ?? item?.unit ?? "").trim();

  if (!Number.isFinite(amount) || !currency) return null;

  return { amount, currency };
};

export const getJesterPrizeLabel = (item: Record<string, any>) => (
  item?.label ??
  item?.title ??
  item?.name ??
  "PRIZE"
);
