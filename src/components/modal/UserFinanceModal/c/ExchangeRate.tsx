import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { EqualApproximately } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Alert } from "@/components/icons/Alert.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

const ExchangeRate = () => {
  const { t } = useTranslation();

  const user = useBoundStore((state) => state.user);

  const { depositCrypto, openModal } = useBoundStore();

  const { isLoading, convertCurrency, exchangeRates } = useCurrencyData();

  const exchangeRate = useMemo(() => {
    if (isLoading) return <span className="loading loading-spinner loading-xs" />;
    if (!depositCrypto.currency?.currency || !user?.currency_fiat) return "0";

    return convertCurrency({
      amount: 1,
      fromCurrency: depositCrypto.currency.currency,
      toCurrency: user.currency_fiat,
      exchangeRates,
    }).toLocaleString();
  }, [isLoading, exchangeRates, depositCrypto, user?.currency_fiat]);

  return (
    <div className="flex flex-col gap-2 bg-base-200 p-4 rounded-lg text-base-content/50">
      <div className="flex gap-2">
        <TextBaseContent text={t("finance:cryptoBalanceDescription")} />
        <button className={"btn btn-sm btn-square btn-primary btn-soft text-base-content/50"}>
          <Alert onClick={() => openModal("OPEN_CRYPTO_SETTLEMENT_MODAL")} />
        </button>
      </div>
      <div className="font-bold flex items-center gap-2 justify-center text-sm text-primary">
        <span className=""> 1 {depositCrypto.currency?.currency}</span>
        <EqualApproximately className="w-4 h-4" />
        <span className="">
          {exchangeRate} {user?.currency_fiat}
        </span>
      </div>
    </div>
  );
};

export default ExchangeRate;
