import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { cn } from "@/utils/cn";
import dayjs from "dayjs";
import { useTranslation } from "@/lib/i18n/react-i18next";
import type { Transaction } from "./types";
import { getTransactionStatus } from "@/sections/profile/transactions/helper.ts";
import { isArray } from "es-toolkit/compat";
import { TFunction } from "@/lib/i18n/i18next";

// ─── Shared Helpers ────────────────────────────────────────────────────────────

const getDisplayTimestamp = (item: Transaction) => {
  const _item = isArray(item) ? item?.[0] : item;
  const candidate =
    typeof _item?.created_at === "number" ? _item.created_at
    : typeof _item?.updated_at === "number" ? _item.updated_at
    : typeof _item?.date === "string" ? dayjs(_item.date).unix()
    : undefined;
  return typeof candidate === "number" ? dayjs.unix(candidate).format("DD MMM [']YY · HH:mm") : "";
};

type Fmt = ReturnType<typeof useDisplayCurrencyFormatter>["formatWithoutConversion"];

const _swapAmount = (item: Transaction, fmt: Fmt, t: (key: string) => string) => {
  const fromAmt = Number(item.from_amount ?? item.fromAmount ?? 0);
  const toAmt   = Number(item.to_amount_received ?? item.toAmountReceived ?? 0);
  const fromCur = String(item.from_currency ?? item.fromCurrency ?? "USD");
  const toCur   = String(item.to_currency ?? item.toCurrency ?? "USD");
  const from    = fmt(fromAmt, fromCur, { showSymbol: false, showCode: false, minimizeDecimals: true });
  const to      = fmt(toAmt,   toCur,   { showSymbol: false, showCode: false, minimizeDecimals: true });
  return (
    <div className="flex items-stretch gap-1 shrink-0">
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[12px] uppercase text-base-content/35 leading-none">{t("transaction:common.swapFrom")}</span>
        <span className="text-sm font-semibold tabular-nums text-error leading-none">-{from.formatted} {fromCur}</span>
      </div>
      <div className="w-px bg-base-content/20 self-stretch" />
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[12px] uppercase text-base-content/35 leading-none">{t("transaction:common.swapTo")}</span>
        <span className="text-sm font-semibold tabular-nums text-success leading-none">+{to.formatted} {toCur}</span>
      </div>
    </div>
  );
};

const _bonusStoreAmount = (item: Transaction, fmt: Fmt, t:TFunction) => {
  const [a, b]  = item as [Transaction, Transaction];
  const fromAmt = Number(a.amount ?? 0);
  const toAmt   = Number(b.amount ?? 0);
  const fromCur = String(a.currency ?? "USD");
  const toCur   = String(b.currency ?? "USD");
  const from    = fmt(fromAmt, fromCur, { showSymbol: false, showCode: true, minimizeDecimals: true });
  const to      = fmt(toAmt,   toCur,   { showSymbol: false, showCode: true, minimizeDecimals: true });
  return (
    <div className="flex items-stretch gap-1 shrink-0">
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[12px] uppercase text-base-content/35 leading-none">{t("transaction:common.swapFrom")}</span>
        <span className="text-sm font-semibold tabular-nums text-error leading-none">
          {fromAmt < 0 ? from.formatted : to.formatted}
        </span>
      </div>
      <div className="w-px bg-base-content/20 self-stretch" />
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[12px] uppercase text-base-content/35 leading-none">{t("transaction:common.swapTo")}</span>
        <span className="text-sm font-semibold tabular-nums text-success leading-none">
          +{toAmt > 0 ? to.formatted : from.formatted}
        </span>
      </div>
    </div>
  );
};

const _stdAmount = (amount: unknown, currency: string, fmt: Fmt) => {
  const converted = fmt(Number(amount ?? 0), currency, { showSymbol: false, showCode: true, minimizeDecimals: true });
  return (
    <div className="flex items-end gap-1 text-primary font-bold text-sm">
      <span>{converted.formatted}</span>
    </div>
  );
};

// ─── Internal Row ──────────────────────────────────────────────────────────────

function _Row({
  item,
  label,
  amountNode,
  statusType,
  onClick,
}: {
  item: Transaction;
  label: React.ReactNode;
  amountNode: React.ReactNode;
  statusType: string;
  onClick?: () => void;
}) {
  const { t } = useTranslation("bonusStore");
  const status = getTransactionStatus(statusType, item.status);
  return (
    <div className="rounded-lg p-2 flex flex-col gap-2 bg-base-300" onClick={onClick}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <span className="inline-flex items-center gap-1 text-base-content text-sm font-bold">{label}</span>
          <span className="text-xs text-base-content/50">
            {getDisplayTimestamp(item) || t("transaction:tableHeaders.timePlaceholder", "—")}
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn("inline-flex items-center text-xs italic leading-none py-1 px-1", status.cls)}>
            {t(status.trans, String(item.status))}
          </span>
          {amountNode}
        </div>
      </div>
    </div>
  );
}

// ─── List Props & Container ───────────────────────────────────────────────────

interface ListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  isFetching?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
}

function _ListContainer({ isLoading, isFetching, empty, children }: {
  isLoading?: boolean;
  isFetching?: boolean;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-lg bg-base-200 p-2 min-h-[125px]">
      <div className="space-y-1">{children}</div>
      {!isLoading && !isFetching && empty && <NothingFound />}
      {(isLoading || isFetching) && <DataLoading />}
    </div>
  );
}

// ─── DepositList ──────────────────────────────────────────────────────────────

export function DepositList({ transactions, isLoading, isFetching, onTransactionClick }: ListProps) {
  const { t } = useTranslation("bonusStore");
  const { formatWithoutConversion: fmt } = useDisplayCurrencyFormatter();
  return (
    <_ListContainer isLoading={isLoading} isFetching={isFetching} empty={!transactions?.length}>
      {(transactions ?? []).map((item, i) => {
        const type = (item.deposit_type ?? item.network)?.toString().toLowerCase();
        return (
          <_Row
            key={item.id ?? `deposit-${i}`}
            item={item}
            label={type === "fiat" ? t("transaction:transactionTypes.fiatDeposit") : t("transaction:transactionTypes.cryptoDeposit")}
            amountNode={_stdAmount(item.amount ?? item.amount_real ?? item.amountReal, String(item.currency ?? "USD"), fmt)}
            statusType="Deposit"
            onClick={() => onTransactionClick?.(item)}
          />
        );
      })}
    </_ListContainer>
  );
}

// ─── WithdrawList ─────────────────────────────────────────────────────────────

export function WithdrawList({ transactions, isLoading, isFetching, onTransactionClick }: ListProps) {
  const { t } = useTranslation("bonusStore");
  const { formatWithoutConversion: fmt } = useDisplayCurrencyFormatter();
  return (
    <_ListContainer isLoading={isLoading} isFetching={isFetching} empty={!transactions?.length}>
      {(transactions ?? []).map((item, i) => {
        const type = (item.withdraw_type ?? item.network)?.toString().toLowerCase();
        return (
          <_Row
            key={item.id ?? `withdraw-${i}`}
            item={item}
            label={type === "fiat" ? t("transaction:transactionTypes.fiatWithdraw") : t("transaction:transactionTypes.cryptoWithdraw")}
            amountNode={_stdAmount(item.amount ?? item.amount_real ?? item.amountReal, String(item.currency ?? "USD"), fmt)}
            statusType="Withdraw"
            onClick={() => onTransactionClick?.(item)}
          />
        );
      })}
    </_ListContainer>
  );
}

// ─── SwapList ─────────────────────────────────────────────────────────────────

export function SwapList({ transactions, isLoading, isFetching, onTransactionClick }: ListProps) {
  const { t } = useTranslation("bonusStore");
  const { formatWithoutConversion: fmt } = useDisplayCurrencyFormatter();
  return (
    <_ListContainer isLoading={isLoading} isFetching={isFetching} empty={!transactions?.length}>
      {(transactions ?? []).map((item, i) => (
        <_Row
          key={item.id ?? `swap-${i}`}
          item={item}
          label={t("finance:swap", "Swap")}
          amountNode={_swapAmount(item, fmt, t)}
          statusType="Swap"
          onClick={() => onTransactionClick?.(item)}
        />
      ))}
    </_ListContainer>
  );
}

// ─── BonusList ────────────────────────────────────────────────────────────────

export function BonusList({ transactions, isLoading, isFetching, onTransactionClick }: ListProps) {
  const { t } = useTranslation("bonusStore");
  const { formatWithoutConversion: fmt } = useDisplayCurrencyFormatter();
  return (
    <_ListContainer isLoading={isLoading} isFetching={isFetching} empty={!transactions?.length}>
      {(transactions ?? []).map((item, i) => {
        const noteKey = item?.note?.toLowerCase();
        const label = noteKey
          ? t(`bonus:item.${noteKey}`, t("bonus:item.bonus", "Bonus"))
          : t("bonus:item.bonus", "Bonus");
        return (
          <_Row
            key={item.id ?? `bonus-${i}`}
            item={item}
            label={label}
            amountNode={_stdAmount(item.bonus ?? item.amount ?? item.amount_real ?? item.amountReal, String(item.currency ?? "USD"), fmt)}
            statusType="Bonus"
            onClick={() => onTransactionClick?.(item)}
          />
        );
      })}
    </_ListContainer>
  );
}

// ─── BonusStoreList ───────────────────────────────────────────────────────────

export function BonusStoreList({ transactions, isLoading, isFetching }: ListProps) {
  const { t } = useTranslation("bonusStore");
  const { formatWithoutConversion: fmt } = useDisplayCurrencyFormatter();
  return (
    <_ListContainer isLoading={isLoading} isFetching={isFetching} empty={!transactions?.length}>
      {(transactions ?? []).map((item, i) => {
        const note  = (item as any)?.[0]?.note;
        const label = note?.endsWith("bonus_wallet_purchase") ? t("bonusStore:buyBonus") : t("bonus:claimed");
        return (
          <_Row
            key={(item as any)?.[0]?.id ?? `bonus-store-${i}`}
            item={item}
            label={label}
            amountNode={_bonusStoreAmount(item, fmt, t)}
            statusType="BonusStore"
          />
        );
      })}
    </_ListContainer>
  );
}

// ─── SportsBonusStoreList ─────────────────────────────────────────────────────

export function SportsBonusStoreList({ transactions, isLoading, isFetching }: ListProps) {
  const { t } = useTranslation("bonusStore");
  const { formatWithoutConversion: fmt } = useDisplayCurrencyFormatter();
  return (
    <_ListContainer isLoading={isLoading} isFetching={isFetching} empty={!transactions?.length}>
      {(transactions ?? []).map((item, i) => {
        const note  = (item as any)?.[0]?.note;
        const label = note?.endsWith("bonus_wallet_purchase") ? t("bonusStore:buyBonus") : t("bonus:claimed");
        return (
          <_Row
            key={(item as any)?.[0]?.id ?? `sports-bonus-store-${i}`}
            item={item}
            label={label}
            amountNode={_bonusStoreAmount(item, fmt, t)}
            statusType="SportsBonusStore"
          />
        );
      })}
    </_ListContainer>
  );
}

// ─── ReferralList ─────────────────────────────────────────────────────────────

export function ReferralList({ transactions, isLoading, isFetching, onTransactionClick }: ListProps) {
  const { t } = useTranslation("bonusStore");
  const { formatWithoutConversion: fmt } = useDisplayCurrencyFormatter();
  return (
    <_ListContainer isLoading={isLoading} isFetching={isFetching} empty={!transactions?.length}>
      {(transactions ?? []).map((item, i) => {
        const currency = String(item.currency ?? item.reward_currency ?? item.rewardCurrency ?? "USD");
        return (
          <_Row
            key={item.id ?? `referral-${i}`}
            item={item}
            label={t("transaction:transactionTypes.referral")}
            amountNode={_stdAmount(item.reward ?? item.amount ?? item.amount_real ?? item.amountReal, currency, fmt)}
            statusType="Referral"
            onClick={() => onTransactionClick?.(item)}
          />
        );
      })}
    </_ListContainer>
  );
}

// ─── CommissionList ───────────────────────────────────────────────────────────

export function CommissionList({ transactions, isLoading, isFetching, onTransactionClick }: ListProps) {
  const { t } = useTranslation("bonusStore");
  const { formatWithoutConversion: fmt } = useDisplayCurrencyFormatter();
  return (
    <_ListContainer isLoading={isLoading} isFetching={isFetching} empty={!transactions?.length}>
      {(transactions ?? []).map((item, i) => {
        const currency = String(item.currency ?? "USD");
        return (
          <_Row
            key={item.id ?? `commission-${i}`}
            item={item}
            label={t("transaction:transactionTypes.commission")}
            amountNode={_stdAmount(item.commission_amount ?? item.reward ?? item.amount ?? item.amount_real ?? item.amountReal, currency, fmt)}
            statusType="Commission"
            onClick={() => onTransactionClick?.(item)}
          />
        );
      })}
    </_ListContainer>
  );
}
