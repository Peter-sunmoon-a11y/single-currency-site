import { useApplyFreeSpin, FREE_SPIN_APPLY_ENTRY_KEY, useFreeSpinApplyEntry } from "@/query/free-spins";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBoundStore } from "@/store";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
// import { useAppNavigate } from "@/hooks/useAppNavigate";

/**
 * 无 Free Spins 时的提示卡片（/main/bonus）。
 * - inCooldown===true：右上角显示 next_apply_at 倒计时，Go 按钮置灰
 * - 点 Go → 打开 OPEN_FREE_SPINS_HELP_MODAL，引导用户手动获取优惠码
 */
export const FreeSpinsHelpCard = () => {
  const { t } = useTranslation();
  const { data: applyEntry } = useFreeSpinApplyEntry();
  const { navigateCallback } = useNavigateGuard();

  const openModal = useBoundStore((state) => state.openModal);

  const canApply = applyEntry?.show === 1;
  const nextApplyAt = applyEntry?.next_apply_at ?? 0;
  const inCooldown = !canApply && nextApplyAt > 0 && nextApplyAt > Math.floor(Date.now() / 1000);

  if (inCooldown || canApply) return null;

  return (
    <div className="relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden">
      <div className={"flex items-center gap-4 justify-between"}>
        <div className="flex items-center gap-2">
          <img
            src="/images/free_spins/free-spins.png"
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain"
          />
          <h2 className={"text-base font-bold uppercase"}>
            {t("casino:freeSpins")}
          </h2>
          {/* 活动信息提示 */}
          <Info
            className=""
            onClick={(e) => {
              e.stopPropagation();
              openModal("OPEN_FREE_SPINS_HELP_MODAL");
            }} />
        </div>

        {/* 活动入口链接 */}
        <button
          className="btn btn-primary btn-sm text-sm"
          onClick={() => navigateCallback(() => {
            openModal("OPEN_FREE_SPINS_HELP_MODAL");
          }, true)}>
          {t("bonus:go")}
        </button>
      </div>
    </div>
  );
};

/**
 * Guard：负责判断是否显示申请入口，条件满足才渲染 FreeSpinsApplyCard。
 */
export const FreeSpinsApply = ({ loading }: { loading: boolean }) => {
  const { data: applyEntry } = useFreeSpinApplyEntry();
  const canApply = applyEntry?.show === 1;
  const nextApplyAt = applyEntry?.next_apply_at ?? 0;
  const inCooldown = !canApply && nextApplyAt > 0 && nextApplyAt > Math.floor(Date.now() / 1000);

  if (loading || (!inCooldown && !canApply)) return null;

  return <FreeSpinsApplyCard inCooldown={inCooldown} nextApplyAt={nextApplyAt} />;
};

/**
 * Free Spins 申请入口卡片（/main/bonus）。
 * - show===1：正常申请，Apply 按钮可点
 * - inCooldown===true：冷却期内，右上角显示 next_apply_at 倒计时，Apply 按钮置灰
 * 点 Apply → applyFreeSpin → 跳 /casino，常驻 FreeSpinContainerV2 接手弹领取弹窗。
 */
const FreeSpinsApplyCard = ({ inCooldown, nextApplyAt }: { inCooldown: boolean; nextApplyAt: number }) => {
  // const navigate = useAppNavigate();

  const { t } = useTranslation();
  const { navigateCallback } = useNavigateGuard();

  const applyMutation = useApplyFreeSpin();
  const queryClient = useQueryClient();
  const openModal = useBoundStore((state) => state.openModal);

  const handle = () => {
    if (applyMutation.isPending) return;
    applyMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res?.code === 0) {
          // 跳首页，常驻 FreeSpinContainerV2 接手弹领取弹窗
          // （参考 src/components/modal/GetPromoCodeModal.tsx）
          // void navigate({ to: "/casino" });
        } else {
          toast.error(t("bonus:freeSpinsApply.failed"));
        }
      },
      onError: () => {
        toast.error(t("bonus:freeSpinsApply.failed"));
      }
    });
  };

  return (
    <div className="relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden">
      {inCooldown && nextApplyAt > 0 && (
        <div className="absolute top-0 right-0 w-full h-4 flex items-center justify-end">
          <div
            className={"flex items-center gap-1 absolute top-0 right-0 bg-primary/15 text-primary text-sm leading-none"}>
            <CountdownTimer
            className={"font-normal"}
            expireTime={nextApplyAt}
            onFinished={() => {
              void queryClient.invalidateQueries({ queryKey: FREE_SPIN_APPLY_ENTRY_KEY });
            }}
          />
          </div>
        </div>
      )}
      <div className={"flex items-center gap-4 justify-between"}>
        <div className="flex items-center gap-2">
          <img
            src="/images/free_spins/free-spins.png"
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain"
          />
          <h2 className={"text-base font-bold uppercase"}>
            {t("casino:freeSpins")}
          </h2>
          <Info
            className=""
            onClick={(e) => {
              e.stopPropagation();
              openModal("OPEN_FREE_SPINS_HELP_MODAL");
            }} />
        </div>
        <ConfirmBox
          disabled={inCooldown}
          loading={applyMutation.isPending}
          className="btn btn-primary btn-sm text-sm w-auto"
          onClick={() => navigateCallback(() => {
            handle();
          }, true)}>
          {t("common:common.apply")}
        </ConfirmBox>
      </div>
    </div>
  );
};
