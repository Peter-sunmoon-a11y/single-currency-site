import { useTranslation } from "@/lib/i18n/react-i18next";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBoundStore } from "@/store";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useBonusSwitch } from "@/hooks/api/useAuth.ts";

export const BuddyBallCard = () => {
  const { switchData } = useBonusSwitch();

  const buddyBallEnabled = switchData?.bonus_switch?.buddy_balls !== 0;

  if (!buddyBallEnabled) {
    return null;
  }

  return <BuddyBallCardContent />;
};

export function BuddyBallCardContent() {
  const navigate = useAppNavigate();

  const { t } = useTranslation(['buddyBalls']);

  const { navigateCallback } = useNavigateGuard();

  const openModal = useBoundStore((state) => state.openModal);

  return (
    <div className="relative bg-base-100 rounded-lg p-4 overflow-hidden">
      <div className={"flex items-center gap-4 justify-between"}>
        <div className="flex items-center gap-2">
          <img
            src="/images/game_buddy_balls/ball-pool.png"
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain"
          />
          <h2 className={"text-base font-bold uppercase"}>
            {t("buddyBalls:buddyBalls")}
          </h2>
          {/* 活动信息提示 */}
          <Info
            className=""
            onClick={(e) => {
              e.stopPropagation();
              openModal("OPEN_BUDDY_BALLS_MODAL");
            }} />
        </div>

        {/* 活动入口链接 */}
        <button
          className="btn btn-primary btn-sm text-sm"
          onClick={() => navigateCallback(() => {
            void navigate({ to: "/buddy-balls" });
          }, true)}>
          {t("bonus:go")}
        </button>
      </div>
    </div>
  );
}