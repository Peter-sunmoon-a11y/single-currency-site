import { useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useActiveRecords } from "@/query/free-spins";
import { SpinHistoryList } from "./SpinHistoryList";
import { SpinHistoryFilters } from "./SpinHistoryFilters";
import type { StatusClassMap } from "./types";
import type { StatusFilter, StatusOption } from "./types";
import {
  FREE_SPIN_STATUS_LABELS,
  FREE_SPIN_STATUS_CLASSES,
  FREE_SPIN_STATUS_I18N_KEYS,
  FreeSpinStatus
} from "@/types/freeSpins";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";

const statusLabel: Record<number, string> = FREE_SPIN_STATUS_LABELS;
const statusClass: StatusClassMap = FREE_SPIN_STATUS_CLASSES;

export const Index = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data, isLoading, isFetching } = useActiveRecords({
    page,
    page_size: 10,
    status_filter: statusFilter === "all" ? "" : statusFilter
  });

  const totalPages = data?.total_pages;

  const statusOptions: StatusOption[] = [
    { value: "all", label: t("transaction:filters.all", "All") },
    { value: FreeSpinStatus.NOT_STARTED, label: t(FREE_SPIN_STATUS_I18N_KEYS[FreeSpinStatus.NOT_STARTED], FREE_SPIN_STATUS_LABELS[FreeSpinStatus.NOT_STARTED]) },
    { value: FreeSpinStatus.ONGOING, label: t(FREE_SPIN_STATUS_I18N_KEYS[FreeSpinStatus.ONGOING], FREE_SPIN_STATUS_LABELS[FreeSpinStatus.ONGOING]) },
    { value: FreeSpinStatus.CLAIM, label: t(FREE_SPIN_STATUS_I18N_KEYS[FreeSpinStatus.CLAIM], FREE_SPIN_STATUS_LABELS[FreeSpinStatus.CLAIM]) },
    { value: FreeSpinStatus.CLAIMED, label: t(FREE_SPIN_STATUS_I18N_KEYS[FreeSpinStatus.CLAIMED], FREE_SPIN_STATUS_LABELS[FreeSpinStatus.CLAIMED]) },
    { value: FreeSpinStatus.CANCELLED, label: t(FREE_SPIN_STATUS_I18N_KEYS[FreeSpinStatus.CANCELLED], FREE_SPIN_STATUS_LABELS[FreeSpinStatus.CANCELLED]) },
  ];

  const formatStatus = (status?: number) => {
    if (status === undefined || status === null) return t("common:unknown", "Unknown");
    const normalizedStatus = Number(status) as FreeSpinStatus;
    const label = statusLabel[normalizedStatus];
    const i18nKey = FREE_SPIN_STATUS_I18N_KEYS[normalizedStatus];
    if (label && i18nKey) return t(i18nKey, label);
    return label || status.toString();
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <h3 className="text-base text-primary font-bold border-l-4 pl-2 border-l-primary">
        {t("transaction:freeSpinRewards")}
      </h3>

      <SpinHistoryFilters
        statusFilter={statusFilter}
        statusOptions={statusOptions}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
      />

      <SpinHistoryList
        rows={data?.list || []}
        isLoading={isLoading}
        isFetching={isFetching}
        isEmpty={(data?.list || []).length === 0 && !isLoading}
        statusClass={statusClass}
        formatStatus={formatStatus}
      />

      <Paginate
        page={page}
        limit={10}
        disabled={isFetching}
        pageCount={totalPages}
        onJumpPage={(p) => setPage(p)}
        onPaginate={(p) => setPage(p)}
      />
    </div>
  );
};
