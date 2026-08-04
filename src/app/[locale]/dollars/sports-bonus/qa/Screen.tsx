import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { InnerSportsDescription, InnerSportsGiveUpBonus } from "@/sections/sports-bonus/components.tsx";
import { getSportsBonusCampaignLabel, getSportsBonusPicture } from "@/sections/sports-bonus/assets.ts";

function Index() {
  const { t } = useTranslation(['sportsBonus']);
  const campaignLabel = getSportsBonusCampaignLabel();

  // 体育彩金钱包数据
  const { data: bonusWallet } = useUserSportWallet();

  // 彩金配置数据
  const current = bonusWallet?.data;

  // 活动描述
  return <div className={"p-4 flex flex-col gap-4"}>
    <InnerSlogan
      // 根据设计稿自行修改文字
      title={<>
        {t("sportsBonus:bonus")}
        {campaignLabel ? <p className="mt-2 text-sm font-semibold text-primary italic">{campaignLabel}</p> : null}
      </>}
      // 根据设计稿自行修改图片
      picture={getSportsBonusPicture()}
    />
    {/* 是否可放弃彩金 */}
    <InnerSportsGiveUpBonus />
    {/* 活动描述 */}
    <InnerSportsDescription data={current} />
  </div>;
}
export const beforeLoad = undefined;

export default Index;
