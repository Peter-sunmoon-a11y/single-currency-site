import { useBoundStore } from "@/store";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { getReferralRewardsList } from "@/services/auth/referral";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { ReferralGuard } from "@/sections/referral/referral-guard.tsx";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";

const ITEMS_PER_PAGE = 20;

export const ReferralRewards = () => {
  const { t } = useTranslation(["referral", "transaction"]);
  const user = useBoundStore((state) => state.user);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [currentPage, setCurrentPage] = useState(1);
  const openModal = useBoundStore((state) => state.openModal);

  const { data, isFetching } = useQuery<any>({
    queryKey: ["referralRewardsList", currentPage, user?.id],
    queryFn: () =>
      getReferralRewardsList({
        limit: ITEMS_PER_PAGE,
        page: currentPage
      }),
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData: any) => previousData
  });

  const referralRewardsList = data?.data?.data || [];

  return (
    <ReferralGuard>
      {(referral_enable: boolean) => (
        <div className="p-4 flex flex-col gap-4">
          <ReferralHeroSection referralEnable={referral_enable} />

          <h3 className="text-base font-bold">{t("referral:myReferralRewards")}</h3>

          {/* 列表 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="px-2 grid grid-cols-2 text-base-content/50 text-xs uppercase">
              <div className="text-start">{t("referral:user")}</div>
              <div className="text-end">{t("referral:amount")}</div>
            </div>

            <div className="relative rounded-lg bg-base-200 p-2 min-h-[216px]">
              <div className="space-y-1">
                {referralRewardsList.map((item: any) => (
                  <div
                    key={`${item.id}-${item.created_at}`}
                    className="flex items-center gap-2 rounded-lg bg-base-300 p-2 cursor-pointer hover:bg-base-300/70 transition-colors"
                    onClick={() => openModal("OPEN_REFERRAL_REWARDS_DETAILS_MODAL", item)}
                  >
                    {/* 左：用户名 + VIP */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-base-content truncate">
                        {item.downLineUser.nickname}
                      </div>
                      <div className="text-xs text-base-content/40 truncate" dir="ltr">
                        {item.referral_code}
                      </div>
                    </div>

                    {/* 右：奖励 */}
                    <div className="text-success font-bold text-sm shrink-0" dir="ltr">
                      +{formatWithConversion(item.reward, "USD", {
                      showSymbol: false,
                      showCode: true,
                      minimizeDecimals: true,
                      displayDecimal: 4
                    }).formatted}
                    </div>
                  </div>
                ))}
              </div>

              {isFetching && <DataLoading />}
              {!isFetching && referralRewardsList.length === 0 && <NothingFound />}
            </div>
          </div>

          <Paginate
            page={currentPage}
            limit={ITEMS_PER_PAGE}
            pageCount={Math.ceil((data?.data?.total || 0) / ITEMS_PER_PAGE)}
            disabled={isFetching}
            onPaginate={setCurrentPage}
            onJumpPage={setCurrentPage}
          />

        </div>
      )}
    </ReferralGuard>
  );
};
