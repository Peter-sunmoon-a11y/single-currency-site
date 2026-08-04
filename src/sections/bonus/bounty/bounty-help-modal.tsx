import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan,
  InnerTitle,
} from "@/standard/modals/DemoLazyInfoModal.tsx";

interface BountyHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BountyHelpModal = ({ isOpen, onClose }: BountyHelpModalProps) => {
  const { t } = useTranslation(["bonus", "bounty"]);

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        title={t("bounty:bounty")}
        picture="/images/bonus_bounty/bounty-card.png"
      />

      <InnerContainer>
        <InnerHeader title={t("bonus:bonus_details")} onClose={onClose} />

        <InnerContent>
          <InnerDescription>{t("bounty:details_description")}</InnerDescription>

          <InnerTitle title={t("bounty:how_it_works")} />
          <InnerDescription>{t("bounty:how_it_works_1")}</InnerDescription>
          <InnerDescription>{t("bounty:how_it_works_2")}</InnerDescription>
          <InnerDescription>{t("bounty:how_it_works_3")}</InnerDescription>
          <InnerDescription>{t("bounty:how_it_works_4")}</InnerDescription>
          <InnerDescription>{t("bounty:how_it_works_5")}</InnerDescription>

          <InnerTitle title={t("bounty:claim_distribution")} />
          <InnerDescription>{t("bounty:claim_distribution_1")}</InnerDescription>
          <InnerDescription>{t("bounty:claim_distribution_2")}</InnerDescription>
          <InnerDescription>{t("bounty:claim_distribution_3")}</InnerDescription>

          <InnerTitle title={t("bounty:eligible_bets")} />
          <InnerDescription>{t("bounty:eligible_bets_1")}</InnerDescription>
          <InnerDescription>{t("bounty:eligible_bets_2")}</InnerDescription>

          <InnerTitle title={t("bonus:general_terms")} />
          <InnerDescription>{t("bounty:general_terms_1")}</InnerDescription>
          <InnerDescription>{t("bounty:general_terms_2")}</InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
