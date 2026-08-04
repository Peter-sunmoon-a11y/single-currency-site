import { useBoundStore } from "@/store";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useReferralRewards } from "@/hooks/useReferralRewards";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";

type Props = { referralEnable: boolean, onNavigateToMyReferrals?: () => void };

export const ReferralHeroSection = ({ referralEnable }: Props) => {
  const { t } = useTranslation(["referral", "common", "casino"]);
  const isAuthenticated = useBoundStore((state) => !!state.user);
  const { formattedTotalRewards, isLoading } = useReferralRewards();

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  return (
    <div className="">
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={<>
          <div className="flex flex-col justify-center gap-1">
            {(isAuthenticated && referralEnable) && (
              <>
                <div className="w-full">
                  <p className="whitespace-pre-line">{t("referral:lifetimeReferralRewards")}</p>
                </div>
                <p className="text-3xl text-primary">
                  {isLoading
                    ? "0.00"
                    : formattedTotalRewards.formatted}
                </p>
              </>
            )}
            {(!referralEnable) && (
              <p>
                <Trans
                  i18nKey="referral:referral_program_disabled"
                  components={[<span className={"text-primary"} />]}
                />
              </p>
            )}
            {(!isAuthenticated) && (
              <>
                <h1 className="">
                  {t("common:common.referral")}{" "}{t("common:common.bonus")}
                  <br />
                  <span className="text-primary">
                    {formatWithConversion(1200, "USD", {
                      showSymbol: true,
                      showCode: false
                    }).formatted}</span>
                  <br />
                  <span className="text-primary">{t("casino:upTo")} 50%</span>
                  <br />
                  <span className="text-primary">{t("referral:commission")}</span>
                </h1>
              </>
            )}
          </div>
        </>}
        // 根据设计稿自行修改图片
        picture="/images/referral_pages/banner.png"
      />
    </div>
  );
};
