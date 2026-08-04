import { ROLLOVER_PAGE_SIZE, useRolloverRecords } from "@/query/rollover";
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { RolloverFilters } from "./RolloverFilters";
import { useRolloverDetailMapper } from "./RolloverDetailMapper";
import { useBoundStore } from "@/store";
import type { EnrichedRolloverRecord, RolloverRecord, RolloverStatusKey, RolloverTypeKey } from "./types";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import dayjs from "dayjs";

const extractRolloverPayload = (rawData: any) => {
  const payload = rawData?.data && !Array.isArray(rawData.data) ? rawData.data : (rawData?.data ?? rawData);

  const records = Array.isArray(payload?.records)
    ? payload.records
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.list)
        ? payload.list
        : Array.isArray(rawData?.data)
          ? rawData.data
          : Array.isArray(payload)
            ? payload
            : [];

  const hasNext =
    typeof payload?.has_next === "boolean"
      ? payload.has_next
      : typeof payload?.has_more === "boolean"
        ? payload.has_more
        : typeof rawData?.has_next === "boolean"
          ? rawData.has_next
          : typeof rawData?.has_more === "boolean";

  const totalPages =
    typeof payload?.total_pages === "number"
      ? payload.total_pages
      : typeof rawData?.total_pages === "number"
        ? rawData.total_pages
        : undefined;

  const totalCount = typeof payload?.total === "number" ? payload.total : typeof rawData?.total === "number" ? rawData.total : undefined;

  return {
    records,
    hasNext: Boolean(hasNext),
    totalPages,
    totalCount
  };
};

const parseAmount = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return 0;
  const parsed = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const calculateStatusKey = (record: RolloverRecord) => {
  const goal = parseAmount(record.max_wager ?? record.amount);
  const remaining = parseAmount(record.wager);

  if (goal <= 0) {
    return "Done";
  }

  if (remaining <= 0) {
    return "Done";
  }

  if (remaining >= goal) {
    return "Not Started";
  }

  return "Ongoing";
};

const enrichRecords = (records: RolloverRecord[]): EnrichedRolloverRecord[] => {
  return records.map((record) => {
    const goalAmount = parseAmount(record.max_wager ?? record.amount);
    const remaining = parseAmount(record.wager);
    const progressAmount = Math.min(goalAmount, Math.max(0, goalAmount - remaining));
    const denominator = goalAmount > 0 ? goalAmount : Math.max(progressAmount, 1);
    const statusKey = calculateStatusKey(record);

    return {
      ...record,
      goalAmount: goalAmount > 0 ? goalAmount : progressAmount,
      progressAmount,
      progressPercent: denominator > 0 ? progressAmount / denominator : 0,
      statusKey
    };
  });
};

export function Index() {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState<RolloverTypeKey>("All");
  const [selectedStatus, setSelectedStatus] = useState<RolloverStatusKey>("All Statuses");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastIdsMap, setLastIdsMap] = useState<Record<string, Record<number, number | string>>>({});
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const mapRolloverDetail = useRolloverDetailMapper();
  const openModal = useBoundStore((s) => s.openModal);

  const formatAmount = (value: number, currency: string) => {
    if (!Number.isFinite(value)) return "0.00";
    return formatWithConversion(value, currency, {
      showSymbol: true,
      showCode: false,
      minimizeDecimals: true
    }).formatted;
  };

  const renderProgressText = (item: EnrichedRolloverRecord) => {
    const currency = item.currency ?? "USD";
    if (item.statusKey === "Done") return formatAmount(item.goalAmount, currency);
    if (item.goalAmount <= 0) return formatAmount(item.progressAmount, currency);
    return `${formatAmount(item.progressAmount, currency)} / ${formatAmount(item.goalAmount, currency)}`;
  };

  const renderStatusLabel = (statusKey: string) => {
    const key = statusKey === "Done" ? "done" : statusKey === "Ongoing" ? "ongoing" : statusKey === "Not Started" ? "notStarted" : "unknown";
    return t(`transaction:transactionStatus.${key}`, statusKey);
  };

  const statusColors: Record<string, string> = {
    "Not Started": "text-warning",
    Ongoing: "text-info",
    Done: "text-success"
  };

  const handleRowClick = (record: EnrichedRolloverRecord) => {
    const detail = mapRolloverDetail({ record, t });
    openModal("OPEN_ROLLOVER_DETAILS_MODAL", { detail });
  };

  const baseParams = useMemo(
    () => ({
      type: selectedType === "All" ? undefined : selectedType.toLowerCase(),
      statuses: selectedStatus === "All Statuses" ? undefined : selectedStatus
    }),
    [selectedType, selectedStatus]
  );

  const paginationKey = useMemo(
    () =>
      JSON.stringify({
        type: baseParams.type ?? null,
        statuses: baseParams.statuses ?? null
      }),
    [baseParams.type, baseParams.statuses]
  );

  const lastIdsForKey = lastIdsMap[paginationKey] ?? {};
  const lastIdForCurrentPage = currentPage > 1 ? (lastIdsForKey[currentPage - 1] ?? 0) : 0;

  const rolloverQuery = useRolloverRecords(
    {
      ...baseParams,
      limit: ROLLOVER_PAGE_SIZE,
      last_id: lastIdForCurrentPage
    },
    { enabled: true }
  );

  const { data, isFetching } = rolloverQuery;
  const { records, hasNext, totalPages: apiTotalPages, totalCount } = extractRolloverPayload(data);

  const enrichedRecords = useMemo(() => enrichRecords(records), [records]);

  const derivedTotalPages = apiTotalPages ?? (typeof totalCount === "number" ? Math.ceil(totalCount / ROLLOVER_PAGE_SIZE) : undefined);
  const safeTotalPages = derivedTotalPages ?? (hasNext ? currentPage + 1 : currentPage)

  useEffect(() => {
    if (!paginationKey) return;
    if (enrichedRecords.length === 0) return;
    const lastRecord = enrichedRecords[enrichedRecords.length - 1];
    if (lastRecord?.id === undefined) return;

    setLastIdsMap((prev) => {
      const existing = prev[paginationKey] ?? {};
      if (existing[currentPage] === lastRecord.id) {
        return prev;
      }
      return {
        ...prev,
        [paginationKey]: {
          ...existing,
          [currentPage]: lastRecord.id as number | string
        } as Record<number, number | string>
      };
    });
  }, [paginationKey, enrichedRecords, currentPage]);

  const handleTypeChange = (value: RolloverTypeKey) => {
    setSelectedType(value);
    setCurrentPage(1);
    setLastIdsMap({});
  };

  const handleStatusChange = (value: RolloverStatusKey) => {
    setSelectedStatus(value);
    setCurrentPage(1);
    setLastIdsMap({});
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <h3 className={'text-base text-primary font-bold border-l-4 pl-2 border-l-primary'}>{t("transaction:tabs.rollover", "Rollover")}</h3>

      <RolloverFilters
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
      />

      <div className="relative rounded-lg bg-base-200 p-2 min-h-[125px]">
        <div className="space-y-1">
          {enrichedRecords.map((item, index) => (
            <div
              key={item.id ?? index}
              onClick={() => handleRowClick(item)}
              className="flex flex-col gap-1 rounded-lg p-2 bg-base-300 cursor-pointer"
            >
              <InnerItemWrap
                label={t("transaction:tableHeaders.type")}
                value={
                  <span className="text-info text-sm italic">
                    {item.network === "bonus" ? t("transaction:transactionTypes.bonus") : t("transaction:transactionTypes.deposit")}
                  </span>
                }
              />
              <InnerItemWrap
                label={t("transaction:tableHeaders.time")}
                value={item.created_at ? dayjs(item.created_at * 1000).format("YYYY/MM/DD HH:mm:ss") : "—"}
              />
              <InnerItemWrap
                label={t("transaction:tableHeaders.status")}
                value={
                  <span
                    className={cn("text-sm italic", statusColors[item.statusKey] ?? "text-base-content")}>
                      {renderStatusLabel(item.statusKey)}
                    </span>
                }
              />
              <InnerItemWrap
                label={t("bonus:progress", "Progress")}
                value={
                  <div className="flex items-center gap-1 text-primary font-bold text-sm">
                    {renderProgressText(item)}
                  </div>
                }
              />
            </div>
          ))}
        </div>

        {(isFetching) && <DataLoading />}
        {!isFetching && enrichedRecords.length === 0 && <NothingFound />}
      </div>

      <Paginate
        page={currentPage}
        limit={ROLLOVER_PAGE_SIZE}
        disabled={isFetching}
        pageCount={safeTotalPages}
        onJumpPage={(page) => setCurrentPage(page)}
        onPaginate={(page) => setCurrentPage(page)}
      />

    </div>
  );
}

const InnerItemWrap = ({ label, value, className }: { label?: string; value: ReactNode; className?: string }) => {
  return (
    <div className="flex items-center justify-between text-sm font-semibold text-base-content/50">
      <span className="truncate font-normal">{label}</span>
      <span className={cn("text-end", className)}>{value}</span>
    </div>
  );
};
