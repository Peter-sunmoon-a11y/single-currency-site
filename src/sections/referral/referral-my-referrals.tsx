import { useBoundStore } from "@/store";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { getReferralList } from "@/services/auth/referral";
import type { ReferralListResponse } from "@/types/referral";
import { cn } from "@/utils/cn";
import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useRef, useState } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { ReferralGuard } from "@/sections/referral/referral-guard.tsx";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";

const ITEMS_PER_PAGE = 10;

export const ReferralMyReferrals = () => {
  const { t } = useTranslation(["referral", "transaction"]);
  const user = useBoundStore((state) => state.user);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const scrollParent = document.getElementById("main-scroll");

  const typeOptions = [
    { id: "all", label: t("transaction:filters.all", "All"), value: "All" },
    { id: "direct", label: t("referral:direct"), value: "direct" },
    { id: "indirect", label: t("referral:indirect"), value: "indirect" }
  ];

  const periodOptions = [
    { id: "all", label: t("transaction:filters.all"), value: "All" },
    { id: "90d", label: t("transaction:filters.past90Days"), value: "Past 90 Days" },
    { id: "60d", label: t("transaction:filters.past60Days"), value: "Past 60 Days" },
    { id: "30d", label: t("transaction:filters.past30Days"), value: "Past 30 Days" },
    { id: "7d", label: t("transaction:filters.past7Days"), value: "Past 7 Days" },
    { id: "24h", label: t("transaction:filters.past24Hours"), value: "Past 24 Hours" }
  ];

  const [selectedPeriod, setPeriod] = useState(periodOptions[0].value);
  const [selectedType, setType] = useState(typeOptions[0].value);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery<ReferralListResponse>({
    queryKey: ["referralList", user?.id, selectedPeriod, selectedType],
    queryFn: ({ pageParam }) =>
      getReferralList({
        limit: ITEMS_PER_PAGE,
        last_id: (pageParam as string) || "",
        period: selectedPeriod as any,
        type: selectedType as any
      }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => {
      if ((lastPage.data?.length ?? 0) < ITEMS_PER_PAGE) return undefined;
      return lastPage.data[lastPage.data.length - 1]?.id ?? undefined;
    },
    enabled: !!user,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const allItems = data?.pages.flatMap((p) => p.data ?? []) ?? [];

  // 与 ExploreGameGrid 保持一致：ref 持有最新值，observer 只创建一次
  const hasNextPageRef = useRef(hasNextPage);
  const isFetchingNextPageRef = useRef(isFetchingNextPage);
  const fetchNextPageRef = useRef(fetchNextPage);
  hasNextPageRef.current = hasNextPage;
  isFetchingNextPageRef.current = isFetchingNextPage;
  fetchNextPageRef.current = fetchNextPage;

  const handleEndReached = useCallback(() => {
    if (hasNextPageRef.current && !isFetchingNextPageRef.current) {
      fetchNextPageRef.current();
    }
  }, []);

  return (
    <ReferralGuard>
      {(referral_enable: boolean) => (
        <div className="p-4 flex flex-col gap-4">
          <ReferralHeroSection referralEnable={referral_enable} />

          <div className="flex flex-col rounded-field overflow-hidden gap-4">
            <h3 className="text-base font-bold">{t("referral:myReferrals")}</h3>

            <FormBox label={t("referral:registration")}>
              <SelectDropdown
                title={t("referral:registration")}
                options={typeOptions}
                value={selectedType}
                onChange={(value) => setType(String(value) as "direct" | "indirect")}
              />
            </FormBox>

            <FormBox label={t("transaction:filters.period")}>
              <SelectDropdown
                title={t("transaction:filters.period")}
                options={periodOptions}
                value={selectedPeriod}
                onChange={(value) => setPeriod(String(value))}
              />
            </FormBox>
          </div>

          {/* 列表 */}
          <div className="relative rounded-lg bg-base-200 p-2 min-h-[130px]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="loading loading-bars loading-sm text-primary" />
              </div>
            ) : allItems.length === 0 ? (
              <NothingFound />
            ) : (<VirtuosoGrid
              customScrollParent={scrollParent ?? undefined}
              data={allItems}
              endReached={handleEndReached}
              overscan={900}
              listClassName="flex flex-col gap-1"
              itemClassName="w-full"
              itemContent={(_, item) => (
                <div className="rounded-lg bg-base-300 px-2 py-2 flex flex-col gap-1">
                  {/* 用户名 + VIP */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-base-content truncate">
                      {item.down_line_username}
                    </div>
                    <span className="text-sm text-base-content/70 shrink-0">VIP {item.vip_level}</span>
                  </div>

                  {/* 分隔 */}
                  <div className="border-t border-base-content/10" />

                  {/* 推荐码 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/50">{t("referral:code")}</span>
                    <span className="text-sm font-bold text-base-content/70" dir="ltr">{item.referral_code}</span>
                  </div>

                  {/* 注册类型 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/50">{t("referral:referralType")}</span>
                    <span className={cn(
                      "text-sm font-semibold italic",
                      item.refer_type === "direct" ? "text-primary" : "text-info"
                    )}>
                          {item.refer_type === "direct" ? t("referral:direct") : t("referral:indirect")}
                        </span>
                  </div>

                  {/* 注册日期 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/50">{t("referral:registrationDate")}</span>
                    <span className="text-sm text-base-content/70" dir="ltr">
                          {dayjs(item.regitration_date * 1000).format("YYYY/MM/DD")}
                        </span>
                  </div>

                  {/* 奖励 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/50">{t("referral:amount")}</span>
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
              )}
              components={{
                Footer: () => (
                  <div className="flex items-center justify-center">
                    {isFetchingNextPage && <span className="loading loading-bars loading-sm text-primary" />}
                  </div>
                )
              }}
            />)}
          </div>
        </div>
      )}
    </ReferralGuard>
  );
};
