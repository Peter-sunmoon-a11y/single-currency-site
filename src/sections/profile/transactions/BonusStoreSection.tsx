import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { TRANSACTION_PAGE_SIZE, useBonusWalletRecords } from "@/query/transactions";
import { useEffect, useMemo, useState } from "react";
import { PeriodFilter } from "./TransactionFilters";
import { BonusStoreList } from "./TransactionList";
import { extractTransactionPayload, getPeriodTimestamp } from "./_utils";

export function BonusStoreSection() {
  const [period, setPeriod] = useState("Past 30 Days");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastCtdMap, setLastCtdMap]   = useState<Record<string, Record<number, number | undefined>>>({});

  const paginationKey        = useMemo(() => getPeriodTimestamp(period)?.toString() ?? "all", [period]);
  const lastCtdForCurrentPage = currentPage > 1 ? (lastCtdMap[paginationKey]?.[currentPage - 1] ?? 0) : 0;

  const queryParams = useMemo(() => ({
    end_timestamp:   getPeriodTimestamp(period),
    currency:        "",
    limit:           TRANSACTION_PAGE_SIZE,
    last_created_at: lastCtdForCurrentPage,
  }), [period, lastCtdForCurrentPage]);

  const { data, isLoading, isFetching } = useBonusWalletRecords(queryParams, { enabled: true });
  const { records: transactions, hasNext, totalPages: apiTotalPages, totalCount, last_created_at } = extractTransactionPayload(data, true);

  const derivedTotal   = apiTotalPages ?? (typeof totalCount === "number" ? Math.ceil(totalCount / TRANSACTION_PAGE_SIZE) : undefined);
  const safeTotalPages = Math.max(derivedTotal ?? (hasNext ? currentPage + 1 : currentPage), 1);

  useEffect(() => {
    if (!last_created_at) return;
    setLastCtdMap((prev) => {
      const existing = prev[paginationKey] ?? {};
      if (existing[currentPage] === last_created_at) return prev;
      return { ...prev, [paginationKey]: { ...existing, [currentPage]: last_created_at } };
    });
  }, [last_created_at, paginationKey, currentPage]);

  return (
    <>
      <PeriodFilter value={period} onChange={(v) => { setPeriod(v); setCurrentPage(1); setLastCtdMap({}); }} />
      <BonusStoreList transactions={transactions} isLoading={isLoading} isFetching={isFetching} />
      <Paginate page={currentPage} limit={TRANSACTION_PAGE_SIZE} disabled={isFetching} pageCount={safeTotalPages} onJumpPage={setCurrentPage} onPaginate={setCurrentPage} />
    </>
  );
}
