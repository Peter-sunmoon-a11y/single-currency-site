import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import {
  InnerSlogan,
  InnerContainer,
  InnerHeader,
  InnerDescription,
  InnerContent,
  InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

export default function VIPMondayBonusModal(
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) {
  const { t } = useTranslation(["popup", "bonus"]);

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
          i18nKey="popup:vipMonday.title"
          components={[<div className={"text-primary"} />]}
        />}
        // 根据设计稿自行修改图片
        picture="/images/bonus_monday/vip-monday.png"
      />

      <InnerContainer>
        <InnerHeader
          title={t("bonus:bonus_details")}
          onClose={onClose}
        />

        <InnerContent>
          <InnerDescription>
            {t("popup:vipMonday.vipMondayDescription")}
          </InnerDescription>

          <InnerTitle title={t("popup:vipMonday.release_frequency")} />
          <InnerDescription>{t("popup:vipMonday.every_monday")}</InnerDescription>

          <InnerTitle title={t("popup:expiration")} />

          <InnerDescription>
            {t("popup:vipMonday.expiration_description")}
          </InnerDescription>

          <InnerTitle title={t("popup:generalTerms")} />

          <InnerDescription>
            {t("popup:vipMonday.generalTerms_description")}
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
}