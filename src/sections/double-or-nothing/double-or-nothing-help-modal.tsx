import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useCurrencyData } from "@/hooks/useCurrency";
import { useBoundStore } from "@/store";
import { CountdownTimerThree } from "@/components/ui/CountdownTimer";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan,
  InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

interface DoubleOrNothingHelpModalProps {
  currentPromo: ICurrentPromoList;
  open: boolean;
  onClose: () => void;
}

export const DoubleOrNothingHelpModal = ({ currentPromo, open, onClose }: DoubleOrNothingHelpModalProps) => {
  const { t } = useTranslation(["popup", "doubleOrNothing"]);
  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();
  const { depositFiat, depositCrypto, depositType } = useBoundStore();

  // Memoize currency calculations
  const currentCurrency = useMemo(
    () => depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency,
    [depositType, depositFiat?.currency?.currency, depositCrypto?.currency?.currency]
  );

  const formattedMinAmount = useMemo(() => {
    const value = convertCurrency({
      amount: currentPromo?.min_amount,
      fromCurrency: "USDT",
      toCurrency:
        depositType === "fiat"
          ? depositFiat?.currency?.currency
          : depositCrypto?.currency?.currency,
      exchangeRates: exchangeRates
    }) || 0;

    const valueNum = depositType === "fiat" ? Math.ceil(value) : value;

    return formatCurrency({
      amount: valueNum,
      currency: depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency,
      showSymbol: false,
      showCode: true
    }).formatted;
  }, [currentPromo?.min_amount, depositType, depositFiat?.currency?.currency, depositCrypto?.currency?.currency, convertCurrency, exchangeRates, formatCurrency]);

  const formattedBonusAmount = useMemo(() => {
    const value = convertCurrency({
      amount: currentPromo?.bonus_amount,
      fromCurrency: "USDT",
      toCurrency: currentCurrency,
      exchangeRates: exchangeRates
    }) || 0;

    return formatCurrency({
      currency: currentCurrency,
      amount: value,
      showSymbol: false,
      showCode: true
    }).formatted;
  }, [currentPromo?.bonus_amount, currentCurrency, convertCurrency, exchangeRates, formatCurrency]);

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={t("doubleOrNothing:recovery_bonus_title")}
        // 根据设计稿自行修改图片
        picture="/images/deposit_promotion/recoveryBonus.png"
      />

      <InnerContainer>
        <InnerHeader
          title={<>
            {/* 根据设计稿自行修改文字 */}
            {t("popup:offer_details")}
          </>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription cls={"!mt-0"}>
            <Trans
              i18nKey={"popup:doubleOrNothing.offer_details_desc"}
              components={[<span className="text-primary" />]}
              values={{
                value: "10%",
                amount: formattedMinAmount,
                cash_bonus: formattedBonusAmount
              }}
            />
          </InnerDescription>

          <InnerDescription>
            <div className="grid grid-cols-2 gap-2">
              <div className="py-2 bg-base-200 rounded-field px-2">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("bonus:deposit")}</p>
                <p className="text-lg font-bold text-primary">{formattedMinAmount}</p>
              </div>
              <div className="py-2 bg-base-200 rounded-field px-2">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">
                  {t("popup:doubleOrNothing.cash_bonus")}
                </p>
                <p className="text-lg font-bold text-primary">{formattedBonusAmount}</p>
              </div>
              <div className="col-span-2 py-2 bg-base-200 rounded-field px-2">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:offer_expiry")}</p>
                <div className="text-lg font-bold text-primary inline-flex">
                  <CountdownTimerThree expireTime={currentPromo?.expired_at} />
                </div>
              </div>
            </div>
          </InnerDescription>

          <InnerTitle title={t("popup:claim_distribution")} />
          <InnerDescription>
            <Trans
              i18nKey={"popup:sundayBonus.claim_distribution_desc"}
              components={[<span className="text-primary" />]}
              values={{
                currency: depositType === "fiat" ? depositFiat?.currency?.currency : depositCrypto?.currency?.currency
              }}
            />
          </InnerDescription>

        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
