import {useTranslation} from "@/lib/i18n/react-i18next";
import {useBoundStore} from "@/store";
import {useCurrencyData} from "@/hooks/useCurrency";
import {PromoOptionEntry} from "@/sections/components/PromoOptionEntry.tsx";
import {InnerBonusParams} from "@/sections/components/InnerComponents.tsx";
import {CountdownTimerThree} from "@/components/ui/CountdownTimer.tsx";
import {promoKey} from "@/components/modal/UserFinanceModal/c/SpecialOffers.utils.ts";

export const limitOfferMinAmount = (
  currentPromo: Record<string, any>,
  depositType: string,
  depositFiat: any,
  depositCrypto: any,
  convertCurrency: any,
  exchangeRates: any,
  formatCurrency: any
) => {
  const currency = depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency;
  const decimals = depositType === "fiat" ? depositFiat?.currency?.display_decimal : depositCrypto?.currency?.display_decimal;

  const value =
    convertCurrency({
      amount: currentPromo?.min_amount,
      fromCurrency: "USDT",
      toCurrency: currency,
      exchangeRates: exchangeRates,
      decimals
    }) || 0;

  const valueNum = depositType === "fiat" ? Math.ceil(value) : value;

  return formatCurrency({
    amount: valueNum,
    currency,
    showSymbol: false,
    showCode: true
  }).formatted;
};

export const limitOfferBonusAmount = (
  currentPromo: Record<string, any>,
  depositType: string,
  depositFiat: any,
  depositCrypto: any,
  convertCurrency: any,
  exchangeRates: any,
  formatCurrency: any
) => {
  const currency = depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency;
  const decimals = depositType === "fiat" ? depositFiat?.currency?.display_decimal : depositCrypto?.currency?.display_decimal;

  const value =
    convertCurrency({
      amount: currentPromo?.bonus_amount,
      fromCurrency: "USDT",
      toCurrency: currency,
      exchangeRates: exchangeRates,
      decimals
    }) || 0;

  return formatCurrency({
    currency,
    amount: value,
    showSymbol: false,
    showCode: true
  }).formatted;
};

export const LimitOfferBonus = ({current, onExpire}: { current: Record<string, any>; onExpire?: () => void }) => {
  const {t} = useTranslation();

  const {convertCurrency, exchangeRates, formatCurrency} = useCurrencyData();

  const {depositFiat, depositCrypto, depositType, openModal} = useBoundStore();

  return (
    <PromoOptionEntry
      title={t("finance:limited_offer")}
      onClick={() => openModal("OPEN_LIMITED_OFFERS_HELP_MODAL", {currentPromo: current})}
      countdown={<CountdownTimerThree expireTime={current?.expired_at} isEndFun={onExpire}/>}
      extraNode={<>
        <InnerBonusParams>
          {t("finance:deposit_plus_cash_bonus",
            {
              amount: limitOfferMinAmount(
                current,
                depositType,
                depositFiat,
                depositCrypto,
                convertCurrency,
                exchangeRates,
                formatCurrency
              ),
              cash_bonus: limitOfferBonusAmount(
                current,
                depositType,
                depositFiat,
                depositCrypto,
                convertCurrency,
                exchangeRates,
                formatCurrency
              )
            })}
        </InnerBonusParams>
      </>}
      className={promoKey.limitOfferSet().has(current?.promo_code) && current?.is_default === 1 ? 'bg-primary/20' : ''}
    />
  );
};

