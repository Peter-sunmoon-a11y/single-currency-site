import { useTranslation } from "@/lib/i18n/react-i18next";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBoundStore } from "@/store";
import clsx from "clsx";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useBonusSwitch } from "@/hooks/api/useAuth.ts";

export const LuckySpinCard = () => {
  const { switchData } = useBonusSwitch();

  const luckySpinEnabled = switchData?.bonus_switch?.lucky_spin !== 0;

  if (!luckySpinEnabled) {
    return null;
  }

  return <LuckySpinCardContent />;
};

export function LuckySpinCardContent() {
  const navigate = useAppNavigate();

  const { t } = useTranslation();

  const { navigateCallback } = useNavigateGuard();

  const openModal = useBoundStore((state) => state.openModal);

  return (
    <div className={clsx("relative bg-base-100 rounded-lg p-4 overflow-hidden")}>
      <div className={"flex items-center gap-4 justify-between"}>
        <div className="flex items-center gap-2">
          <img
            src="/images/game_lucky_spin/spins.png"
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain"
          />
          <h2 className={clsx("text-base font-bold uppercase")}>
            {t("luckySpin:fortune")}
          </h2>
          {/* 活动信息提示 */}
          <Info
            onClick={(e) => {
              e.stopPropagation();
              openModal("OPEN_LUCKY_SPIN_MODAL");
            }} />
        </div>

        {/* 活动入口链接 */}
        <button
          className={"btn btn-primary btn-sm text-sm"}
          onClick={() => navigateCallback(() => {
            void navigate({ to: "/lucky-spin" });
          }, true)}>
          {t("bonus:go")}
        </button>
      </div>
    </div>
  );
}