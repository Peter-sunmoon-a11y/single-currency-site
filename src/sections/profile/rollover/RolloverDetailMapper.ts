import dayjs from "dayjs";
import type { TFunction } from "@/lib/i18n/i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import type { EnrichedRolloverRecord } from "./types";

export type RolloverDetailViewModel = {
  amountLabel: string;
  currency: string;
  infoRows: Array<{ label: string; value: string }>;
};

const DATE_FORMAT = "DD MMM [']YY · HH:mm";

export const useRolloverDetailMapper = () => {
  const { formatWithoutConversion } = useDisplayCurrencyFormatter();

  return ({
    record,
    t,
  }: {
    record: EnrichedRolloverRecord;
    t: TFunction;
  }): RolloverDetailViewModel => {
    const currency = record.currency ?? "USD";
    const amount = parseAmount(record.amount) + parseAmount(record.bonus);
    const formattedAmount = formatWithoutConversion(amount, currency, {
      showSymbol: false,
      showCode: true,
      minimizeDecimals: true,
    }).formatted;

    const amountLabel = amount > 0 ? `+${formattedAmount}` : formattedAmount;
    const infoRows = buildInfoRows(record, t, formatWithoutConversion);

    return {
      amountLabel,
      currency,
      infoRows,
    };
  };
};

const buildInfoRows = (
  record: EnrichedRolloverRecord,
  t: TFunction,
  formatWithoutConversion: ReturnType<typeof useDisplayCurrencyFormatter>["formatWithoutConversion"]
) => {
  const rows: Array<{ label: string; value: string }> = [];

  // Status
  const statusLabel = getStatusLabel(record.statusKey, t);
  rows.push({
    label: t("transaction:tableHeaders.status"),
    value: statusLabel,
  });

  // Type
  const typeLabel = record.network === "bonus" 
    ? t("transaction:transactionTypes.bonus") 
    : t("transaction:transactionTypes.deposit");
  rows.push({
    label: t("transaction:filters.type"),
    value: typeLabel.toUpperCase(),
  });

  // Created On
  const createdAt = formatTimestamp(record.created_at, DATE_FORMAT);
  if (createdAt) {
    rows.push({
      label: t("transaction:common.createdOn", "Created On"),
      value: createdAt,
    });
  }

  // Rollover (wager requirement multiplier)
  const wagerMultiplier = getWagerMultiplier(record);

  if (wagerMultiplier) {
    rows.push({
      label: t("transaction:rollover.rolloverMul", "Rollover"),
      value: wagerMultiplier,
    });
  }

  // Wager Required (Total wager requirement)
  const wagerRequired = formatWithoutConversion(record.goalAmount, record.currency ?? "USD", {
    showSymbol: true,
    showCode: false,
    minimizeDecimals: true,
  }).formatted;
  rows.push({
    label: t("transaction:rollover.wagerRequirement", "Wager Required"),
    value: wagerRequired,
  });

  // Wager Completed (Already wagered amount)
  const wagerCompleted = formatWithoutConversion(record.progressAmount, record.currency ?? "USD", {
    showSymbol: true,
    showCode: false,
    minimizeDecimals: true,
  }).formatted;
  rows.push({
    label: t("transaction:rollover.wagerCompleted", "Wager Completed"),
    value: wagerCompleted,
  });

  // Unlocked Funds (Amount that will be unlocked when rollover is complete)
  // When status is "Done" (progressPercent === 1), show the original amount + bonus
  const isComplete = record.statusKey === "Done" || record.progressPercent >= 1;
  const originalAmount = Number(record.amount ?? 0);
  const bonusAmount = Number(record.bonus ?? 0);
  const unlockedAmount = isComplete ? (originalAmount + bonusAmount) : 0;
  
  const unlockedFunds = formatWithoutConversion(unlockedAmount, record.currency ?? "USD", {
    showSymbol: true,
    showCode: false,
    minimizeDecimals: true,
  }).formatted;
  rows.push({
    label: t("transaction:rollover.unlockedFunds", "Unlocked Funds"),
    value: unlockedFunds,
  });

  return rows;
};

const parseAmount = (value: unknown): number => {
  const numeric = typeof value === "string" ? Number(value) : Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatTimestamp = (value: unknown, format: string) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = value > 1_000_000_000_000 ? value : value * 1000;
    return dayjs(normalized).isValid() ? dayjs(normalized).format(format) : null;
  }
  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      const normalized = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
      if (dayjs(normalized).isValid()) return dayjs(normalized).format(format);
    }
    const parsed = dayjs(value);
    if (parsed.isValid()) return parsed.format(format);
  }
  return null;
};

const getStatusLabel = (statusKey: string, t: TFunction) => {
  const key =
    statusKey === "Done"
      ? "done"
      : statusKey === "Ongoing"
        ? "ongoing"
        : statusKey === "Not Started"
          ? "notStarted"
          : "unknown";

  return t(`transaction:transactionStatus.${key}`, statusKey).toUpperCase();
};

const getWagerMultiplier = (record: EnrichedRolloverRecord): string | null => {
  const amount = Number(record.amount ?? 0);
  const bonus = Number(record.bonus ?? 0);
  const baseAmount = record.network === "bonus" ? bonus : amount;
  const goal = record.goalAmount;
  
  if (goal === 0) {
    return "0x";
  }
  
  if (baseAmount > 0 && goal > 0) {
    const multiplier = Math.round(goal / baseAmount);
    return `${multiplier}x`;
  }
  
  return "1x";
};
