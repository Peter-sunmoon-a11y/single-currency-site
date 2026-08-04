import { useBoundStore } from "@/store";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { getCommissionList } from "@/services/auth/referral";
import type { CommissionListResponse } from "@/types/referral";
import { cn } from "@/utils/cn"; // refer_type color
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Paginate } from "@/sections/tournament/components/Paginate";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { ReferralGuard } from "@/sections/referral/referral-guard.tsx";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";

const ITEMS_PER_PAGE = 10;

export const ReferralMyCommissions = () => {
  const { t } = useTranslation(["referral", "common"]);
  const user = useBoundStore((state) => state.user);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [currentPage, setCurrentPage] = useState(1);
  const openModal = useBoundStore((state) => state.openModal);

  const { data, isFetching } = useQuery<CommissionListResponse>({
    queryKey: ["commissionList", currentPage, user?.id],
    queryFn: () =>
      getCommissionList({
        limit: ITEMS_PER_PAGE,
        page: currentPage,
        up_line: user?.id?.toString()
      }),
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData
  });

  const commissionList = (data as any)?.data || [];
  const totalPages = Math.ceil(((data as any)?.total || 0) / ITEMS_PER_PAGE);

  return (
    <ReferralGuard>
      {(referral_enable: boolean) => (
        <div className="p-4 flex flex-col gap-4">
          <ReferralHeroSection referralEnable={referral_enable} />

          <h3 className="text-base font-bold">{t("referral:myReferralCommissions")}</h3>

          <div className="relative rounded-lg bg-base-200 p-2 min-h-[180px]">
            <div className="space-y-1">
              {commissionList.map((item: any) => (
                <div
                  key={`${item.id}-${item.created_at}`}
                  className="rounded-lg bg-base-300 px-3 py-2.5 flex flex-col gap-1 cursor-pointer hover:bg-base-300/70 transition-colors"
                  onClick={() => openModal("OPEN_REFERRAL_COMMISSIONS_DETAILS_MODAL", item)}
                >
                  {/* 用户名 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-base-content truncate">
                      {item.down_line_username}
                    </span>
                    <span className={cn(
                      "text-sm font-semibold shrink-0 italic",
                      item.refer_type === "direct" ? "text-primary" : "text-info"
                    )}>
                      {item.refer_type === "direct" ? t("referral:direct") : t("referral:indirect")}
                    </span>
                  </div>

                  <div className="border-t border-base-content/10" />

                  {/* 游戏类型 */}
                  {item.game_type_2 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-base-content/50">{t("referral:gameType", "Game Type")}</span>
                      <span className="text-xs text-base-content/70 capitalize">{item.game_type_2}</span>
                    </div>
                  )}

                  {/* 日期 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-base-content/50">{t("referral:date")}</span>
                    <span className="text-xs text-base-content/70" dir="ltr">
                      {dayjs(item.created_at * 1000).format("YYYY/MM/DD")}
                    </span>
                  </div>

                  {/* 佣金 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-base-content/50">{t("referral:amount")}</span>
                    <span className="text-sm font-bold text-success" dir="ltr">
                      +{formatWithConversion(item.reward, "USD", {
                      showSymbol: false,
                      showCode: true,
                      minimizeDecimals: true,
                      displayDecimal: 4
                    }).formatted}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {isFetching && <DataLoading />}
            {!isFetching && commissionList.length === 0 && <NothingFound />}
          </div>

          <Paginate
            page={currentPage}
            limit={ITEMS_PER_PAGE}
            pageCount={totalPages}
            disabled={isFetching}
            onPaginate={setCurrentPage}
            onJumpPage={setCurrentPage}
          />
        </div>
      )}
    </ReferralGuard>
  );
};
