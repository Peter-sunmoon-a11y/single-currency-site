import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { useState } from "react";
import { BonusSelectCurrency } from "@/sections/dollars/bonus-select-currency.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { Modal } from "@/components/ui/Modal.tsx";
import { InnerConfirmBox } from "@/sections/dollars/inner-confirm-box.tsx";
import { InnerCoinBox } from "@/sections/dollars/inner-coin-box.tsx";

export type BonusClaimModalProps = {
  open: boolean;
  bonus: string;
  isBonus?: boolean;
  loading?: boolean;
  imageSrc?: string;
  animateCls?: string;
  onClick: (v: string) => void;
  onClose: () => void;
};

export const BonusClaimModalContent = (
  {
    open,
    bonus,
    isBonus = false,
    loading,
    imageSrc,
    animateCls,
    onClick,
    onClose
  }: BonusClaimModalProps) => {
  const { t } = useTranslation();

  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

  const [currency, setCurrency] = useState("");

  const bonus_amount = formatCurrency({
    amount: convertCurrency({
      amount: bonus || 0,
      fromCurrency: "USDT",
      toCurrency: currency || "",
      exchangeRates
    }),
    currency: currency || "",
    showSymbol: true, showCode: false
  }).formatted

  return (
    <Modal
      title={""}
      isOpen={open}
      onClose={onClose}
      position={"modal-middle"}
    >
      <div className="relative">
        <InnerCoinBox imageSrc={imageSrc} animateCls={animateCls} />
        <div className="flex flex-col items-center justify-center gap-4 mt-4">
          <div className="text-3xl font-bold text-primary">
            {Number(bonus_amount) === 0 ? '???' : bonus_amount}
          </div>

          <div className="w-full rounded-lg bg-base-300 p-2 flex items-center gap-2">
            <p className="text-sm text-base-content/60 max-w-[180px]">
              <Trans
                i18nKey={isBonus ? "bonus_credited2" : "bonus_credited1"}
                ns="bonus"
                values={{
                  bonus: formatCurrency({
                    amount: convertCurrency({
                      amount: bonus || 0,
                      fromCurrency: "USDT",
                      toCurrency: currency || "",
                      exchangeRates
                    }),
                    currency: currency || "",
                    showSymbol: true, showCode: false
                  }).formatted
                }}
                components={[<span className="text-primary font-bold" />]}
              />
            </p>
            <BonusSelectCurrency
              onSelected={(selectedCurrency) => {
                console.info(selectedCurrency);
                setCurrency(selectedCurrency);
              }} />
          </div>

          <InnerConfirmBox
            loading={loading}
            onClick={() => {
              onClick(currency);
            }}
          >{t("bonus:claim")}</InnerConfirmBox>
        </div>
      </div>
    </Modal>
  );
};
