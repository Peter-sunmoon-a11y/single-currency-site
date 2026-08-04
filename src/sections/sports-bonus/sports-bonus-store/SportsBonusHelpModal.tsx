import { Modal } from "@/components/ui/Modal";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { parser } from "@/sections/sports-bonus/components.tsx";
import {
  InnerContainer, InnerContent,
  InnerDescription,
  InnerHeader,
  InnerSlogan,
  InnerTitle
} from "@/standard/modals/DemoLazyInfoModal.tsx";
import { getSportsBonusCampaignLabel, getSportsBonusPicture } from "@/sections/sports-bonus/assets.ts";

interface SportsBonusHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SportsBonusHelpModal = ({ isOpen, onClose }: SportsBonusHelpModalProps) => {
  const { t } = useTranslation(["popup", "bonus"]);
  const campaignLabel = getSportsBonusCampaignLabel();

  // TODO: 体育彩金活动
  const { data: sports } = useUserSportWallet({ enabled: isOpen });

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
          {t("sportsBonus:bonus")}
          {campaignLabel ? <p className="mt-2 text-sm font-semibold text-primary italic">{campaignLabel}</p> : null}
        </>}
        // 根据设计稿自行修改图片
        picture={getSportsBonusPicture()}
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
            {t("popup:sports_bonus_details_modal.description")}
          </InnerDescription>

          <InnerTitle title={t("popup:claim_distribution")} />
          <InnerDescription>
            <Trans
              i18nKey={"popup:sports_bonus_details_modal.claim_distribution"}
            />
          </InnerDescription>

          <InnerDescription>
            {/*TODO: 里面有数据的显示需要用户有参与体育彩金活动才行*/}
            {sports?.data && <div>
              <h4 className="text-sm font-semibold mb-4">{t("bonus:wagering_rules")}</h4>
              <p className="text-xs text-base-content/50 leading-5 whitespace-pre-line">
                {t("popup:sports_bonus_details_modal.wagering_rules", { minOdds: parser(sports?.data?.extra_data)?.min_odds })}
              </p>
            </div>}
          </InnerDescription>

          <InnerTitle title={t("bonus:expiration")} />
          <InnerDescription>
            <Trans
              i18nKey={"popup:sports_bonus_details_modal.expiration_description"}
            />
          </InnerDescription>

          <InnerTitle title={t("bonus:general_terms")} />
          <InnerDescription>
            <Trans
              i18nKey={"popup:sports_bonus_details_modal.generalTerms_description"}
            />
          </InnerDescription>
        </InnerContent>
      </InnerContainer>
    </Modal>
  );
};
