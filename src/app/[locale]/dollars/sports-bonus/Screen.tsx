import {
  InnerUnavailable
} from "@/sections/dollars/components.tsx";
import {
  InnerSportsPlayToClaim
} from "@/sections/sports-bonus/components.tsx";
import { useSportsBonusWalletMqttSync, useUserSportWallet } from "@/query/sports-bonus.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useSportsBonusConfigList } from "@/hooks/api/useAuth.ts";
import { useAuth } from "@/contexts/AuthContext";
import SportsBonusOptional from "@/sections/sports-bonus/sports-bonus-optional.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { ChevronRight, GlobeLock } from "lucide-react";
import { getSportsBonusCampaignLabel, getSportsBonusPicture } from "@/sections/sports-bonus/assets.ts";

function Index() {
  // 启动体育彩金钱包数据 -> mqtt 数据融合
  useSportsBonusWalletMqttSync();

  const navigate = useAppNavigate();

  const { isLoading } = useAuth();

  const { t } = useTranslation(["sportsBonus"]);

  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();

  // 体育彩金钱包数据
  const { data: bonusWallet, isLoading: bonusWalletLoading } = useUserSportWallet();

  // 体育彩金配置数据
  const { data: bonusConfig, isLoading: bonusConfigLoading } = useSportsBonusConfigList();
  const campaignLabel = getSportsBonusCampaignLabel();

  const current = bonusWallet?.data;

  const is_show_betby = baseConfig?.data?.is_show_betby !== 0;  // 是否开启 betby - 体育下注

  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={<>
          {t("sportsBonus:bonus")}
          {campaignLabel ? <p className="mt-2 text-sm font-semibold text-primary italic">{campaignLabel}</p> : null}
        </>}
        // 根据设计稿自行修改图片
        picture={getSportsBonusPicture()}
      />

      <SmallLoading
        loading={bonusWalletLoading || bonusConfigLoading || isLoading}
        className="!mt-0 !min-h-[194px] !rounded-xl !border !border-base-300/60 !bg-base-200/80"
        content={
          <div className="min-h-[194px]">
            {/* 选择体育彩金活动 */}
            {is_show_betby && !current && bonusConfig?.data && <SportsBonusOptional />}

            {/* 活动不可用 */}
            {(!current && !bonusConfig?.data) && <InnerUnavailable />}
            {(!is_show_betby) && <InnerUnavailable
              icon={<GlobeLock />}
              text={t("sportsBonus:regionRestrictedMessage")}
              className={"text-sm px-4 text-center !normal-case !text-base-content/50 font-normal"} />}

            {/* 活动已开启 */}
            {is_show_betby && !!current && <InnerSportsPlayToClaim />}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-2">
        <button
          className="flex items-center justify-between rounded-lg bg-base-200 p-2 text-sm text-base-content/60"
          onClick={() => void navigate({ to: "/dollars/sports-bonus/history" })}>
          <span>1. {t("common:common.history")}</span>
          <ChevronRight className="h-4 w-4 text-base-content/45" />
        </button>
        <button
          className="flex items-center justify-between rounded-lg bg-base-200 p-2 text-sm text-base-content/60"
          onClick={() => void navigate({ to: "/dollars/sports-bonus/qa" })}>
          <span>2. {t("bonus:frequently_asked")}</span>
          <ChevronRight className="h-4 w-4 text-base-content/45" />
        </button>
      </div>
    </div>
  );
}

export const beforeLoad = undefined;

export default Index;
