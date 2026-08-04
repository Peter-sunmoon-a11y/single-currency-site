import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useBoundStore } from "@/store";
import { useUserClaimBonus } from "@/hooks/api/useAuth";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useMemo, useState } from "react";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { REWARD_ITEMS_EXCLUDED_FROM_LIFETIME_BONUS_SET } from "@/sections/bonus/shared/bonus-details-config";
import { Eye, EyeOff } from "lucide-react";
import { BonusDetailsBoard } from "@/sections/bonus/shared/BonusDetailsBoard.tsx";

interface BonusHeroProps {
  type?: "totalBonus" | "achievementBonus";
  disabled?: boolean;
  totalBonusClaimed?: number; // 可选，用作fallback
}

export function Hero({ disabled, totalBonusClaimed = 0 }: BonusHeroProps) {
  const { t } = useTranslation("bonus");

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const isInitialized = useBoundStore((state) => state.isInitialized);
  const isAuthenticated = useBoundStore((state) => !!state.user);

  // 获取用户的奖励详情数据
  const { data: claimBonusData, isLoading } = useUserClaimBonus();

  const [detailsOpen, setDetailsOpen] = useState(false);

  // 优化的loading状态：未初始化或数据加载中时显示骨架屏
  const loading = isAuthenticated && (!isInitialized || isLoading);

  // 计算总的已领取奖励金额（所有 bonus 的 sum 总和，统一转换为用户显示货币）
  const calculatedTotalClaimed = useMemo(() => {
    if (!claimBonusData?.data?.data || !Array.isArray(claimBonusData.data.data)) {
      return totalBonusClaimed;
    }

    // 将所有 bonus 的 sum 值累加，转换为 USDT（作为基准货币）
    return claimBonusData.data.data.reduce((acc: number, item: any) => {
      if (REWARD_ITEMS_EXCLUDED_FROM_LIFETIME_BONUS_SET.has(item.item)) return acc; // 不符合 => 跳过
      // 这里假设后端已经统一转换为 USDT，如果不同货币需要转换，可以使用 convertToUSD
      return acc + (parseFloat(item.sum) || 0);
    }, 0);
  }, [claimBonusData?.data?.data, totalBonusClaimed]);

  return (
    <InnerSlogan
      // 根据设计稿自行修改文字
      title={
        <div className="flex flex-col justify-center gap-1">
          {(isAuthenticated && !disabled) && (
            <>
              <div className="w-full">
                <p className="">{t("bonus:lifetime_bonus")}</p>
              </div>
              <p className="text-3xl text-primary flex items-center gap-1">
                {loading
                  ? "0.00"
                  : formatWithConversion(calculatedTotalClaimed, "USDT", {
                    showSymbol: true,
                    showCode: false,
                  }).formatted}
                <span
                  className="text-base-content"
                  onClick={() => setDetailsOpen(o => !o)}
                >
                  {!detailsOpen ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </p>
              <BonusDetailsBoard open={detailsOpen} onClose={() => setDetailsOpen(false)} />
            </>
          )}
          {(!isAuthenticated || disabled) && (
            <p>
              <span className="block">{t("bonus:enjoy")}</span>
              <span className="text-primary block">{t("casino:exclusive")}</span>
              <span className="text-primary">{t("bonus:rewards")}</span>
            </p>
          )}
        </div>
      }
      // 根据设计稿自行修改图片
      picture="/images/bonus_pages/bonus-banner.png"
    />
  );
}
