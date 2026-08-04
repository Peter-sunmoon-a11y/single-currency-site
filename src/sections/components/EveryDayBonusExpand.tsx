import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { useCurrencyData } from "@/hooks/useCurrency";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { InnerBonusParams } from "@/sections/components/InnerComponents.tsx";
import { PromoOptionWrap } from "@/sections/components/PromoOptionWrap.tsx";
import { everyDayAmountText, everyDayBonusText } from "@/sections/components/EveryDayBonus.tsx";

export const EveryDayBonusExpand = ({ currentPromo }: { currentPromo: ICurrentPromoList }) => {
  const { t } = useTranslation("mysteryBox");

  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();

  const { depositFiat, depositCrypto, depositType, openModal } = useBoundStore();

  const _currentPromo = {
    ...currentPromo,
    bonus_rate: depositType === "fiat" ? currentPromo?.fiat_bonus_rate : currentPromo?.crypto_bonus_rate
  };

  return (
    <PromoOptionWrap
      icon={"/images/bonus/super-bonus.png"}
      title={t("vipMonday:super_sunday")}
      onClick={() => openModal("OPEN_SUNDAY_SUPER_HELP_MODAL", { currentPromo: _currentPromo })}
      extraNode={<>
        <InnerBonusParams className={"text-[12px] !py-1 !px-2"}>
          {t("vipMonday:cash_bonus_low",
            {
              value: everyDayBonusText({
                bonus_rate: _currentPromo?.bonus_rate
              })
            })}
        </InnerBonusParams>
        <InnerBonusParams className={"text-[12px] !py-1 !px-2"}>
          {t("casino:upTo")} {
          everyDayAmountText({
            currentPromo: _currentPromo,
            depositType,
            depositFiat,
            depositCrypto,
            exchangeRates,
            convertCurrency,
            formatCurrency
          })
        }
        </InnerBonusParams>
        <InnerBonusParams className={"text-[12px] !py-1 !px-2"}>1X</InnerBonusParams>
      </>}
    />
  );
};

