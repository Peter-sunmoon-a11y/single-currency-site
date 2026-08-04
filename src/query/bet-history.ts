import { getUserBetHistory, getUserSportsBetHistory } from "@/services/auth/game";
import { useBoundStore } from "@/store";
import type {
  BetHistoryFilterGroup,
  BetHistoryFilterOption,
  BetHistoryPagination,
  BetHistoryPayload,
  BetHistoryQueryParams,
  BetHistoryRecord,
  BetHistoryResponse,
} from "@/types/bet-history";
import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

export const BET_HISTORY_PAGE_SIZE = 10;

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const asBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 0) return false;
    if (value === 1) return true;
  }
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (["true", "yes", "1"].includes(normalized)) return true;
    if (["false", "no", "0"].includes(normalized)) return false;
  }
  return undefined;
};

const extractRecords = (source: unknown): BetHistoryRecord[] => {
  if (!source) return [];
  if (Array.isArray(source)) return source as BetHistoryRecord[];

  if (typeof source === "object") {
    const payload = source as Record<string, unknown>;
    const candidates = ["records", "list", "data", "items", "result", "bets"];
    for (const key of candidates) {
      const value = payload[key];
      if (Array.isArray(value)) {
        return value as BetHistoryRecord[];
      }
    }
  }

  return [];
};

const extractFilters = (payload?: Record<string, unknown>, fallback?: Record<string, unknown>): BetHistoryFilterGroup | undefined => {
  const base = (payload?.filters ?? fallback?.filters ?? payload ?? fallback) as Record<string, unknown> | undefined;
  if (!base) return undefined;

  const toOptions = (input: unknown): BetHistoryFilterOption[] | undefined => {
    if (!input) return undefined;
    if (Array.isArray(input)) {
      const mapped = input
        .map((item) => {
          if (typeof item === "string" || typeof item === "number") {
            const value = String(item);
            return { value, label: value };
          }
          if (item && typeof item === "object") {
            const node = item as Record<string, unknown>;
            const value = node.value ?? node.code ?? node.id ?? node.key ?? (typeof node.label === "string" ? node.label : undefined);
            const label = node.label ?? node.name ?? node.title ?? value;
            if (value === undefined || label === undefined) return undefined;
            return { value: String(value), label: String(label) };
          }
          return undefined;
        })
        .filter((option): option is BetHistoryFilterOption => Boolean(option));

      return mapped.length ? mapped : undefined;
    }
    return undefined;
  };

  const toStringArray = (input: unknown): string[] | undefined => {
    if (!input) return undefined;
    if (Array.isArray(input)) {
      const mapped = input
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "number") return String(item);
          if (item && typeof item === "object") {
            const node = item as Record<string, unknown>;
            const candidate = node.currency ?? node.value ?? node.code ?? node.id ?? node.label ?? node.name;
            return candidate ? String(candidate) : undefined;
          }
          return undefined;
        })
        .filter((value): value is string => Boolean(value));
      return mapped.length ? mapped : undefined;
    }
    if (typeof input === "string") return [input];
    return undefined;
  };

  const games = toOptions(base.games ?? base.game_types ?? base.gameType);
  const assets = toStringArray(base.assets ?? base.asset ?? base.currencies ?? base.currency);
  const providers = toOptions(base.providers ?? base.provider);

  const filterGroup: BetHistoryFilterGroup = {};
  if (games) filterGroup.games = games;
  if (assets) filterGroup.assets = assets;
  if (providers) filterGroup.providers = providers;

  return Object.keys(filterGroup).length ? filterGroup : undefined;
};

const extractPagination = (payload?: Record<string, unknown>, fallback?: Record<string, unknown>): BetHistoryPagination | undefined => {
  if (!payload && !fallback) return undefined;
  const candidates = [payload?.pagination, payload?.meta, payload, fallback?.pagination, fallback?.meta, fallback];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const node = candidate as Record<string, unknown>;

    const currentPage =
      toNumber(node.current_page) ??
      toNumber(node.currentPage) ??
      toNumber(node.page) ??
      toNumber(node.page_index) ??
      toNumber(node.pageIndex);

    const lastPage =
      toNumber(node.last_page) ??
      toNumber(node.lastPage) ??
      toNumber(node.total_pages) ??
      toNumber(node.totalPages) ??
      toNumber(node.pages) ??
      toNumber(node.max_page) ??
      toNumber(node.maxPage);

    const hasMore =
      asBoolean(node.has_more) ??
      asBoolean(node.hasMore) ??
      (currentPage !== undefined && lastPage !== undefined ? currentPage < lastPage : undefined);

    const pageSize =
      toNumber(node.page_size) ?? toNumber(node.pageSize) ?? toNumber(node.per_page) ?? toNumber(node.perPage) ?? toNumber(node.limit);

    const total = toNumber(node.total) ?? toNumber(node.total_count) ?? toNumber(node.totalCount);
    const nextPage = toNumber(node.next_page) ?? toNumber(node.nextPage);
    const lastId = toNumber(node.last_id) ?? toNumber(node.lastId);

    if (currentPage !== undefined || lastPage !== undefined || hasMore !== undefined || total !== undefined || lastId !== undefined) {
      return {
        current_page: currentPage,
        last_page: lastPage,
        has_more: hasMore,
        page_size: pageSize,
        per_page: pageSize,
        total,
        next_page: nextPage,
        last_id: lastId,
      };
    }
  }

  return undefined;
};

export const normalizeBetHistoryResponse = (raw?: BetHistoryResponse): BetHistoryPayload => {
  if (!raw) {
    return {
      records: [],
      pagination: null,
    };
  }

  const rawPayload = raw.data && !Array.isArray(raw.data) ? (raw.data as Record<string, unknown>) : undefined;
  const recordsSource = rawPayload ?? raw.data ?? raw;
  const records = extractRecords(recordsSource);
  const pagination = extractPagination(rawPayload, raw as Record<string, unknown>);
  const filters = extractFilters(rawPayload, raw as Record<string, unknown>);

  return {
    records,
    pagination: pagination ?? null,
    filters,
  };
};

export const useUserBetHistory = (params: Omit<BetHistoryQueryParams, "page" | "page_size">) => {
  const user = useBoundStore((state) => state.user);

  return useInfiniteQuery<BetHistoryResponse, Error, InfiniteData<BetHistoryResponse>, readonly unknown[], string | number>({
    queryKey: ["betHistory", params, user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error("User not authenticated");

      const queryParams: BetHistoryQueryParams = {
        ...params,
        page_size: BET_HISTORY_PAGE_SIZE,
        last_id: pageParam,
      };
      return getUserBetHistory(queryParams);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return !lastPage?.pagination?.has_more ? undefined : lastPage?.pagination?.next_last_id;
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: false,
    retry: 1,
  });
};

// TODO: api V3->V4 @Frank @Mark
export const useSportsBetHistory = (params: Omit<BetHistoryQueryParams, "page" | "page_size" | "last_id">) => {
  const user = useBoundStore((state) => state.user);

  return useInfiniteQuery<BetHistoryResponse, Error, InfiniteData<BetHistoryResponse>, readonly unknown[], string | number>({
    queryKey: ["sportsBetHistory", params, user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error("User not authenticated");

      const queryParams: BetHistoryQueryParams = {
        ...params,
        page_size: BET_HISTORY_PAGE_SIZE,
        last_id: pageParam,
      };

      return getUserSportsBetHistory(queryParams);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return !lastPage?.pagination?.has_more ? undefined : lastPage?.pagination?.next_last_id;
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: false,
    retry: 1,
  });
};

// old 备份
// export const useUserBetHistory = (params: Omit<BetHistoryQueryParams, "page" | "page_size">) => {
//   const user = useBoundStore((state) => state.user);
//
//   return useInfiniteQuery<BetHistoryResponse, Error>({
//     queryKey: ["betHistory", params, user?.id],
//     queryFn: async ({ pageParam = 1 }) => {
//       if (!user) throw new Error("User not authenticated");
//
//       const nextPage = typeof pageParam === "number" ? pageParam : (toNumber(pageParam) ?? 1);
//       const queryParams: BetHistoryQueryParams = {
//         ...params,
//         page: nextPage,
//         page_size: BET_HISTORY_PAGE_SIZE,
//       };
//       return getUserBetHistory(queryParams);
//     },
//     initialPageParam: 1,
//     getNextPageParam: (lastPage) => {
//       const payload = normalizeBetHistoryResponse(lastPage);
//       const currentPage = payload.pagination?.current_page ?? 1;
//       const lastPageNumber = payload.pagination?.last_page;
//       const hasMore = payload.pagination?.has_more;
//       const nextPageCandidate = payload.pagination?.next_page ?? currentPage + 1;
//
//       if (hasMore === false) return undefined;
//       if (lastPageNumber !== undefined && currentPage >= lastPageNumber) return undefined;
//       if (hasMore === true) return nextPageCandidate;
//       if (lastPageNumber === undefined && nextPageCandidate > currentPage) {
//         return nextPageCandidate;
//       }
//
//       if (lastPageNumber !== undefined && currentPage < lastPageNumber) {
//         return currentPage + 1;
//       }
//
//       return undefined;
//     },
//     enabled: !!user,
//     staleTime: 0,
//     refetchOnMount: true,
//     retry: 1,
//   });
// };
// export const useSportsBetHistoryOld = (params: Omit<BetHistoryQueryParams, "page" | "page_size" | "last_id">) => {
//   const user = useBoundStore((state) => state.user);
//   const isBetby = params.game_type === "betby";
//
//   return useInfiniteQuery<BetHistoryResponse, Error>({
//     queryKey: ["sportsBetHistory", params, user?.id],
//     queryFn: async ({ pageParam }) => {
//       if (!user) throw new Error("User not authenticated");
//
//       const queryParams: BetHistoryQueryParams = {
//         ...params,
//         page_size: BET_HISTORY_PAGE_SIZE,
//       };
//
//       // Only add last_id when game_type is 'betby'
//       if (isBetby) {
//         queryParams.last_id = typeof pageParam === "number" ? pageParam : 0;
//       } else {
//         // For non-betby, use page-based pagination
//         queryParams.page = typeof pageParam === "number" ? pageParam : 1;
//       }
//
//       return getUserSportsBetHistory(queryParams);
//     },
//     initialPageParam: isBetby ? 0 : 1,
//     getNextPageParam: (lastPage) => {
//       const payload = normalizeBetHistoryResponse(lastPage);
//       const hasMore = payload.pagination?.has_more;
//       if (hasMore === false) return undefined;
//
//       // For betby, use last_id from pagination
//       if (params.game_type === "betby") {
//         const nextLastId =
//           payload.pagination?.last_id ??
//           toNumber(payload.records[payload.records.length - 1]?.id) ??
//           toNumber(payload.records[payload.records.length - 1]?.order_id);
//
//         if (nextLastId === undefined) {
//           return undefined;
//         }
//
//         return nextLastId;
//       }
//
//       // For other game types, use page-based pagination (fallback)
//       const currentPage = payload.pagination?.current_page;
//       const lastPageNumber = payload.pagination?.last_page;
//       if (typeof currentPage === "number" && typeof lastPageNumber === "number" && currentPage < lastPageNumber) {
//         return currentPage + 1;
//       }
//
//       return undefined;
//     },
//     enabled: !!user,
//     staleTime: 0,
//     refetchOnMount: true,
//     retry: 1,
//   });
// };
