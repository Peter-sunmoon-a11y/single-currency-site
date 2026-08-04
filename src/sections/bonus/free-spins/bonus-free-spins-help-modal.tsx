import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan, InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

interface BonusFreeSpinsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusFreeSpinsHelpModal = ({ isOpen, onClose }: BonusFreeSpinsHelpModalProps) => {
  const { t } = useTranslation(["popup", "casino", "bonus", "luckySpin"]);

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
        title={t("casino:freeSpins")}
        // 根据设计稿自行修改图片
        picture="/images/free_spins/free-spins.png"
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
            {t("luckySpin:freeSpinsBonusDetails")}
          </InnerDescription>

          <InnerTitle title={t("popup:missions.claimDistribution")} />
          <InnerDescription>
            {t("luckySpin:freeSpinsClaimDistributionDescription1")}
          </InnerDescription>
          <InnerDescription>
            {t("luckySpin:freeSpinsClaimDistributionDescription2")}
          </InnerDescription>

          <InnerTitle title={t("bonus:expiration")} />
          <InnerDescription>
            {t("luckySpin:freeSpinsExpirationDescription1")}
          </InnerDescription>
          <InnerDescription>
            {t("luckySpin:freeSpinsExpirationDescription2")}
          </InnerDescription>

          <InnerTitle title={t("bonus:general_terms")} />
          <InnerDescription>
            {t("luckySpin:freeSpinsGeneralTermsDescription1")}
          </InnerDescription>
          <InnerDescription>
            {t("luckySpin:freeSpinsGeneralTermsDescription2")}
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
