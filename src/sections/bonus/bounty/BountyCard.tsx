import { useTranslation } from "@/lib/i18n/react-i18next";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useBoundStore } from "@/store";
import { useBonusSwitch } from "@/hooks/api/useAuth.ts";
import { useBountyStatus } from "@/query/bounty.ts";

export const BountyCard = () => {
  const { switchData } = useBonusSwitch();

  const { data: bountyStatus } = useBountyStatus();

  const bountyBonusEnabled = switchData?.bonus_switch?.bounty !== 0;

  if (!bountyBonusEnabled || !bountyStatus?.data?.branch_enabled) {
    return null;
  }

  return <BountyCardContent />;
};

export function BountyCardContent() {
  const navigate = useAppNavigate();

  const { t } = useTranslation(["bonus", "bounty"]);
  const { navigateCallback } = useNavigateGuard();

  const openModal = useBoundStore((state) => state.openModal);

  return (
    <div className="relative bg-base-100 rounded-lg p-4 overflow-hidden">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/images/bonus_bounty/bounty-card.png"
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain"
            alt=""
          />
          <h2 className="text-base font-bold uppercase">
            {t("bounty:bounty")}
          </h2>
          {/* 活动信息提示 */}
          <Info
            onClick={(e) => {
              e.stopPropagation();
              openModal("OPEN_BOUNTY_MODAL");
            }}
          />
        </div>

        {/* 活动入口链接 */}
        <button
          className="btn btn-primary btn-sm text-sm"
          onClick={() => navigateCallback(() => {
            void navigate({ to: "/bounty/active" });
          }, true)}
        >
          {t("bonus:go")}
        </button>
      </div>
    </div>
  );
}
