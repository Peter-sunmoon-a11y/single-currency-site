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
import { useMembersDayConfig } from "@/hooks/api/usePublic.ts";

interface MembersDayHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembersDayHelpModal = ({ isOpen, onClose }: MembersDayHelpModalProps) => {
  const { t } = useTranslation(["bonus", "popup", "vipMonday"]);

  const {data: members} = useMembersDayConfig()

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan
        title={t("vipMonday:members_day")}
        picture="/images/bonus_monday/members-day.png"
      />

      <InnerContainer>
        <InnerHeader title={t("bonus:bonus_details")} onClose={onClose} />

        <InnerContent>
          <InnerDescription>
            {t("popup:membersDay.description")}
          </InnerDescription>

          <InnerTitle title={t("popup:membersDay.releaseFrequency")} />
          <InnerDescription>{t("popup:membersDay.releaseFrequencyValue")}</InnerDescription>

          <InnerTitle title={t("popup:claim_distribution")} />
          <InnerDescription>{t("popup:membersDay.claimDistribution")}</InnerDescription>

          <InnerTitle title={t("popup:expiration")} />
          <InnerDescription>{t("popup:membersDay.expiration",{days: members?.data?.claim_end_day - members?.data?.claim_start_day})}</InnerDescription>

          <InnerTitle title={t("popup:generalTerms")} />
          <InnerDescription>{t("popup:membersDay.generalTerms")}</InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
