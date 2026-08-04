import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { ICurrentPromoList } from "@/types/double-or-nothing";
import { useCurrencyData } from "@/hooks/useCurrency";
import { useBoundStore } from "@/store";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan,
  InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";
import { everyDayAmountText, everyDayBonusText, minDepositAmount } from "@/sections/components/EveryDayBonus.tsx";

interface DoubleOrNothingHelpModalProps {
  currentPromo: ICurrentPromoList;
  open: boolean;
  onClose: () => void;
}


export const SundaySuperHelpModal = ({ currentPromo, open, onClose }: DoubleOrNothingHelpModalProps) => {
  const { t } = useTranslation(["popup", "vipMonday"]);
  const { convertCurrency, exchangeRates, formatCurrency } = useCurrencyData();
  const { depositFiat, depositCrypto, depositType } = useBoundStore();

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
        title={t("vipMonday:super_sunday")}
        // 根据设计稿自行修改图片
        picture="/images/deposit_promotion/super-bonus.png"
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
              i18nKey={"popup:sundayBonus.offer_details_desc"}
              components={[<span className="text-primary" />]}
              values={{
                value: everyDayBonusText({ bonus_rate: currentPromo?.bonus_rate }),
              }}
            />
          </InnerDescription>

          <InnerDescription>
            <div className="flex gap-1 justify-between">
              <div className="py-2 bg-base-200 rounded-field px-2 flex-1">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">{t("popup:minimum_deposit")}</p>
                <p className="text-lg font-bold text-primary">
                  {
                    minDepositAmount({
                      currentPromo,
                      depositType,
                      depositFiat,
                      depositCrypto,
                      exchangeRates,
                      convertCurrency,
                      formatCurrency
                    })
                  }
                </p>
              </div>
              <div className="py-2 bg-base-200 rounded-field px-2 flex-1">
                <p className="text-xs text-base-content/50 mb-1 font-semibold">
                  {t("popup:bonus_limit")}
                </p>
                <p className="text-lg font-bold text-primary">
                  {
                    everyDayAmountText({
                      currentPromo,
                      depositType,
                      depositFiat,
                      depositCrypto,
                      exchangeRates,
                      convertCurrency,
                      formatCurrency
                    })
                  }
                </p>
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

          <InnerTitle title={t("popup:missions.generalTerms")} />
          <InnerDescription>
            <Trans i18nKey={"popup:missions.generalTermsDesc1"} />
          </InnerDescription>
          <InnerDescription>
            <Trans i18nKey={"popup:missions.generalTermsDesc2"} />
          </InnerDescription>

        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
