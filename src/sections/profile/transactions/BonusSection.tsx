import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useUserBalance } from "@/hooks/api/useAuth";
import { TRANSACTION_PAGE_SIZE, useBonusRecords } from "@/query/transactions";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useTransactionDetailMapper } from "./TransactionDetailMapper";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";
import { StatusFilter, AssetFilter, PeriodFilter } from "./TransactionFilters";
import { BonusList } from "./TransactionList";
import type { TransactionType } from "./types";
import { extractTransactionPayload, getPeriodTimestamp } from "./_utils";

export function BonusSection() {
  const { t } = useTranslation();

  const [status, setStatus] = useState("All");
  const [asset, setAsset]   = useState("all");
  const [period, setPeriod] = useState("Past 30 Days");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastIdsMap, setLastIdsMap]   = useState<Record<string, Record<number, string | number | undefined>>>({});

  const { data: userBalance = [] } = useUserBalance();

  const baseParams = useMemo(() => ({
    status:        status === "All" ? undefined : status,
    end_timestamp: getPeriodTimestamp(period),
    currency:      asset === "all" ? undefined : asset,
  }), [status, asset, period]);

  const paginationKey = useMemo(() => JSON.stringify(baseParams), [baseParams]);
  const lastIdForCurrentPage = currentPage > 1 ? (lastIdsMap[paginationKey]?.[currentPage - 1] ?? 0) : 0;

  const queryParams = useMemo(() => ({ ...baseParams, limit: TRANSACTION_PAGE_SIZE, last_id: lastIdForCurrentPage }), [baseParams, lastIdForCurrentPage]);
  const { data, isLoading, isFetching } = useBonusRecords(queryParams, { enabled: true });
  const { records: transactions, hasNext, totalPages: apiTotalPages, totalCount } = extractTransactionPayload(data);

  const derivedTotal   = apiTotalPages ?? (typeof totalCount === "number" ? Math.ceil(totalCount / TRANSACTION_PAGE_SIZE) : undefined);
  const safeTotalPages = Math.max(derivedTotal ?? (hasNext ? currentPage + 1 : currentPage), 1);

  const [isDetailsOpen, setIsDetailsOpen]   = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ReturnType<ReturnType<typeof useTransactionDetailMapper>> | null>(null);
  const mapDetail = useTransactionDetailMapper();

  const resetPage = () => { setCurrentPage(1); setLastIdsMap({}); };

  useEffect(() => {
    if (!Array.isArray(transactions) || transactions.length === 0) return;
    const last = transactions[transactions.length - 1];
    if (!last?.id) return;
    setLastIdsMap((prev) => {
      const existing = prev[paginationKey] ?? {};
      if (existing[currentPage] === last.id) return prev;
      return { ...prev, [paginationKey]: { ...existing, [currentPage]: last.id } };
    });
  }, [transactions, paginationKey, currentPage]);

  return (
    <>
      <div className="grid grid-cols-2 gap-1">
        <StatusFilter value={status} onChange={(v) => { setStatus(v); resetPage(); }} />
        <AssetFilter  value={asset}  userBalance={userBalance} onChange={(v) => { setAsset(v); resetPage(); }} />
        <PeriodFilter value={period} onChange={(v) => { setPeriod(v); resetPage(); }} />
      </div>
      <BonusList
        transactions={transactions} isLoading={isLoading} isFetching={isFetching}
        onTransactionClick={(tx) => {
          setSelectedDetail(mapDetail({ transaction: tx, transactionType: "Bonus" as TransactionType, t }));
          setIsDetailsOpen(true);
        }}
      />
      <Paginate page={currentPage} limit={TRANSACTION_PAGE_SIZE} disabled={isFetching} pageCount={safeTotalPages} onJumpPage={setCurrentPage} onPaginate={setCurrentPage} />
      <TransactionDetailsDialog isOpen={isDetailsOpen && !!selectedDetail} onClose={() => { setIsDetailsOpen(false); setSelectedDetail(null); }} detail={selectedDetail} />
    </>
  );
}
