import { ReactNode } from "react";
import { Store } from "@/components/icons/Store.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Info } from "@/sections/bonus/components/Info.tsx";
import clsx from "clsx";
import { useUserBonusWallet } from "@/query/dollars.ts";
import { BonusDollarsState } from "@/sections/dollars/components.tsx";
import { useBoundStore } from "@/store";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const InnerSlogan = () => {
  const navigate = useAppNavigate();
  const { t } = useTranslation("bonusStore");


  return <div className={"mb-2 text-sm font-semibold flex justify-between"}>
    <div className="flex gap-2 items-center">
      <Store className={"w-5 h-5 text-primary"} />
      {t("bonus:bonusStore")}
    </div>
    <span className={"cursor-pointer underline text-base-content/50"}
          onClick={() => void navigate({ to: "/dollars/bonus/history" })}>{t("common:common.history")}</span>
  </div>;
};

/* 进行中：进度条 + 流水数值；已完成：绿色满条 */
export const InnerProgress = ({ isCompleted }: {
  isCompleted: boolean;
}) => {
  const { t } = useTranslation("bonusStore");
  return (
    <div className="absolute top-0 right-0 w-full h-4 flex items-center justify-end">
      {!isCompleted ? (
        <div
          className="flex items-center gap-1 absolute top-0 right-0 bg-primary/15 text-primary text-[12px] px-1 py-0.5 leading-none">
          {t("bonusStore:wageringProgress")}<span className={"loading loading-bars w-2.5 h-2.5"} />
        </div>
      ) : (
        <div
          className="absolute top-0 right-0 bg-success/15 text-success text-[11px] px-1 py-0.5 leading-none">
          {t("bonusStore:wagerCompleted")}
        </div>
      )}
    </div>
  );
};

export const SlotsBonusGuard = ({ children }: { children: ReactNode }) => {
  const { data: baseConfig } = useBaseConfig();
  const slot_bonus_wallet_on = baseConfig?.data?.bonus_switch?.slot_bonus_wallet !== 0;

  if (!slot_bonus_wallet_on) {
    return null;
  }

  return <>{children}</>;
};

export const SlotsBonusCard = () => {
  const navigate = useAppNavigate();
  const openModal = useBoundStore(state => state.openModal);

  const { t } = useTranslation("bonusStore");

  const { navigateCallback } = useNavigateGuard();

  const { data: bonusWallet } = useUserBonusWallet();

  const is_pending_collection = bonusWallet?.data?.status === BonusDollarsState.pending_collection;
  const goToDetails = () => navigateCallback(() => {
    void navigate({ to: "/dollars/bonus" });
  }, true);

  return (
    <SlotsBonusGuard>
      <div
        className={clsx("relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden cursor-pointer")}
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
        <div className={"flex items-center gap-4 justify-between"}>
          <div className="flex items-center gap-2">
            <img
              src="/images/bonus_store/bonus-store.png"
              loading="lazy"
              decoding="async"
              className="w-8 h-8 object-contain"
            />
            <h2 className={clsx("text-base font-bold uppercase")}>
              {t("bonus:slotBonus")}
            </h2>
            {/* 活动信息提示 */}
            <Info
              onClick={(e) => {
                e.stopPropagation();
                openModal("OPEN_BONUS_STORE_MODAL");
              }} />
          </div>

          {/* 活动入口链接 */}
          <button
            className={"btn btn-primary btn-sm text-sm"}
            onClick={(e) => {
              e.stopPropagation();
              goToDetails();
            }}>
            {is_pending_collection
              ? t("bonus:claim")
              : t("bonus:go")}
          </button>
        </div>

        {/* 进度条：有活动数据时展示 */}
        {bonusWallet?.data && <InnerProgress isCompleted={is_pending_collection} />}
      </div>
    </SlotsBonusGuard>
  );
};
