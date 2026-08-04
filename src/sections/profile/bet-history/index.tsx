import { normalizeBetHistoryResponse, useSportsBetHistory } from "@/query/bet-history";
import { useUserBalance } from "@/hooks/api/useAuth";
import type { BetHistoryResponse } from "@/types/bet-history";
import type { InfiniteData } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BetHistoryFilters } from "./BetHistoryFilters";
import { BetHistoryTable } from "./BetHistoryTable";
import { SportsBetHistoryTable } from "./SportsBetHistoryTable";
import type { BetHistoryFiltersState } from "./types";
import { bonus_currencies } from "@/sections/explore";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { CASINO_EXCLUDED_ASSETS } from "@/sections/profile/bet-history/utils.ts";

const DEFAULT_FILTERS: BetHistoryFiltersState = {
  game: "all",
  asset: "all",
  period: "Past 7 Days"
};

const PERIOD_TO_RANGE: Record<BetHistoryFiltersState["period"], number> = {
  "Past 24 Hours": 1,
  "Past 7 Days": 7,
  "Past 30 Days": 30
};

const extractBalanceCurrencies = (balanceData: unknown): string[] => {
  type BalanceItem = { currency?: string | null };
  const balances = (balanceData as BalanceItem[] | undefined) ?? [];
  if (!Array.isArray(balances)) return [];

  return balances
    .map((item) => (item?.currency ? String(item.currency) : undefined))
    .filter((currency): currency is string => typeof currency === "string" && currency.length > 0);
};

export function CasinoBetHistorySection() {
  const { data: balanceData } = useUserBalance();
  const [filters, setFilters] = useState<BetHistoryFiltersState>(DEFAULT_FILTERS);
  const [desiredPage, setDesiredPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      game_type: filters.game === "all" ? undefined : filters.game,
      asset: filters.asset === "all" ? undefined : filters.asset,
      time_range: PERIOD_TO_RANGE[filters.period] ?? PERIOD_TO_RANGE["Past 7 Days"]
    }),
    [filters]
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useSportsBetHistory(queryParams);

  const betHistoryPages = useMemo(() => (data as InfiniteData<BetHistoryResponse> | undefined)?.pages ?? [], [data]);

  const normalizedPages = useMemo(() => betHistoryPages.map((page) => normalizeBetHistoryResponse(page)), [betHistoryPages]);

  const firstPage = normalizedPages[0];
  const firstPagination = firstPage?.pagination ?? null;

  const derivedTotalPages =
    firstPagination?.last_page ??
    (firstPagination?.total && firstPagination?.page_size ? Math.ceil(firstPagination.total / firstPagination.page_size) : undefined);

  const totalPagesEstimate = derivedTotalPages ?? (hasNextPage ? normalizedPages.length + 1 : Math.max(normalizedPages.length, 1));
  const safeTotalPages = Math.max(totalPagesEstimate, 1);

  const recordsForPage = normalizedPages[currentPage - 1]?.records ?? [];
  const filterGroup = firstPage?.filters;

  const balanceCurrencies = useMemo(() => extractBalanceCurrencies(balanceData), [balanceData]);

  const combinedAssets = useMemo(() => {
    const unique = new Set<string>();
    filterGroup?.assets?.forEach((asset) => {
      if (typeof asset === "string" && asset.length > 0) {
        unique.add(asset);
      }
    });
    balanceCurrencies.forEach((asset) => {
      if (typeof asset === "string" && asset.length > 0) {
        unique.add(asset);
      }
    });
    return Array.from(unique);
  }, [filterGroup?.assets, balanceCurrencies]);

  const isInitialLoading = isLoading && betHistoryPages.length === 0;

  useEffect(() => {
    setDesiredPage(1);
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const loadedPages = normalizedPages.length;
    if (desiredPage <= loadedPages && desiredPage !== currentPage) {
      setCurrentPage(desiredPage);
      return;
    }

    if (desiredPage > loadedPages) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      } else if (!hasNextPage && loadedPages > 0) {
        setDesiredPage((prev) => (prev !== loadedPages ? loadedPages : prev));
      }
    }
  }, [desiredPage, normalizedPages.length, hasNextPage, isFetchingNextPage, fetchNextPage, currentPage]);

  const handleFiltersChange = (nextFilters: BetHistoryFiltersState) => {
    setFilters(nextFilters);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > safeTotalPages) return;
    setDesiredPage(page);
  };

  return (
    <>
      <BetHistoryFilters
        filters={filters}
        onChange={handleFiltersChange}
        filterGroup={filterGroup}
        availableAssets={combinedAssets}
        isDisabled={isInitialLoading && !normalizedPages.length}
        excluded_assets={CASINO_EXCLUDED_ASSETS}
        showGameFilter
      />

      <BetHistoryTable
        records={recordsForPage}
        isLoading={isInitialLoading}
        isFetchingMore={isFetchingNextPage}
      />

      <Paginate
        jumping={false}
        page={currentPage}
        limit={firstPagination?.page_size ?? 10}
        disabled={isFetchingNextPage}
        pageCount={safeTotalPages}
        onJumpPage={handlePageChange}
        onPaginate={handlePageChange}
      />
    </>
  );
}

export function SportsBetHistorySection() {
  const { data: balanceData } = useUserBalance();
  const [filters, setFilters] = useState<BetHistoryFiltersState>(DEFAULT_FILTERS);
  const [desiredPage, setDesiredPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      game_type: "betby",
      asset: filters.asset === "all" ? undefined : filters.asset,
      time_range: PERIOD_TO_RANGE[filters.period] ?? PERIOD_TO_RANGE["Past 7 Days"]
    }),
    [filters]
  );

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useSportsBetHistory(queryParams);

  const betHistoryPages = useMemo(() => (data as InfiniteData<BetHistoryResponse> | undefined)?.pages ?? [], [data]);

  const normalizedPages = useMemo(() => betHistoryPages.map((page) => normalizeBetHistoryResponse(page)), [betHistoryPages]);

  const firstPage = normalizedPages[0];
  const firstPagination = firstPage?.pagination ?? null;

  const derivedTotalPages =
    firstPagination?.last_page ??
    (firstPagination?.total && firstPagination?.page_size ? Math.ceil(firstPagination.total / firstPagination.page_size) : undefined);

  const totalPagesEstimate = derivedTotalPages ?? (hasNextPage ? normalizedPages.length + 1 : Math.max(normalizedPages.length, 1));
  const safeTotalPages = Math.max(totalPagesEstimate, 1);

  const recordsForPage = normalizedPages[currentPage - 1]?.records ?? [];
  const filterGroup = firstPage?.filters;

  const balanceCurrencies = useMemo(() => extractBalanceCurrencies(balanceData), [balanceData]);

  const combinedAssets = useMemo(() => {
    const unique = new Set<string>();
    filterGroup?.assets?.forEach((asset) => {
      // TODO: 体育的下注资产要排除掉 BONUS 彩金币种
      if (typeof asset === "string" && asset.length > 0 && !bonus_currencies.has(asset)) {
        unique.add(asset);
      }
    });
    balanceCurrencies.forEach((asset) => {
      // TODO: 体育的下注资产要排除掉 BONUS 彩金币种
      if (typeof asset === "string" && asset.length > 0 && !bonus_currencies.has(asset)) {
        unique.add(asset);
      }
    });
    return Array.from(unique);
  }, [filterGroup?.assets, balanceCurrencies]);

  const isInitialLoading = isLoading && betHistoryPages.length === 0;

  useEffect(() => {
    setDesiredPage(1);
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const loadedPages = normalizedPages.length;
    if (desiredPage <= loadedPages && desiredPage !== currentPage) {
      setCurrentPage(desiredPage);
      return;
    }

    if (desiredPage > loadedPages) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      } else if (!hasNextPage && loadedPages > 0) {
        setDesiredPage((prev) => (prev !== loadedPages ? loadedPages : prev));
      }
    }
  }, [desiredPage, normalizedPages.length, hasNextPage, isFetchingNextPage, fetchNextPage, currentPage]);

  const handleFiltersChange = (nextFilters: BetHistoryFiltersState) => {
    setFilters(nextFilters);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > safeTotalPages) return;
    setDesiredPage(page);
  };

  return (
    <>
      <BetHistoryFilters
        filters={filters}
        onChange={handleFiltersChange}
        filterGroup={filterGroup}
        availableAssets={combinedAssets}
        isDisabled={isInitialLoading && !normalizedPages.length}
        showGameFilter={false}
      />

      <SportsBetHistoryTable
        records={recordsForPage}
        isLoading={isInitialLoading}
        isFetchingMore={isFetchingNextPage}
      />

      <Paginate
        page={currentPage}
        limit={firstPagination?.page_size ?? 10}
        disabled={isFetchingNextPage}
        pageCount={safeTotalPages}
        onJumpPage={handlePageChange}
        onPaginate={handlePageChange}
      />
    </>
  );
}
