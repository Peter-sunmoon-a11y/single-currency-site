import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useVipConfig } from "@/hooks/api/usePublic";
import { useMemo } from "react";

import { useTranslation } from "@/lib/i18n/react-i18next";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { InnerReferralShareLink } from "@/sections/referral/referral-summary-card/InnerComponents.tsx";

export const ReferralRewardsSchedule = () => {
  const { t } = useTranslation(["referral", "bonus", "common"]);
  const { data: vipConfigData } = useVipConfig();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const filteredVipConfig = useMemo(() => {
    if (!vipConfigData?.data) return [];
    return (vipConfigData.data as any[]).filter((item) => Number(item.referral) !== 0);
  }, [vipConfigData]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 rounded-t-field">
        <h3 className="text-base font-bold">{t("referral:referralRewardsAreEasy")}</h3>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 bg-base-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <img
                src="/images/referral_pages/crew.png"
                alt="Gather your crew"
                className="w-20 h-20 flex-shrink-0"
              />
              <div className="flex flex-col gap-2 min-w-0">
                <h3 className="text-base font-bold">
                  <span>{t("referral:gatherYour")} </span>
                  <span className="text-primary">{t("referral:crew")}</span>
                </h3>
                <TextBaseContent text={t("referral:gatherYourCrewDescription")} />
              </div>
            </div>
            <InnerReferralShareLink className={"!p-0"} />
          </div>

          <div className="flex items-center gap-2 bg-base-200 rounded-lg p-4">
            <img
              src="/images/referral_pages/vault.png"
              alt="Gather your crew"
              className="w-20 h-20 flex-shrink-0"
            />
            <div className="flex flex-col gap-2 min-w-0">
              <h3 className="text-base font-bold">
                <span>{t("referral:crackThe")} </span>
                <span className="text-primary">{t("referral:vault")}</span>
              </h3>
              <TextBaseContent text={t("referral:crackTheVaultDescription")} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {/* 表头 */}
        <div className="px-2 grid grid-cols-3 text-base-content/50 text-xs uppercase mb-2">
          <div className="text-start">{t("referral:friendLevel")}</div>
          <div className="text-center">{t("referral:totalExp")}</div>
          <div className="text-end">{t("referral:unlockedAmount")}</div>
        </div>

        <div className="relative">
          <div className="space-y-0.5">
            {filteredVipConfig.map((item: any) => (
              <div
                key={item.vip}
                className="grid grid-cols-3 items-center rounded-sm bg-base-200 px-2 py-1"
              >
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-base-content/70">
                      {t("referral:vip")} {item.vip}
                    </span>
                </div>
                <div className="text-center text-xs text-base-content/50" dir="ltr">
                  {Math.floor(Number(item.xp)).toLocaleString()}
                </div>
                <div className="text-end text-xs font-bold text-primary" dir="ltr">
                  {formatWithConversion(item.referral, "USD", {
                    showSymbol: false,
                    showCode: true,
                    minimizeDecimals: true
                  }).formatted}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
