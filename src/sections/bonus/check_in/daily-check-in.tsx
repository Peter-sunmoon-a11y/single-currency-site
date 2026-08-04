import { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const DailyCheckInGuard = ({ children }: { children: ReactNode }) => {
  const { data: buddyBallsData } = useUserBuddyBallsHome();
  const isDisabled = Boolean(buddyBallsData?.data?.daily_check_in_disabled);

  if (isDisabled) {
    return null;
  }

  return <>{children}</>;
};

export function DailyCheckIn() {
  const navigate = useAppNavigate();
  const { t } = useTranslation("buddyBalls");
  const { navigateCallback } = useNavigateGuard();

  return (
    <DailyCheckInGuard>
      <div className="relative bg-base-100 rounded-lg p-4 overflow-hidden">
        <div className={"flex items-center gap-4 justify-between"}>
          <div className="flex items-center gap-2">
            <img
              src="/images/daily_check/daily-check-in.png"
              loading="lazy"
              decoding="async"
              className="w-8 h-8 object-contain"
            />
            <h2 className={"text-base font-bold uppercase"}>
              {t("buddyBalls:daily_check_in")}
            </h2>
          </div>

          {/* 活动入口链接 */}
          <button
            className="btn btn-primary btn-sm text-sm"
            onClick={() => navigateCallback(() => {
              void navigate({ to: "/daily-check" });
            }, true)}>
            {t("bonus:go")}
          </button>
        </div>
      </div>
    </DailyCheckInGuard>
  );
}
