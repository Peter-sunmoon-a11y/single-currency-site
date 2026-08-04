import { useTranslation } from "@/lib/i18n/react-i18next";
import { ReferralLiveGlobalCommissions } from "./ReferralLiveGlobalCommissions";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";
import { ReferralGuard } from "@/sections/referral/referral-guard.tsx";

export const ReferralGlobal = () => {
  const { t } = useTranslation('referral');

  return (
    <ReferralGuard>
      {(referral_enable: boolean) => (
        <div className="p-4 flex flex-col gap-4">
          {/* 公共头部 */}
          <ReferralHeroSection referralEnable={referral_enable} />

          <h3 className="text-base font-bold">{t("referral:liveGlobalCommissions")}</h3>

          {/* Live Global Commissions 动画表格 */}
          <ReferralLiveGlobalCommissions />
        </div>
      )}
    </ReferralGuard>
  );
};
