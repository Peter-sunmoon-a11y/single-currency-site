import dayjs from "dayjs";
import type { TFunction } from "@/lib/i18n/i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import type { Transaction, TransactionType } from "./types";
import { getTransactionStatus } from "@/sections/profile/transactions/helper.ts";

export type TransactionDetailViewModel = {
  amountLabel: string;
  currency: string;
  infoRows: Array<{ label: string; value: string }>;
  timeline: Array<{ label: string; description?: string; completed: boolean }>;
  orderId?: string;
  transactionId?: string | null;
  showTransactionHash?: boolean;
};

const DATE_FORMAT = "DD/MM/YYYY HH:mm:ss";

export const useTransactionDetailMapper = () => {
  const { formatWithoutConversion } = useDisplayCurrencyFormatter();

  return ({
            transaction,
            transactionType,
            t
          }: {
    transaction: Transaction;
    transactionType: TransactionType;
    t: TFunction;
  }): TransactionDetailViewModel => {
    const currency = resolveCurrency(transaction, transactionType);
    const amountValue = resolveAmount(transaction, transactionType);
    const formattedAmount = formatWithoutConversion(amountValue, currency, {
      showSymbol: false,
      showCode: true,
      minimizeDecimals: true
    }).formatted;

    const amountLabel = decorateAmountLabel(formattedAmount, amountValue, transactionType);
    const infoRows = buildInfoRows(transaction, transactionType, t);
    const timeline = buildTimeline(transaction, transactionType, t);
    return {
      amountLabel,
      currency,
      infoRows,
      timeline,
      orderId: resolveOrderId(transaction),
      transactionId: resolveTransactionId(transaction),
      showTransactionHash: transactionType !== "Swap"
    };
  };
};

const resolveAmount = (transaction: Transaction, transactionType: TransactionType): number => {
  if (transactionType === "Swap") {
    const toAmount = Number(transaction.to_amount_received ?? transaction.toAmount ?? transaction.amount);
    if (!Number.isNaN(toAmount)) return toAmount;
  }

  if (transactionType === "Bonus") {
    transaction.amount = transaction.bonus;
  }

  const candidates = [
    transaction.amount,
    transaction.amount_real,
    transaction.amountReal,
    transaction.reward,
    transaction.to_amount,
    transaction.toAmount,
    transaction.bonus
  ];

  for (const candidate of candidates) {
    const value = Number(candidate);
    if (!Number.isNaN(value)) return value;
  }

  return 0;
};

const resolveCurrency = (transaction: Transaction, transactionType: TransactionType): string => {
  if (transactionType === "Swap") {
    const toCurrency = transaction.to_currency ?? transaction.toCurrency;
    if (typeof toCurrency === "string" && toCurrency.length > 0) return toCurrency;
  }

  const candidates = [
    transaction.currency,
    transaction.reward_currency,
    transaction.rewardCurrency,
    transaction.currency_code,
    transaction.currencyCode,
    transaction.to_currency,
    transaction.from_currency,
    transaction.toCurrency,
    transaction.fromCurrency
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return "USD";
};

const decorateAmountLabel = (formatted: string, amount: number, transactionType: TransactionType) => {
  const shouldPrefixPlus = amount > 0 && ["Deposit", "Bonus", "Referral", "Commission"].includes(transactionType);
  if (shouldPrefixPlus && !formatted.startsWith("+")) {
    return `+${formatted}`;
  }
  return formatted;
};

const resolveOrderId = (transaction: Transaction): string | undefined => {
  const candidates = [transaction.number, transaction.order_id, transaction.orderId, transaction.id];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (typeof candidate === "number" && Number.isFinite(candidate)) return String(candidate);
  }
  return undefined;
};

const resolveTransactionId = (transaction: Transaction): string | null | undefined => {
  const candidates = [transaction.txid, transaction.transaction_id, transaction.transactionId, transaction.hash];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (typeof candidate === "number" && Number.isFinite(candidate)) return String(candidate);
  }
  return undefined;
};

const buildInfoRows = (
  transaction: Transaction,
  transactionType: TransactionType,
  t: TFunction
) => {
  const rows: Array<{ label: string; value: string }> = [];

  rows.push({
    label: t("transaction:tableHeaders.status"),
    value: t(getTransactionStatus(transactionType, transactionType === "Commission" ? 1 : transaction.status).trans)
  });

  const typeLabel = getTypeLabel(transactionType, transaction, t);
  rows.push({ label: t("transaction:filters.type"), value: typeLabel });

  // Special handling for Swap type
  if (transactionType === "Swap") {
    const fromAmount = Number(transaction.from_amount ?? transaction.fromAmount ?? 0);
    const fromCurrency = transaction.from_currency ?? transaction.fromCurrency ?? "";

    if (fromAmount && fromCurrency) {
      rows.push({
        label: t("transaction:common.swapFrom", "Swap From"),
        value: `${fromAmount} ${fromCurrency}`,
      });
    }

    const toAmount = Number(transaction.to_amount_received ?? transaction.toAmountReceived ?? 0);
    const toCurrency = transaction.to_currency ?? transaction.toCurrency ?? "";

    if (fromAmount && toAmount && fromCurrency && toCurrency) {
      rows.push({
        label: t("finance:rate", "Rate"),
        value: `${fromAmount} ${fromCurrency} = ${toAmount} ${toCurrency}`,
      });
    }
  } else {
    const method = getMethodValue(transaction);
    if (method) {
      rows.push({
        label: t("transaction:details.paymentMethod", "Payment Method"),
        value: t(`transaction:transactionTypes.${method}`, method)
      });
    }
  }

  const createdAt = formatTimestamp(transaction.created_at ?? transaction.createdAt, DATE_FORMAT);
  if (createdAt) {
    rows.push({ label: t("transaction:common.createdOn", "Created On"), value: createdAt });
  }

  return rows;
};

const buildTimeline = (transaction: Transaction, transactionType: TransactionType, t: TFunction) => {
  const steps: Array<{ label: string; description?: string; completed: boolean }> = [];
  const createdAt = formatTimestamp(transaction.created_at ?? transaction.createdAt, DATE_FORMAT);
  const updatedAt = formatTimestamp(transaction.updated_at ?? transaction.updatedAt, DATE_FORMAT);
  const status = normalizeStatus(transaction.status);

  // Swap transactions don't need a timeline
  if (transactionType === "Swap") {
    return steps;
  }

  if (transactionType === "Deposit") {
    steps.push({
      label: t("transaction:details.depositOrderCreated"),
      description: createdAt ? `${t("transaction:details.createdAt")}: ${createdAt}` : undefined,
      completed: true
    });
    steps.push({
      label: t("transaction:details.gatewayConfirmation"),
      description: buildStatusDescription(status, updatedAt, t),
      completed: status === "SUCCESS"
    });
    steps.push({
      label: t("transaction:details.transactionCompleted"),
      description: status === "EXPIRED" ? t("transaction:details.expired") : undefined,
      completed: status === "SUCCESS"
    });
    return steps;
  }

  if (transactionType === "Withdraw") {
    const withdrawType = String(transaction.withdraw_type ?? transaction.network ?? "").toLowerCase();
    const isFiat = withdrawType === "fiat" || withdrawType.includes("fiat");

    steps.push({
      label: t("transaction:details.withdrawOrderCreated"),
      description: createdAt ? `${t("transaction:details.createdAt")}: ${createdAt}` : undefined,
      completed: true
    });
    steps.push({
      label: isFiat
        ? t("transaction:details.withdrawProcessing")
        : t("transaction:details.blockchainProcessing"),
      description: buildWithdrawStatusDescription(status, updatedAt, isFiat, t),
      completed: status === "SUCCESS"
    });
    steps.push({
      label: t("transaction:details.transactionCompleted"),
      description: status === "FAILED"
        ? (isFiat ? t("transaction:details.withdrawOrderFailed") : t("transaction:details.blockchainFailed"))
        : undefined,
      completed: status === "SUCCESS"
    });
    return steps;
  }

  steps.push({
    label: t("transaction:details.transactionCompleted"),
    description: status === "SUCCESS" ? (updatedAt ?? undefined) : t("transaction:details.waiting"),
    completed: status === "SUCCESS"
  });
  return steps;
};

const getMethodValue = (transaction: Transaction) => {
  const candidates = [
    transaction.payment_method,
    transaction.method,
    transaction.network,
    transaction.deposit_type,
    transaction.withdraw_type
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) return candidate;
  }
  return undefined;
};

const buildStatusDescription = (status: string | undefined, updatedAt: string | null, t: TFunction) => {
  if (status === "SUCCESS") {
    return updatedAt ? `${t("transaction:details.lastUpdate")}: ${updatedAt}` : undefined;
  }
  if (status === "PROCESSING") {
    return t("transaction:details.waiting");
  }
  if (status === "FAILED") {
    return t("transaction:details.depositOrderFailed");
  }
  if (status === "EXPIRED" || status === "CANCELLED") {
    return t("transaction:details.expired");
  }
  return undefined;
};

const buildWithdrawStatusDescription = (status: string | undefined, updatedAt: string | null, isFiat: boolean, t: TFunction) => {
  if (status === "SUCCESS") {
    return updatedAt ? `${t("transaction:details.lastUpdate")}: ${updatedAt}` : undefined;
  }
  if (status === "PROCESSING") {
    const updateInfo = updatedAt ? ` ${t("transaction:details.createdAt")} ${updatedAt}` : "";
    return `${t("transaction:details.withdrawProcessing")}${updateInfo}`;
  }
  if (status === "FAILED") {
    return isFiat ? t("transaction:details.withdrawOrderFailed") : t("transaction:details.blockchainFailed");
  }
  if (status === "EXPIRED" || status === "CANCELLED") {
    return t("transaction:details.expired");
  }
  return undefined;
};

const getTypeLabel = (transactionType: TransactionType, transaction: Transaction, t: TFunction) => {
  if (transactionType === "Deposit") {
    const type = String(transaction.deposit_type ?? transaction.network ?? "").toLowerCase();
    return type === "fiat"
      ? t("transaction:transactionTypes.fiatDeposit")
      : t("transaction:transactionTypes.cryptoDeposit");
  }
  if (transactionType === "Withdraw") {
    const type = String(transaction.withdraw_type ?? transaction.network ?? "").toLowerCase();
    return type === "fiat"
      ? t("transaction:transactionTypes.fiatWithdraw")
      : t("transaction:transactionTypes.cryptoWithdraw");
  }
  return t(`transaction:transactionTypes.${transactionType.toLowerCase()}`, transactionType);
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

const normalizeStatus = (rawStatus: unknown): "SUCCESS" | "PROCESSING" | "FAILED" | "EXPIRED" | "CANCELLED" | "UNKNOWN" => {
  const statusNumber = typeof rawStatus === "number"
    ? rawStatus
    : typeof rawStatus === "string" && rawStatus
      ? Number(rawStatus)
      : null;

  if (statusNumber !== null && !Number.isNaN(statusNumber)) {
    switch (statusNumber) {
      case 0:
      case 3:
      case 5:
      case 6:
        return "PROCESSING";
      case 1:
        return "SUCCESS";
      case 2:
      case 7:
      case 8:
        return "FAILED";
      case 4:
        return "CANCELLED";
    }
  }

  if (typeof rawStatus === "string") {
    const normalized = rawStatus.toUpperCase();
    if (["SUCCESS", "COMPLETED"].includes(normalized)) return "SUCCESS";
    if (["PROCESSING", "PENDING"].includes(normalized)) return "PROCESSING";
    if (["FAILED", "FAIL"].includes(normalized)) return "FAILED";
    if (["EXPIRED"].includes(normalized)) return "EXPIRED";
    if (["CANCELLED", "CANCELED"].includes(normalized)) return "CANCELLED";
  }

  return "UNKNOWN";
};

export const getStatusLabel = (status: unknown, t: TFunction) => {
  switch (normalizeStatus(status)) {
    case "SUCCESS":
      return t("transaction:transactionStatus.success");
    case "PROCESSING":
      return t("transaction:transactionStatus.processing");
    case "FAILED":
      return t("transaction:transactionStatus.failed");
    case "EXPIRED":
      return t("transaction:transactionStatus.expired");
    case "CANCELLED":
      return t("transaction:transactionStatus.cancelled");
    default:
      return t("transaction:transactionStatus.unknown");
  }
};
