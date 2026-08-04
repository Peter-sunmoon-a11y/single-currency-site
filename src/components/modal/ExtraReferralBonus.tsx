import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan,
  InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

export default function ExtraReferralBonusModal(
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) {
  const { t } = useTranslation("referral");

  const user = useBoundStore((state) => state.user);

  const { formatCurrency, convertCurrency, exchangeRates } = useCurrencyData();

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
        title={<Trans
          i18nKey="referral:extraReferralBonus.slogan"
          components={[<div className={"text-primary"} />]}
        />}
        // 根据设计稿自行修改图片
        picture="/images/bonus_pages/first-referral.png"
      />

      <InnerContainer>
        <InnerHeader
          title={<h1 className={"text-primary"}>
            {t("bonus:bonus_details")}
          </h1>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerTitle title={t("referral:extraReferralBonus.bonusCalculatedTitle")} />

          <InnerDescription>
            <Trans
              i18nKey="referral:extraReferralBonus.bonusCalculatedDesc"
              components={[<span className="text-primary" />]}
              values={{
                depositAmount: formatCurrency({
                  amount: convertCurrency({
                    amount: 45,
                    fromCurrency: "USDT",
                    toCurrency: user?.currency_fiat ?? "",
                    exchangeRates
                  }),
                  currency: user?.currency_fiat ?? "",
                  showSymbol: true, showCode: false
                }).formatted, bonusAmount: formatCurrency({
                  amount: convertCurrency({
                    amount: 4.5,
                    fromCurrency: "USDT",
                    toCurrency: user?.currency_fiat ?? "",
                    exchangeRates
                  }),
                  currency: user?.currency_fiat ?? "",
                  showSymbol: true, showCode: false
                }).formatted,
                bonusPercent: "10%"
              }}
            />
          </InnerDescription>
          <InnerDescription>
            {t("referral:extraReferralBonus.title", { bonusPercent: "10%" })}
          </InnerDescription>

          <InnerTitle title={t("referral:extraReferralBonus.claimDistributionTitle")} />

          <InnerDescription>
            {t("referral:extraReferralBonus.claimDistributionDesc")}
          </InnerDescription>

          <InnerTitle title={t("referral:extraReferralBonus.expirationTitle")} />

          <InnerDescription>
            {t("referral:extraReferralBonus.expirationDesc")}
          </InnerDescription>

          <InnerTitle title={t("referral:extraReferralBonus.generalTermsTitle")} />

          <InnerDescription>
            <Trans
              i18nKey={"referral:extraReferralBonus.generalTermsDesc1"}
              values={{
                bonusCurrency: "BUCK/USDT",
                referralTimes: 4,
                bonusAmount: formatCurrency({
                  amount: convertCurrency({
                    amount: 5,
                    fromCurrency: "USDT",
                    toCurrency: user?.currency_fiat ?? "",
                    exchangeRates
                  }),
                  currency: user?.currency_fiat ?? "",
                  showSymbol: true, showCode: false
                }).formatted
              }}
              components={[<span className={"text-primary"} />]} />
          </InnerDescription>

          <InnerDescription>
            {t("referral:extraReferralBonus.generalTermsDesc2")}
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
}