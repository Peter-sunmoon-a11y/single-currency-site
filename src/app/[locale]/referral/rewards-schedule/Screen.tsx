import { ReferralGuard } from "@/sections/referral/referral-guard.tsx";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";
import { ReferralRewardsSchedule } from "@/sections/referral/referral-rewards-schedule.tsx";

export const beforeLoad = undefined;

const ScreenComponent = () => (
    <ReferralGuard>
      {(referral_enable: boolean) => (
        <div className="p-4 flex flex-col gap-4">
          <ReferralHeroSection referralEnable={referral_enable} />
          <ReferralRewardsSchedule />
        </div>
      )}
    </ReferralGuard>
  );

export default ScreenComponent;
