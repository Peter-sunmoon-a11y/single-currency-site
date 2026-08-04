import { useTranslation } from "@/lib/i18n/react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan, InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

dayjs.extend(isToday);

export const Details = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
  const { t } = useTranslation(["popup", "bonus", "buddyBalls"]);

  return (
    <Modal
      hideTitle
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
      className="p-0 bg-transparent"
    >
      <InnerSlogan title={t("luckySpin:fortune")} picture="/images/game_lucky_spin/spins.png" />

      <InnerContainer>
        <InnerHeader
          title={t("bonus:bonus_details")}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription>
            {t("luckySpin:ready")}
          </InnerDescription>

          <InnerTitle title={t("popup:missions.claimDistribution")} />
          <InnerDescription>{t("luckySpin:rewards")}

          </InnerDescription><InnerTitle title={t("popup:tournament.expiration")} />
          <InnerDescription>{t("popup:tournament.expirationDesc")}</InnerDescription>

          <InnerTitle title={t("popup:tournament.generalTerms")} />
          <InnerDescription>{t("buddyBalls:accumulated")}</InnerDescription>
          <InnerDescription>{t("popup:tournament.generalTermsDesc2")}</InnerDescription>

        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};

export default Details;