import { Modal } from "@/components/ui/Modal";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Trans } from "@/lib/i18n/react-i18next";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan, InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

interface BonusRakebackHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusRakebackHelpModal = ({ isOpen, onClose }: BonusRakebackHelpModalProps) => {
  const { t } = useTranslation(["popup", "bonus"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: baseConfig } = useBaseConfig();
  const minClaimAmount = parseFloat(baseConfig?.data?.super_rakeback?.min_claim_amount || "1") || 1;

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={<>
          <p>{t("popup:rakeback.super")}</p>
          <p className={"text-primary"}>{t("popup:rakeback.title")}</p>
        </>}
        // 根据设计稿自行修改图片
        picture="/images/bonus_rakeback/rakeback.png"
      />

      <InnerContainer>
        <InnerHeader
          title={<>
            {/* 根据设计稿自行修改文字 */}
            {t("bonus:bonus_details")}
          </>}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription>
            {t("popup:rakeback.description")}
          </InnerDescription>

          <InnerTitle title={t("popup:rakeback.release_frequency")} />
          <InnerDescription>{t("popup:rakeback.instantaneous")}</InnerDescription>

          <InnerTitle title={t("popup:rakeback.howIsBonusCalculated")} />
          <InnerDescription>
            <Trans
              i18nKey={"popup:rakeback.howIsBonusCalculatedDesc"}
            />
          </InnerDescription>

          <InnerDescription>
            <Trans
              i18nKey={"popup:rakeback.minimumClaimAmount"}
              components={[<span className="text-primary" />]}
              values={{
                money: formatWithConversion(minClaimAmount, "USD", { showCode: false }).formatted,
                value: formatWithConversion(minClaimAmount, "USD", { showCode: false }).formatted
              }}
            />
          </InnerDescription>

          <InnerTitle title={t("popup:rakeback.whatIsBooster")} />
          <InnerDescription>
            {t("popup:rakeback.rakebackDesc1")}
          </InnerDescription>
          <InnerDescription>
            {t("popup:rakeback.rakebackDesc2")}
          </InnerDescription>

          <InnerTitle title={t("popup:rakeback.expiration")} />
          <InnerDescription>
            {t("popup:rakeback.expirationDesc")}
          </InnerDescription>

          <InnerTitle title={t("popup:rakeback.generalTerms")} />
          <InnerDescription>
            {t("popup:rakeback.generalTermsDesc1")}
          </InnerDescription>
          <InnerDescription>
            {t("popup:rakeback.generalTermsDesc2")}
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
