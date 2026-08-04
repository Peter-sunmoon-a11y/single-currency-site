import { useTranslation } from "@/lib/i18n/react-i18next";
import { VipBenefitsTable } from "@/sections/bonus/vip-benefits/VipBenefitsTable";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { useMemo } from "react";
import { useUserClaimBonus, useVipNextLevelData } from "@/hooks/api/useAuth.ts";
import { Decimal } from "decimal.js";
import { useBoundStore } from "@/store";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

function RouteComponent() {
  const { t } = useTranslation("vip");

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  // 获取用户的奖励详情数据
  const { data: claimData, isLoading } = useUserClaimBonus();

  const status = useBoundStore((state) => state.status);

  const lifetimeRewards = useMemo(() => {
    if (claimData?.code === 0 && claimData?.data && Array.isArray(claimData?.data?.data)) {
      const levelUpClaim = claimData?.data?.data?.find((item: any) => item.item === "level_up");
      return Number(levelUpClaim?.sum || 0);
    }
    return 0;
  }, [claimData]);

  /**
   * 下一级升级数据
   */
  const { data: vip } = useVipNextLevelData();

  const fullXP = useMemo(() => Number(vip?.data?.xp || 0), [vip]);

  const userXP = useMemo(() => Number(status?.xp || 0), [status]);

  // 计算升级所需经验值
  const xpToNextVip = useMemo(() => {
    if (!fullXP || !status) return [0, 0];
    const a = Decimal(fullXP);
    const b = Decimal(userXP);
    const c = Decimal.max(0, a.sub(b));
    return [
      b.div(a).toNumber(), // 当前XP进度
      c.toDP(0, Decimal.ROUND_UP).toNumber()
    ];
  }, [fullXP, userXP]);

  const currentVip = status?.vip || '';

  const isAuthenticated = useBoundStore((state) => !!state.user);

  return (
    <div className="flex flex-col gap-4 p-4">
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={<div className="flex flex-col justify-center gap-1">
          {isAuthenticated && <>
            <div className="w-full">
              <p className="">{t("vip:lifetime_vip_rewards")}</p>
            </div>
            <p className="text-3xl text-primary">
              {isLoading
                ? "0.00"
                : formatWithConversion(lifetimeRewards, "USDT", {
                  showSymbol: true,
                  showCode: false
                }).formatted}
            </p>
          </>}
          {!isAuthenticated && <div className="w-full">
            <p className="">{t("vip:exclusive_vip_system")}</p>
          </div>}
        </div>
        }
        // 根据设计稿自行修改图片
        picture="/images/bonus_pages/bonus-banner.png"
      />

      <div className="relative flex h-full w-full flex-col gap-2 bg-base-200 p-4">
        {/* VIP Level */}
        {isAuthenticated && <h2 className="flex items-center gap-2 text-xl font-bold">
          <img
            src={`/images/vip/levels/${currentVip}.png`}
            alt={`VIP ${currentVip}`}
            className="h-7.5 w-7.5"
            loading="lazy"
            decoding="async"
            draggable="false"
          />
          VIP {currentVip}
          <sub className="text-xs text-base-content/50 font-semibold">
            {t("vip:xp_to_vip", { xp: xpToNextVip[1], vip: (status?.vip || 0) + 1 })}
          </sub>
        </h2>}

        {!isAuthenticated && <>
          <TextBaseContent text={t("vip:step_into_world")} />
          <TextBaseContent text={t("vip:every_bet")} />
        </>}

      </div>

      <VipBenefitsTable />
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
