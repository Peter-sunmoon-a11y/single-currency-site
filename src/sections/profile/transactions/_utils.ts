import dayjs from "dayjs";
import { chunk } from "es-toolkit/array";

export const extractTransactionPayload = (rawData: any, chunkPaired = false) => {
  const payload = rawData?.data && !Array.isArray(rawData.data) ? rawData.data : (rawData?.data ?? rawData);
  const pagination = payload?.pagination ?? rawData?.pagination;
  const last_created_at = rawData?.last_created_at ?? 0;

  const records = Array.isArray(payload?.records) ? payload.records
    : Array.isArray(payload?.data) ? payload.data
    : Array.isArray(payload?.list) ? payload.list
    : Array.isArray(rawData?.data) ? rawData.data
    : Array.isArray(payload) ? payload
    : [];

  const hasNext =
    typeof payload?.has_next === "boolean" ? payload.has_next
    : typeof payload?.has_more === "boolean" ? payload.has_more
    : typeof pagination?.has_more === "boolean" ? pagination.has_more
    : typeof rawData?.has_next === "boolean" ? rawData.has_next
    : typeof rawData?.has_more === "boolean" ? rawData.has_more
    : false;

  const totalPages =
    typeof payload?.total_pages === "number" ? payload.total_pages
    : typeof pagination?.last_page === "number" ? pagination.last_page
    : typeof rawData?.total_pages === "number" ? rawData.total_pages
    : undefined;

  const totalCount =
    typeof payload?.total === "number" ? payload.total
    : typeof pagination?.total === "number" ? pagination.total
    : typeof rawData?.total === "number" ? rawData.total
    : undefined;

  return {
    records: chunkPaired ? chunk(records, 2) : records,
    hasNext,
    totalPages,
    totalCount,
    last_created_at,
  };
};

export const getPeriodTimestamp = (period: string): number | undefined => {
  const now = dayjs();
  const toUnix = (d: dayjs.Dayjs) => Math.floor(d.unix());
  switch (period) {
    case "Past 90 Days":  return toUnix(now.subtract(90, "day"));
    case "Past 60 Days":  return toUnix(now.subtract(60, "day"));
    case "Past 30 Days":  return toUnix(now.subtract(30, "day"));
    case "Past 7 Days":   return toUnix(now.subtract(7, "day"));
    case "Past 24 Hours": return toUnix(now.subtract(24, "hour"));
    default: return undefined;
  }
};
