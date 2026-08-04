import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import {
  InnerContainer,
  InnerDescription,
  InnerHeader,
  InnerSlogan,
  InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BonusTournamentHelpModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation(["popup", "bonus", "casino"]);

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
          <p>{t("popup:tournament.title")}</p>
          <p className={"text-primary"}>& {t("bonus:races")?.toUpperCase()}</p>
        </>}
        // 根据设计稿自行修改图片
        picture="/images/bonus_tournament/cup.png"
      />

      <InnerContainer>
        <InnerHeader
          title={<>
            {/* 根据设计稿自行修改文字 */}
            {t("bonus:bonus_details")}
          </>}
          onClose={onClose}
        />

        <InnerDescription>
          {t("popup:tournament.description")}
        </InnerDescription>

        <InnerDescription>
          <div className="p-2 bg-base-200 rounded-lg">
            <p
              className="text-sm text-base-content/50 mb-1 font-semibold">{t("popup:tournament.tournamentFrequency")}</p>
            <p className="text-base font-bold text-primary">{t("casino:daily")}, {t("casino:weekly")}</p>
          </div>
        </InnerDescription>

        <InnerTitle title={t("popup:tournament.claimDistribution")} />
        <InnerDescription>
          <Trans
            i18nKey={"popup:tournament.claimDistributionDesc"}
          />
        </InnerDescription>

        <InnerTitle title={t("popup:tournament.expiration")} />
        <InnerDescription>
          <Trans
            i18nKey={"popup:tournament.expirationDesc"}
          />
        </InnerDescription>

        <InnerTitle title={t("popup:tournament.generalTerms")} />
        <InnerDescription>
          <Trans
            i18nKey={"popup:tournament.generalTermsDesc1"}
          />
        </InnerDescription>
        <InnerDescription>
          <Trans
            i18nKey={"popup:tournament.generalTermsDesc2"}
          />
        </InnerDescription>
      </InnerContainer>
    </Modal>
  );
};
