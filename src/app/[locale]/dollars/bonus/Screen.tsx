import {
  InnerPlayToClaim,
  InnerUnavailable,
  EBonus
} from "@/sections/dollars/components.tsx";
import { useBonusWalletMqttSync, useUserBonusWallet } from "@/query/dollars.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useBonusConfigList } from "@/hooks/api/useAuth.ts";
import { useAuth } from "@/contexts/AuthContext";
import BonusOptional from "@/sections/dollars/bonus-optional.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { ChevronRight } from "lucide-react";

function Index() {
  // 启动 slots 彩金钱包数据 -> mqtt 数据融合
  useBonusWalletMqttSync();

  const navigate = useAppNavigate();

  const { isLoading } = useAuth();

  const { t } = useTranslation();

  // 彩金钱包数据
  const { data: bonusWallet, isLoading: bonusWalletLoading } = useUserBonusWallet();

  // 彩金配置数据
  const { data: bonusConfig, isLoading: bonusConfigLoading } = useBonusConfigList();

  const current = bonusWallet?.data;

  return (<div className="flex flex-col gap-4 p-4 pb-6">
    <InnerSlogan
      // 根据设计稿自行修改文字
      title={t("bonus:slotBonus")}
      // 根据设计稿自行修改图片
      picture="/images/bonus_store/bonus-store.png"
    />

    <SmallLoading
      loading={bonusWalletLoading || bonusConfigLoading || isLoading}
      className="!mt-0 !min-h-[194px] !rounded-xl !border !border-base-300/60 !bg-base-200/80"
      content={
        <div className="min-h-[194px]">
          {/* 选择彩金活动 */}
          {!current && bonusConfig?.data && <BonusOptional />}

          {/*活动不可用 */}
          {!current && !bonusConfig?.data && <InnerUnavailable />}

          {/* 活动已开启 */}
          {!!current && <InnerPlayToClaim currency={EBonus.TOKEN} />}
        </div>
      } />

    <div className="grid grid-cols-1 gap-2">
      <button
        className="flex items-center justify-between rounded-lg bg-base-200 p-2 text-sm text-base-content/60"
        onClick={() => void navigate({ to: "/dollars/bonus/history" })}>
        <span>1. {t("common:common.history")}</span>
        <ChevronRight className="h-4 w-4 text-base-content/45" />
      </button>
      <button
        className="flex items-center justify-between rounded-lg bg-base-200 p-2 text-sm text-base-content/60"
        onClick={() => void navigate({ to: "/dollars/bonus/qa" })}>
        <span>2. {t("bonus:frequently_asked")}</span>
        <ChevronRight className="h-4 w-4 text-base-content/45" />
      </button>
    </div>
  </div>);
}
export const beforeLoad = undefined;

export default Index;
