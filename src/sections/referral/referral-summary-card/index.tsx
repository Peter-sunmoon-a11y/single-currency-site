import { useBoundStore } from "@/store";
import { InnerCommissionRewards } from "@/sections/referral/referral-summary-card/InnerCommissionRewards.tsx";
import { InnerReferralRewards } from "@/sections/referral/referral-summary-card/InnerReferralRewards.tsx";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { InnerReferralShareLink } from "@/sections/referral/referral-summary-card/InnerComponents.tsx";

export const ReferralSummaryCard = ({ referralEnable }: { referralEnable: boolean }) => {
  const { t } = useTranslation("referral");

  const isAuthenticated = useBoundStore((state) => !!state.user);

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  return (
    !isAuthenticated
      ? (<div className="p-4 rounded-box bg-base-200 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-base-content">
          {t("referral:assembleYourCrewCashIn")}
        </h2>
        <p className="flex-1 text-sm text-base-content/70">
          <Trans
            i18nKey="referral:assembleYourCrewCashInDescription1"
            values={{
              amount: formatWithConversion(1200, "USD", { showCode: false }).formatted,
              percentage: "50%"
            }}
          />
        </p>
        <p className="flex-1 text-sm text-base-content/70">
          <Trans i18nKey="referral:assembleYourCrewCashInDescription2" />
        </p>
      </div>)
      : <>
        {referralEnable && (<div className={"flex flex-col gap-1"}>
          <InnerCommissionRewards />
          <InnerReferralRewards />
          <InnerReferralShareLink />
        </div>)}
        {!referralEnable && (
          <>
            <div className="p-4 rounded-box bg-base-200 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-base-content">
                {t("referral:programAccessUpdate")}
              </h2>
              <p className="flex-1 text-sm text-base-content/70">
                <Trans
                  i18nKey="referral:referralProgramPrivileges"
                />
              </p>
              <p className="flex-1 text-sm text-base-content/70">
                <Trans
                  i18nKey="referral:referralRewardsPrivileges"
                  components={[<span className={"text-primary"} />]}
                />
              </p>
              <p className="flex-1 text-sm text-base-content/70">
                <Trans i18nKey="referral:understandDisappointing" />
              </p>
            </div>
          </>
        )
        }
      </>
  );
};