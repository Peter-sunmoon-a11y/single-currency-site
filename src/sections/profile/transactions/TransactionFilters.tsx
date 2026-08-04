import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";

// ─── StatusFilter ─────────────────────────────────────────────────────────────

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const { t } = useTranslation();

  const options = [
    { id: "All",        value: "All",        label: t("transaction:transactionStatus.allStatus") },
    { id: "Processing", value: "Processing", label: t("transaction:transactionStatus.pending") },
    { id: "Success",    value: "Success",    label: t("transaction:transactionStatus.completed") },
    { id: "Failed",     value: "Failed",     label: t("transaction:transactionStatus.failed") },
  ];

  return (
    <FormBox label={t("transaction:filters.status", "Status")}>
      <SelectDropdown
        options={options}
        value={value}
        onChange={(v) => onChange(v as string)}
        title={t("transaction:filters.status", "Status")}
      />
    </FormBox>
  );
}

// ─── AssetFilter ──────────────────────────────────────────────────────────────

interface AssetFilterProps {
  value: string;
  userBalance: any[];
  onChange: (value: string) => void;
}

export function AssetFilter({ value, userBalance, onChange }: AssetFilterProps) {
  const { t } = useTranslation();

  const options = useMemo(() => [
    { id: "all", value: "all", label: t("transaction:filters.allAssets") },
    ...(userBalance?.map((item: any) => ({
      id: item.currency,
      value: item.currency,
      label: (
        <span className="flex items-center gap-2">
          <CurrencyIcon currency={item.currency} className="w-6 h-6 shrink-0" />
          {item.currency}
        </span>
      ),
    })) || []),
  ], [userBalance, t]);

  return (
    <FormBox label={t("transaction:filters.asset", "Asset")}>
      <SelectDropdown
        options={options}
        value={value}
        onChange={(v) => onChange(v as string)}
        title={t("transaction:filters.asset", "Asset")}
      />
    </FormBox>
  );
}

// ─── PeriodFilter ─────────────────────────────────────────────────────────────

interface PeriodFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const { t } = useTranslation();

  const options = [
    { id: "1d",  value: "Past 24 Hours", label: t("transaction:filters.period1d", "1D") },
    { id: "7d",  value: "Past 7 Days",   label: t("transaction:filters.period7d", "7D") },
    { id: "30d", value: "Past 30 Days",  label: t("transaction:filters.period30d", "30D") },
  ];

  return (
    <FormBox label={t("transaction:filters.period", "Period")}>
      <SelectDropdown
        options={options}
        value={value}
        onChange={(v) => onChange(v as string)}
        title={t("transaction:filters.period", "Period")}
      />
    </FormBox>
  );
}