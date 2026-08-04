import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan,
  InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

interface MemberBonusHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberBonusHelpModal = ({ isOpen, onClose }: MemberBonusHelpModalProps) => {
  const { t } = useTranslation(["achievement", "bonus", "popup"]);

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        title={t("bonus:bonus_detail_achievement")}
        picture="/images/achievement/achievement.png"
      />

      <InnerContainer>
        <InnerHeader title={t("bonus:bonus_details")} onClose={onClose} />

        <InnerContent>
          <InnerDescription cls="!mt-0">
            {t("achievement:achievements_card_description")}
          </InnerDescription>

          <InnerTitle title={t("popup:releaseFrequency")} />
          <InnerDescription>{t("popup:rakeback.instantaneous")}</InnerDescription>

          <InnerTitle title={t("bonus:general_terms")} />
          <InnerDescription>
            {t("popup:generalTermsDesc2")}
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
