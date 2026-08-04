import { useBonusSwitch, useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { useTranslation } from "../../lib/i18n/react-i18next";

export const InnerReferralBuddyBalls = () => {
  const { t } = useTranslation(["buddyBalls", "bonus"]);

  const { switchData } = useBonusSwitch();
  const { data: buddy } = useUserBuddyBallsHome();

  const buddyBallEnabled = switchData?.bonus_switch?.buddy_balls !== 0;

  if (!buddyBallEnabled) return null;

  const balls = Number(buddy?.data?.referral_buddy_balls?.balls_earned ?? 0);

  return (
    <div className="p-4 rounded-lg bg-base-200 flex justify-between">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold text-base-content">
            {t("buddyBalls:referralBuddyBalls")}
          </h3>
          <h1 className="flex items-center text-primary text-2xl font-bold">
            <img src="/images/game_buddy_balls/ball.png" alt="" className="h-5 w-5 shrink-0" />
            <span className={"font-normal text-sm"}>x</span>
            {balls}
          </h1>
        </div>
      </div>
    </div>
  );
};