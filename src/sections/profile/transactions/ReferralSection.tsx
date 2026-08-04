import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { useUserBalance } from "@/hooks/api/useAuth";
import { TRANSACTION_PAGE_SIZE, useReferralRecords } from "@/query/transactions";
import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useTransactionDetailMapper } from "./TransactionDetailMapper";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";
import { AssetFilter, PeriodFilter } from "./TransactionFilters";
import { ReferralList } from "./TransactionList";
import type { TransactionType } from "./types";
import { extractTransactionPayload, getPeriodTimestamp } from "./_utils";

export function ReferralSection() {
  const { t } = useTranslation();

  const [asset, setAsset]   = useState("all");
  const [period, setPeriod] = useState("Past 30 Days");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: userBalance = [] } = useUserBalance();

  const queryParams = useMemo(() => ({
    end_timestamp: getPeriodTimestamp(period),
    currency:      asset === "all" ? undefined : asset,
    limit:         TRANSACTION_PAGE_SIZE,
    page:          currentPage,
  }), [asset, period, currentPage]);

  const { data, isLoading, isFetching } = useReferralRecords(queryParams, { enabled: true });
  const { records: transactions, hasNext, totalPages: apiTotalPages, totalCount } = extractTransactionPayload(data);

  const derivedTotal   = apiTotalPages ?? (typeof totalCount === "number" ? Math.ceil(totalCount / TRANSACTION_PAGE_SIZE) : undefined);
  const safeTotalPages = Math.max(derivedTotal ?? (hasNext ? currentPage + 1 : currentPage), 1);

  const [isDetailsOpen, setIsDetailsOpen]   = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ReturnType<ReturnType<typeof useTransactionDetailMapper>> | null>(null);
  const mapDetail = useTransactionDetailMapper();

  const resetPage = () => setCurrentPage(1);

  return (
    <>
      <div className="grid grid-cols-2 gap-1">
        <AssetFilter  value={asset}  userBalance={userBalance} onChange={(v) => { setAsset(v); resetPage(); }} />
        <PeriodFilter value={period} onChange={(v) => { setPeriod(v); resetPage(); }} />
      </div>
      <ReferralList
        transactions={transactions} isLoading={isLoading} isFetching={isFetching}
        onTransactionClick={(tx) => {
          setSelectedDetail(mapDetail({ transaction: tx, transactionType: "Referral" as TransactionType, t }));
          setIsDetailsOpen(true);
        }}
      />
      <Paginate page={currentPage} limit={TRANSACTION_PAGE_SIZE} disabled={isFetching} pageCount={safeTotalPages} onJumpPage={setCurrentPage} onPaginate={setCurrentPage} />
      <TransactionDetailsDialog isOpen={isDetailsOpen && !!selectedDetail} onClose={() => { setIsDetailsOpen(false); setSelectedDetail(null); }} detail={selectedDetail} />
    </>
  );
}
