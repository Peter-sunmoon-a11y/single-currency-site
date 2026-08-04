import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { normalizeBetHistoryResponse, useUserBetHistory } from "@/query/bet-history";
import { BetHistoryTable } from "@/sections/profile/bet-history/BetHistoryTable";
import type { BetHistoryResponse } from "@/types/bet-history";
import type { InfiniteData } from "@tanstack/react-query";
import { ChartNoAxesColumn } from "lucide-react";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useEffect, useMemo, useState } from "react";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function PublicStats({
                       totalWins,
                       totalBets,
                       totalWagered,
                       t
                     }: {
  totalWins: string;
  totalBets: string;
  totalWagered: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg bg-base-200">
      <div className="flex flex-col items-center justify-center rounded-md bg-base-300 p-2">
        <p className="text-xs text-base-content/50">{t("common:common.totalWins")}</p>
        <p className="text-base font-bold">{totalWins}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-md bg-base-300 p-2">
        <p className="text-xs text-base-content/50">{t("common:common.totalBets")}</p>
        <p className="text-base font-bold">{totalBets}</p>
      </div>
      <div className="col-span-2 flex flex-col items-center justify-center rounded-md bg-base-300 p-2">
        <p className="text-xs text-base-content/50">{t("common:common.totalWagered")}</p>
        <p className="text-base font-bold">{totalWagered}</p>
      </div>
    </div>
  );
}

function SectionCard({
                       title,
                       icon,
                       children
                     }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-base-200 p-2 pt-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base-content/70">{icon}</span>
        <h3 className="text-sm font-bold text-base-content">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function RouteComponent() {
  const { t } = useTranslation(["common", "profile"]);
  const { status } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const [desiredPage, setDesiredPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const queryParams = useMemo(
    () => ({
      time_range: 90
    }),
    []
  );
  const recentBetHistoryQuery = useUserBetHistory(queryParams);

  const betHistoryPages = useMemo(
    () => (recentBetHistoryQuery.data as InfiniteData<BetHistoryResponse> | undefined)?.pages ?? [],
    [recentBetHistoryQuery.data]
  );

  const normalizedPages = useMemo(
    () => betHistoryPages.map((page) => normalizeBetHistoryResponse(page)),
    [betHistoryPages]
  );

  const firstPage = normalizedPages[0];
  const firstPagination = firstPage?.pagination ?? null;
  const derivedTotalPages =
    firstPagination?.last_page ??
    (firstPagination?.total && firstPagination?.page_size ? Math.ceil(firstPagination.total / firstPagination.page_size) : undefined);
  const totalPagesEstimate =
    derivedTotalPages ??
    (recentBetHistoryQuery.hasNextPage ? normalizedPages.length + 1 : Math.max(normalizedPages.length, 1));
  const safeTotalPages = Math.max(totalPagesEstimate, 1);
  const recentBetRecords = normalizedPages[currentPage - 1]?.records ?? [];
  const isInitialLoading = recentBetHistoryQuery.isLoading && betHistoryPages.length === 0;

  useEffect(() => {
    const loadedPages = normalizedPages.length;
    if (desiredPage <= loadedPages && desiredPage !== currentPage) {
      setCurrentPage(desiredPage);
      return;
    }

    if (desiredPage > loadedPages) {
      if (recentBetHistoryQuery.hasNextPage && !recentBetHistoryQuery.isFetchingNextPage) {
        void recentBetHistoryQuery.fetchNextPage();
      } else if (!recentBetHistoryQuery.hasNextPage && loadedPages > 0) {
        setDesiredPage((prev) => (prev !== loadedPages ? loadedPages : prev));
      }
    }
  }, [
    currentPage,
    desiredPage,
    normalizedPages.length,
    recentBetHistoryQuery.fetchNextPage,
    recentBetHistoryQuery.hasNextPage,
    recentBetHistoryQuery.isFetchingNextPage
  ]);

  const formattedWagered = formatWithConversion(status?.bet_in_ori || 0, "USDT", {
    showSymbol: true,
    showCode: false
  }).formatted;

  return (
    <div className="flex min-h-dvh flex-col gap-4 bg-base-300 p-4">
      <SectionCard title="Stats" icon={<ChartNoAxesColumn className="h-4 w-4" />}>
        <PublicStats
          totalWins={toNumber(status?.bet_win_times).toLocaleString()}
          totalBets={toNumber(status?.bet_times).toLocaleString()}
          totalWagered={formattedWagered}
          t={t}
        />
      </SectionCard>

      <div className={"flex flex-col gap-4"}>
        <BetHistoryTable
          records={recentBetRecords}
          isLoading={isInitialLoading}
          isFetchingMore={recentBetHistoryQuery.isFetchingNextPage}
          showBetId={false}
        />

        <Paginate
          className={"mt-0"}
          jumping={false}
          page={currentPage}
          limit={firstPagination?.page_size ?? 10}
          disabled={recentBetHistoryQuery.isFetchingNextPage}
          pageCount={safeTotalPages}
          onJumpPage={(page) => {
            if (page < 1 || page > safeTotalPages) return;
            setDesiredPage(page);
          }}
          onPaginate={(page) => {
            if (page < 1 || page > safeTotalPages) return;
            setDesiredPage(page);
          }}
        />
      </div>
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
