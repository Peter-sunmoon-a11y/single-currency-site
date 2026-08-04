import { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Info } from "@/sections/bonus/components/Info.tsx";
import clsx from "clsx";
import { useUserSportWallet } from "@/query/sports-bonus.ts";
import { BonusDollarsState } from "@/sections/dollars/components.tsx";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { InnerProgress } from "@/sections/bonus/bonus-store/InnerComponents.tsx";
import { useBoundStore } from "@/store";
import { useSportsBonusIsRegionBanned } from "@/hooks/api/useAuth.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { getSportsBonusCampaignLabel, getSportsBonusPicture } from "@/sections/sports-bonus/assets.ts";

export const SportsBonusGuard = ({ children }: { children: ReactNode }) => {
  const { data: baseConfig } = useBaseConfig();
  const { data: regionBannedResp } = useSportsBonusIsRegionBanned();

  const is_show_betby = baseConfig?.data?.is_show_betby !== 0;
  const sports_bonus_wallet_on = baseConfig?.data?.bonus_switch?.sports_bonus_wallet !== 0;
  const sports_region_banned = regionBannedResp?.data?.is_region_banned === 1;

  if (!is_show_betby || !sports_bonus_wallet_on || sports_region_banned) {
    return null;
  }

  return <>{children}</>;
};

export const SportsBonusCard = () => {
  const navigate = useAppNavigate();
  const openModal = useBoundStore(state => state.openModal);

  const { t } = useTranslation(["sportsBonus"]);

  const { navigateCallback } = useNavigateGuard();

  const { data: sports } = useUserSportWallet();
  const is_pending_collection = sports?.data?.status === BonusDollarsState.pending_collection;
  const campaignLabel = getSportsBonusCampaignLabel();
  const goToDetails = () => navigateCallback(() => {
    void navigate({ to: "/dollars/sports-bonus" });
  }, true);

  return (
    <SportsBonusGuard>
      <div
        className={clsx("relative bg-base-100 rounded-lg p-4 overflow-hidden cursor-pointer")}
        role="button"
        tabIndex={0}
        onClick={goToDetails}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToDetails();
          }
        }}
      >
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <img
              src={getSportsBonusPicture()}
              loading="lazy"
              decoding="async"
              className="w-8 h-8 object-contain"
            />
            <h2 className={clsx("text-base font-bold uppercase")}>
              {t("sportsBonus:bonus")}
              {campaignLabel ? <p className="text-[12px] font-semibold text-primary italic">{campaignLabel}</p> : null}
            </h2>
            {/* 活动信息提示 */}
            <Info
              className=""
              onClick={(e) => {
                e.stopPropagation();
                openModal("OPEN_SPORTS_BONUS_HELP_MODAL");
              }}
            />
          </div>

          {/* 活动入口链接 */}
          <button
            className={"btn btn-primary btn-sm text-sm"}
            onClick={(e) => {
              e.stopPropagation();
              goToDetails();
            }}
          >
            {is_pending_collection ? t("bonus:claim") : t("bonus:go")}
          </button>
        </div>

        {/* 进度条：有活动数据时展示 */}
        {sports?.data && <InnerProgress isCompleted={is_pending_collection} />}
      </div>
    </SportsBonusGuard>
  );
};
