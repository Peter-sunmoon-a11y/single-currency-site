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

interface HelpModalMysteryBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModalMysteryBox = ({ isOpen, onClose }: HelpModalMysteryBoxProps) => {
  const { t } = useTranslation(["popup", "bonus", "mysteryBox"]);

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
        title={t("mysteryBox:mystery_box")}
        // 根据设计稿自行修改图片
        picture="/images/bonus_mysterybox/gift.png"
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
            {t("popup:mysteryBox.description")}
          </InnerDescription>

          <InnerTitle title={t("popup:releaseFrequency")} />
          <InnerDescription>{t("popup:mysteryBox.releaseFrequencyValue")}</InnerDescription>

          <InnerTitle title={t("popup:claim_distribution")} />
          <InnerDescription>
            <div className="p-2 bg-base-200 rounded-lg">
              <p
                className="text-base text-primary mb-1 font-bold">{t("popup:mysteryBox.claimDistributionTitle")}</p>
              <p className="text-sm text-base-content/50">{t("popup:mysteryBox.claimDistributionDesc")}</p>
            </div>
          </InnerDescription>

          <InnerTitle title={t("popup:deposit.expiration")} />
          <InnerDescription>
            {t("popup:mysteryBox.expirationDesc")}
          </InnerDescription>

          <InnerTitle title={t("popup:deposit.generalTerms")} />
          <InnerDescription>
            {t("popup:mysteryBox.generalTermsDesc1")}
          </InnerDescription>
          <InnerDescription>
            {t("popup:mysteryBox.generalTermsDesc2")}
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
