import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import {
  InnerContainer,
  InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan, InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

interface BonusStoreHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusStoreHelpModal = ({ isOpen, onClose }: BonusStoreHelpModalProps) => {
  const { t } = useTranslation(["popup", "casino", "bonus"]);

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
        title={t("bonus:slotBonus")}
        // 根据设计稿自行修改图片
        picture="/images/bonus_store/bonus-store.png"
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
            {t("popup:bonus_details_modal.description")}
          </InnerDescription>

          <InnerTitle title={t("popup:claim_distribution")} />
          <InnerDescription>
            <Trans
              i18nKey={"popup:bonus_details_modal.claim_distribution"}
            />
          </InnerDescription>

          <InnerTitle title={t("bonus:expiration")} />
          <InnerDescription>
            <Trans
              i18nKey={"popup:bonus_details_modal.expiration_description"}
            />
          </InnerDescription>

          <InnerTitle title={t("bonus:general_terms")} />
          <InnerDescription>
            <Trans
              i18nKey={"popup:bonus_details_modal.generalTerms_description"}
            />
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
