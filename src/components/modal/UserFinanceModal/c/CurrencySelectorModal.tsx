import { IconSwap } from "@/app/[locale]/finance/icons";
import { Modal } from "@/components/ui/Modal";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { useDisplayCurrency, useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useSettlementCurrency, useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { useUserBalance } from "@/hooks/api/useAuth";
import { useSupportedSettlementCurrencies } from "@/hooks/api/usePublic";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { BonusWallet } from "@/sections/dollars/bonus-wallet.tsx";
import { useBoundStore } from "@/store";
import { emitter } from "@/store/emitter.ts";
import { userScopedKey } from "@/utils/storageKeys.ts";
import { CircleDollarSign, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useAppNavigate } from "@/hooks/useAppNavigate";

const PlatformBadge = () => {
  return <CircleDollarSign size={18} className={"text-primary"} />;
};

const RewardsCurrencyActions = ({
                                  onInfo,
                                  onSwap
                                }: {
  currency: string;
  onInfo: (e: React.MouseEvent) => void;
  onSwap: (e: React.MouseEvent) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        className="btn btn-primary btn-soft btn-square btn-sm"
        onClick={(e) => {
          e.stopPropagation();
          onInfo(e);
        }}
      >
        <span className="text-lg">?</span>
      </button>
      <button
        className="btn btn-primary btn-soft btn-square btn-sm"
        onClick={(e) => {
          e.stopPropagation();
          onSwap(e);
        }}
      >
        <IconSwap />
      </button>
    </div>
  );
};

const CurrencySelectorModal = ({ data, open, onClose }: {
  data: Record<string, any>;
  open: boolean;
  onClose: () => void
}) => {
  console.info(data);
  const navigate = useAppNavigate();

  const { t } = useTranslation();
  const user = useBoundStore((state) => state.user);
  const closeModal = useBoundStore((state) => state.closeModal);

  const [searchText, setSearchText] = useState("");
  const deferredSearch = useDeferredValue(searchText);
  const [pendingSelectedCurrency, setPendingSelectedCurrency] = useState<string | null>(null);

  const [hideZeroBalances, setHideZeroBalances] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem(userScopedKey.hideZeroBalances(user?.id!));
    return saved ? JSON.parse(saved) : false;
  });

  const { selectedCurrency: settlementCurrency } = useSettlementCurrency();
  const { updateSettlementCurrency } = useUpdateSettlementCurrency();
  const { selectedCurrency: displayCurrency } = useDisplayCurrency();
  const { formatWithoutConversion, formatWithConversion, isLoading: isCurrencyLoading } = useDisplayCurrencyFormatter();
  const { data: currenciesData, isLoading } = useSupportedSettlementCurrencies();
  const currencies = currenciesData?.data || [];
  const { data: userBalanceData = [] } = useUserBalance();

  const currentDisplayCurrency = user?.currency_fiat || displayCurrency;

  const settlementCurrencyDisplayDecimalByCode = useMemo(() => {
    const map = new Map<string, number>();
    currencies.forEach((c: any) => {
      if (typeof c?.currency === "string" && typeof c?.display_decimal === "number") {
        map.set(c.currency, c.display_decimal);
      }
    });
    return map;
  }, [currencies]);

  const getUserBalanceByCurrency = useMemo(
    () =>
      (currency: string): number => {
        const balance = (userBalanceData as any[]).find((b: any) => b.currency === currency);
        return balance ? parseFloat(balance.balance) : 0;
      },
    [userBalanceData]
  );

  const groupedAndFilteredCurrencies = useMemo(() => {
    const enrich = (c: any) => {
      const balance = getUserBalanceByCurrency(c.currency);
      const displayDecimal = settlementCurrencyDisplayDecimalByCode.get(c.currency);
      const converted = formatWithConversion(balance, c.currency, { showCode: false });
      return {
        ...c,
        _balance: balance,
        _displayValue: converted.value,
        _formattedBalance: isCurrencyLoading
          ? "..."
          : formatWithoutConversion(balance, c.currency, {
            showSymbol: false,
            showCode: false,
            compact: false,
            minimizeDecimals: true,
            displayDecimal
          }).formatted,
        _displayAmount: isCurrencyLoading ? "..." : c.currency === currentDisplayCurrency ? null : converted.formatted
      };
    };

    const filtered = currencies
      .filter((c: any) => {
        if (c.currency_type === "BONUS") return true;
        return !hideZeroBalances || getUserBalanceByCurrency(c.currency) > 0;
      })
      .map(enrich);

    const sortByDisplayValue = (a: any, b: any) => b._displayValue - a._displayValue;

    return {
      FIAT: filtered.filter((c: any) => c.currency_type === "FIAT").sort(sortByDisplayValue),
      CRYPTO: [
        ...filtered.filter((c: any) => c.currency_type === "REWARDS"),
        ...filtered.filter((c: any) => c.currency_type === "CRYPTO").sort(sortByDisplayValue)
      ],
      BONUS: [
        ...filtered.filter((c: any) => c.currency_type === "BONUS").sort(sortByDisplayValue)
      ]
    };
  }, [
    currencies,
    hideZeroBalances,
    getUserBalanceByCurrency,
    formatWithConversion,
    formatWithoutConversion,
    settlementCurrencyDisplayDecimalByCode,
    isCurrencyLoading,
    currentDisplayCurrency
  ]);

  const searchedCurrencies = useMemo(() => {
    if (!deferredSearch) return groupedAndFilteredCurrencies;
    const q = deferredSearch.toLowerCase();
    const match = (c: any) => c.currency?.toLowerCase().includes(q);
    return {
      FIAT: groupedAndFilteredCurrencies.FIAT.filter(match),
      CRYPTO: groupedAndFilteredCurrencies.CRYPTO.filter(match),
      BONUS: groupedAndFilteredCurrencies.BONUS.filter(match)
    };
  }, [groupedAndFilteredCurrencies, deferredSearch]);

  const totalFilteredCount = searchedCurrencies.FIAT.length + searchedCurrencies.CRYPTO.length;

  useEffect(() => {
    if (!open) {
      setPendingSelectedCurrency(null);
    }
  }, [open]);

  const handleSelect = (currency: string) => {
    setPendingSelectedCurrency(currency);
    void updateSettlementCurrency(currency);
    setTimeout(onClose, 220);
  };

  const renderCurrencyGroup = (currencies: any[]) => {
    if (currencies.length === 0) return null;
    return currencies.map((currency: any) => {
      const isRewards = currency.currency_type === "REWARDS";
      const isSelected = (pendingSelectedCurrency ?? settlementCurrency) === currency.currency;
      if (currency.currency_type === "BONUS") {
        return <BonusWallet key={currency.currency} currency={currency} selected={settlementCurrency}
                            onSelect={handleSelect} />;
      }
      return (
        <div
          key={currency.currency}
          className={`flex items-center justify-between w-full pl-1 pr-2 py-1 rounded-md transition-all border-l-2 border-transparent ${
            isRewards
              ? "cursor-not-allowed"
              : isSelected
                ? "cursor-pointer text-primary bg-gradient-to-r from-primary/25 to-primary/8 !border-primary"
                : "cursor-pointer hover:bg-primary/5"
          }`}
          onClick={() => !isRewards && handleSelect(currency.currency)}
        >
          <div className="flex justify-between w-full">
            <div className="flex items-center gap-2">
              <img loading="lazy" src={`/images/currency/${currency?.display_name?.toLowerCase()}.png`}
                   className="w-8 h-8 rounded-full" />
              <div className="flex flex-col">
                <b className="font-bold text-base flex items-center gap-1.5">
                  {currency.display_name} {isRewards && <PlatformBadge />}
                </b>
                <p className="text-sm text-base-content/60 font-bold">{currency._formattedBalance}</p>
              </div>
              {isRewards && (
                <RewardsCurrencyActions
                  currency={currency.currency}
                  onSwap={() => {
                    closeModal("OPEN_CURRENCY_SELECTOR_MODAL");
                    void navigate({ to: "/finance/swap" });
                    emitter.emit("SWAP", currency.currency);
                  }}
                  onInfo={() => {
                    onClose();
                    void navigate({ to: "/token" });
                  }}
                />
              )}
            </div>
            <span className="text-base text-base-content font-bold">{currency._displayAmount}</span>
          </div>
        </div>
      );
    });
  };

  const { data: balances = [] } = useUserBalance();

  const is_all_zero = useMemo(() => {
    if (balances.length === 0) return true;
    return balances.every((b: { balance: string }) => Number(b.balance) === 0);
  }, [balances]);

  return (
    <Modal isOpen={open} onClose={onClose} title={t("common:common.selectCurrency")} position={"modal-middle"}>
      <div className="sticky top-0 z-10 bg-base-100">
        <label
          className="input flex w-full overflow-hidden rounded-field border-0 bg-base-200 font-bold !outline-0"
        >
          <Search className="h-4 w-4 text-base-content/50" />
          <input
            type="text"
            value={searchText}
            placeholder={t("common:common.searchPlaceholder")}
            className="bg-transparent"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </label>
      </div>

      {isLoading || isCurrencyLoading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : totalFilteredCount === 0 ? (
        <NothingFound className={"min-h-20 static"} />
      ) : (
        <div className={"flex flex-col bg-base-100"}>
          {searchedCurrencies.BONUS?.length > 0 && <div>
            <div className="z-1 py-2 text-xs text-base-content/50 sticky top-10 bg-base-100 italic">{t('common.bonus')}</div>
            {renderCurrencyGroup(searchedCurrencies.BONUS)}
          </div>}
          {searchedCurrencies.FIAT?.length > 0 && <div>
            <div className="z-1 py-2 text-xs text-base-content/50 sticky top-10 bg-base-100 italic">{t('finance.fiat')}</div>
            {renderCurrencyGroup(searchedCurrencies.FIAT)}
          </div>}
          {searchedCurrencies.CRYPTO?.length > 0 && <div>
            <div className="z-1 py-2 text-xs text-base-content/50 sticky top-10 bg-base-100 italic">{t('finance.crypto')}</div>
            {renderCurrencyGroup(searchedCurrencies.CRYPTO)}
          </div>}
        </div>
      )}

      <div className={"sticky bottom-0 bg-base-200 p-2 flex flex-col gap-2 z-2 rounded-lg"}>
        {!is_all_zero && (
          <div className={"flex items-center justify-between"}>
            <span className="text-sm text-base-content/60">{t("finance:hideZeroBalances")}</span>
            <input
              type="checkbox"
              className="toggle toggle-xs toggle-primary"
              checked={hideZeroBalances}
              onChange={(e) => {
                setHideZeroBalances(e.target.checked);
                localStorage.setItem(userScopedKey.hideZeroBalances(user?.id!), JSON.stringify(e.target.checked));
              }}
            />
          </div>
        )}
        <button
          className={"btn btn-primary btn-soft w-full"}
          onClick={() => {
            onClose();
            void navigate({ to: "/finance/deposit" });
          }}
        >
          {t("common.deposit")}
        </button>
      </div>
    </Modal>
  );
};

export default CurrencySelectorModal;
