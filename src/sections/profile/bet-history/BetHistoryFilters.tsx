import { SelectDropdown, type SelectOption } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import type { BetHistoryFilterGroup, BetHistoryFilterOption } from "@/types/bet-history";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import type { BetHistoryFiltersState } from "./types";

interface BetHistoryFiltersProps {
  filters: BetHistoryFiltersState;
  onChange: (next: BetHistoryFiltersState) => void;
  filterGroup?: BetHistoryFilterGroup;
  excluded_assets?: Set<string>;
  availableAssets?: string[];
  isDisabled?: boolean;
  showGameFilter?: boolean;
}

const PERIOD_OPTIONS: Array<{
  id: string;
  value: BetHistoryFiltersState["period"];
  labelKey: string;
  fallback: string
}> = [
  { id: "1d", value: "Past 24 Hours", labelKey: "transaction:filters.period1d", fallback: "1D" },
  { id: "7d", value: "Past 7 Days", labelKey: "transaction:filters.period7d", fallback: "7D" },
  { id: "30d", value: "Past 30 Days", labelKey: "transaction:filters.period30d", fallback: "30D" }
];

const normalizeGameOptions = (options?: BetHistoryFilterOption[]): SelectOption[] => {
  if (!options?.length) return [];
  return options.map((option) => ({
    id: String(option.value),
    value: option.value,
    label: option.label
  }));
};

export function BetHistoryFilters({
                                    filters,
                                    onChange,
                                    filterGroup,
                                    showGameFilter,
                                    availableAssets,
                                    excluded_assets = new Set(),
                                    isDisabled
                                  }: BetHistoryFiltersProps) {
  const { t } = useTranslation();

  const gameOptions = useMemo<SelectOption[]>(() => {
    const normalized = normalizeGameOptions(filterGroup?.games);
    const baseOptions: SelectOption[] = [
      { id: "all", value: "all", label: t("transaction:filters.all", "All") },
      { id: "slots", value: "slots", label: t("transaction:gameTypes.slots") },
      { id: "live-casino", value: "live-casino", label: t("transaction:gameTypes.liveCasino") },
      { id: "fishing", value: "fishing", label: t("transaction:gameTypes.fishing") },
      { id: "fast", value: "fast", label: t("transaction:gameTypes.fast") },
      { id: "lottery", value: "lottery", label: t("explore.lottery") }
    ];
    normalized.forEach((option) => {
      if (!baseOptions.some((o) => o.value === option.value)) baseOptions.push(option);
    });
    return baseOptions;
  }, [filterGroup?.games, t]);

  const assetOptions = useMemo<SelectOption[]>(() => {
    const assets = (availableAssets ?? []).filter((c) => !excluded_assets.has(c));
    return [
      {
        id: "all",
        value: "all",
        label: `${t("transaction:filters.all", "All")} ${t("transaction:filters.asset", "Asset")}`
      },
      ...assets.map((currency) => ({
        id: currency,
        value: currency,
        label: (
          <span className="flex items-center gap-2">
            <CurrencyIcon currency={currency} className="w-6 h-6 shrink-0" />
            {currency}
          </span>
        )
      }))
    ];
  }, [availableAssets, filterGroup?.assets, t]);

  return (
    <div className="grid grid-cols-2 gap-1">
      {showGameFilter && <FormBox label={t("transaction:filters.game", "Games")}>
        <SelectDropdown
          options={gameOptions}
          value={filters.game}
          onChange={(value) => onChange({ ...filters, game: String(value) })}
          disabled={isDisabled}
          title={t("transaction:filters.game", "Games")}
        />
      </FormBox>}

      <FormBox label={t("transaction:filters.asset", "Asset")}>
        <SelectDropdown
          options={assetOptions}
          value={filters.asset}
          onChange={(value) => onChange({ ...filters, asset: String(value) })}
          disabled={isDisabled}
          title={t("transaction:filters.asset", "Asset")}
        />
      </FormBox>

      <FormBox label={t("transaction:filters.period", "Period")}>
        <SelectDropdown
          options={PERIOD_OPTIONS.map((o) => ({ id: o.id, value: o.value, label: t(o.labelKey, o.fallback) }))}
          value={filters.period}
          onChange={(value) => onChange({ ...filters, period: value as BetHistoryFiltersState["period"] })}
          disabled={isDisabled}
          title={t("transaction:filters.period", "Period")}
        />
      </FormBox>
    </div>
  );
}
