import { useBoundStore } from "@/store";
import { useDisplayCurrency, useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useUserBalance } from "@/hooks/api/useAuth";
import { useSupportedSettlementCurrencies } from "@/hooks/api/usePublic";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon.tsx";

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencySelect: (currency: string) => void;
  trigger?: React.ReactNode;
  showBalance?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = (
  {
    selectedCurrency,
    showBalance = true
  }) => {
  const user = useBoundStore((state) => state.user);
  const { selectedCurrency: displayCurrency, groupedCurrencies } = useDisplayCurrency();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const openModal = useBoundStore((state) => state.openModal);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Currency hooks
  const { formatWithoutConversion, formatWithConversion, isLoading: isCurrencyLoading } = useDisplayCurrencyFormatter();
  const { data: currenciesData } = useSupportedSettlementCurrencies();
  const currencies = currenciesData?.data || [];
  const { data: userBalanceData = [] } = useUserBalance();
  const userBalances = userBalanceData || [];

  // Get current display currency info
  const currentDisplayCurrency = user?.currency_fiat || displayCurrency;
  const fiatCurrencies = groupedCurrencies?.fiat || [];
  const currentDisplayCurrencyData = fiatCurrencies.find((c: any) => c.currency === currentDisplayCurrency);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);


  const handleCurrencySwitchClick = () => {
    openModal("OPEN_CURRENCY_SELECTOR_MODAL", {});
  };

  // Get user balance by currency
  const getUserBalanceByCurrency = useMemo(() => {
    return (currency: string): number => {
      const balance = userBalances.find((b: any) => b.currency === currency);
      return balance ? parseFloat(balance.balance) : 0;
    };
  }, [userBalances]);

  const settlementCurrencyDisplayDecimalByCode = useMemo(() => {
    const map = new Map<string, number>();
    currencies.forEach((c: any) => {
      if (typeof c?.currency === "string" && typeof c?.display_decimal === "number") {
        map.set(c.currency, c.display_decimal);
      }
    });
    return map;
  }, [currencies]);

  const getBalanceDisplay = (amount: number, currency: string) => {
    if (isCurrencyLoading) return "0.00";

    if (currency !== currentDisplayCurrency) {
      return formatWithConversion(amount, currency, {
        showSymbol: displayCurrency !== currency,
        showCode: false,
        compact: true,
        minimizeDecimals: true,
        displayDecimal: currentDisplayCurrencyData?.display_decimal
      }).formatted;
    }

    return formatWithoutConversion(amount, currency, {
      showSymbol: displayCurrency !== currency,
      showCode: false,
      compact: true,
      minimizeDecimals: true,
      displayDecimal: settlementCurrencyDisplayDecimalByCode.get(currency)
    }).formatted;
  };

  // Get current selected currency balance
  const currentBalance = getUserBalanceByCurrency(selectedCurrency);

  // Default trigger button
  const defaultTrigger = (
    <button
      className={`gap-1 flex items-center w-full`}
      onClick={handleCurrencySwitchClick}
    >
      <>
        <InnerGuideDeposits
          amount={getBalanceDisplay(currentBalance, selectedCurrency)}
          currency={selectedCurrency}
          showBalance={showBalance}
        />

        <ChevronDown
          strokeWidth={3}
          className={`text-base-content mr-1 w-3 h-3 transition-transform flex-shrink-0`}
        />
      </>
    </button>
  );


  return (
    <div className="relative z-[1002] w-full" ref={dropdownRef}>
      {defaultTrigger}
    </div>
  );
};

const InnerGuideDeposits = ({ amount, currency, showBalance }: {
  amount: string,
  currency: string,
  showBalance: boolean
}) => {
  return <div
    className="flex items-center gap-1 text-base font-bold text-base-content flex-1 text-center">
    <CurrencyIcon currency={CURRENCY_ALIAS_CONFIG?.[currency] ? CURRENCY_ALIAS_CONFIG?.[currency] : currency}
                  className="w-6 h-6 shrink-0" />
    <span className={"flex w-0 flex-auto items-center truncate"}>
      {showBalance ? amount : currency}
    </span>
  </div>;
};

// TODO: 匹配特殊币种命名的集合,手动维护即可
const CURRENCY_ALIAS_CONFIG: Record<string, string> = {
  "TON": "GRAM"
};
