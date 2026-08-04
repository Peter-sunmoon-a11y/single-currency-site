import { AUTH_QUERY_KEYS } from "@/hooks/api/useAuth.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  applyFreeSpin,
  cancelFreeSpinRecord,
  claimFreeSpinReward,
  enableFreeSpinRecord,
  getActiveFreeSpinRecords,
  getEarliestPendingRecord,
  getFreeSpinApplyEntry,
  getSupportedFreeSpinGames,
  getUserFreeGameRecords,
} from "@/services/auth/game";
import { useBoundStore } from "@/store";
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ========== Type Definitions ==========

/**
 * Game item interface
 */
export interface Game {
  inner_game_id: string;
  game_provider: string;
  image: string;
  display_game_name: string;

  [key: string]: any;
}

/**
 * Currency interface
 */
export interface Currency {
  code: string;
  name: string;
  symbol?: string;

  [key: string]: any;
}

/**
 * Free spin record interface
 */
export interface FreeSpinRecord {
  id: string;
  bet_count: number;
  status: "pending" | "active" | "completed";
  created_at?: string;
  expires_at?: string;
  can_enable: boolean; // 是否有有效 FreeSpin 的最终守护 key，由 /FreeSpin/getEarliestPendingRecord 返回

  [key: string]: any;
}

/**
 * Hook for enabling free spins for a selected game
 * @returns Mutation hook for enabling free spins
 */
export const useEnableRecord = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (data: any) => enableFreeSpinRecord(data),
    onSuccess: (result) => {
      if (result.code === 0) {
        toast.success(t("toast:free_spin_record_enabled_successfully"));
        void queryClient.invalidateQueries({
          queryKey: ["enableRecord"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["activeRecords"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["gameDetailsByUserFreeSpinRecord"],
        });
      } else {
        toast.error(t("toast:game_not_exist"));
      }
    },
    onError: (error: any) => {
      console.error("Failed to enable free spin record:", error);
      toast.error(t("toast:game_not_exist"));
    },
  });
};

/**
 * Hook for fetching the earliest pending free spins record
 * @returns Query hook with pending free spins data
 */
export const useEarliestPendingRecord = (flag = "", enabled = true) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: ["earliestPendingRecord", flag], // TODO: flag服务于区分不同请求[当前辅助于手动优惠码的FreeSpins发放数据检测]
    queryFn: async () => {
      const result = await getEarliestPendingRecord();
      return result.data;
    },
    enabled: !!user && enabled,
    refetchOnMount: true,
  });
};

/**
 * Hook for claiming free spins reward
 * @returns Mutation hook for claiming free spins
 */
export const useClaimReward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // 二选一，free_spin_code 和 record_id 只能传一个
    mutationFn: (params: { free_spin_code?: string; record_id?: string; currency: string }) => claimFreeSpinReward(params),
    onSuccess: (result) => {
      if (result.code === 0) {
        toast.success("Free spin reward claimed successfully!");

        void queryClient.invalidateQueries({
          queryKey: ["activeRecords"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["gameDetailsByUserFreeSpinRecord"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["earliestPendingRecord"],
        });
        void queryClient.invalidateQueries({
          queryKey: AUTH_QUERY_KEYS.userFreeGameRecords,
        });
        void queryClient.invalidateQueries({
          queryKey: FREE_SPIN_APPLY_ENTRY_KEY,
        });
      } else {
        toast.error("Failed to claim reward");
      }
    },
    onError: () => {
      toast.error("Failed to claim reward");
    },
  });
};

/**
 * Response type for supported games
 */
export interface SupportedGamesResponse {
  code: number;
  msg?: string;
  data: {
    currencies: string;
    games: Game[];
    total: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
    has_next?: boolean;
    has_prev?: boolean;
  };
}

export interface SupportedGamesParams {
  record_id: string;
  page?: number;
  page_size?: number;
}

/**
 * Hook for fetching supported games for free spins with infinite loading
 * @param params - Query parameters including record_id
 * @returns Infinite query hook with paginated games data
 */
export const useSupportedGamesInfinite = (params: Omit<SupportedGamesParams, "page" | "page_size">) => {
  const PAGE_SIZE = 20; // Default page size

  return useInfiniteQuery<SupportedGamesResponse>({
    queryKey: ["supportedGamesInfinite", params.record_id],
    queryFn: async ({ pageParam = 1 }) => {
      const queryParams: SupportedGamesParams = {
        ...params,
        page: Number(pageParam),
        page_size: PAGE_SIZE,
      };

      const response = await getSupportedFreeSpinGames(queryParams);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Handle API response structure
      if (lastPage.code === 0 && lastPage.data) {
        // If API returns pagination info
        if (lastPage.data.has_next && lastPage.data.page && lastPage.data.total_pages) {
          return lastPage.data.page < lastPage.data.total_pages ? lastPage.data.page + 1 : undefined;
        }

        // Fallback: check if we have more data based on page size
        const currentPageGames = lastPage.data.games?.length || 0;
        if (currentPageGames === PAGE_SIZE) {
          return allPages.length + 1;
        }
      }

      return undefined;
    },
    enabled: !!params.record_id,
  });
};

/**
 * Parameters for active records query
 */
export interface ActiveRecordsParams {
  page?: number;
  page_size?: number;
  status_filter?: "" | 0 | 2 | 3 | 4 | 6;
}

/**
 * Response type for active records
 */
export interface ActiveRecordsResponse {
  code: number;
  msg?: string;
  data: {
    list: FreeSpinRecord[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Hook for fetching active free spins records
 * @param params - Pagination parameters
 * @returns Query hook with active free spins data
 */
export const useActiveRecords = (params: ActiveRecordsParams) => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: ["activeRecords", params.page, params.status_filter],
    queryFn: async () => {
      const result = await getActiveFreeSpinRecords(params);
      return result.data;
    },
    placeholderData: keepPreviousData,
    refetchOnMount: true,
    enabled: !!user,
  });
};

/**
 * Hook for canceling free spins record
 * @returns Mutation hook for canceling free spins
 */
export const useCancelFreeSpinRecord = () => {
  const { t } = useTranslation("popup");

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record_id: string) => cancelFreeSpinRecord(record_id),
    onSuccess: (result) => {
      if (result.code === 0) {
        toast.success(t("toast:bonusCancelledSuccessfully"));

        void queryClient.invalidateQueries({
          queryKey: ["activeRecords"],
        });

        void queryClient.invalidateQueries({
          queryKey: ["earliestPendingRecord"],
        });
      } else {
        toast.error(t("toast:bonusCancelledFailed"));
      }
    },
    onError: (error: any) => {
      console.error("Failed to cancel free spin record:", error);
      toast.error(t("toast:bonusCancelledFailed"));
    },
  });
};

/**
 * Parameters for game details query
 */
export interface GameDetailsByUserFreeSpinRecordParams {
  page?: number;
  page_size?: number;
}

/**
 * Response type for game details
 */
export interface GameDetailsByUserFreeSpinRecordResponse {
  code: number;
  msg?: string;
  data: {
    games: Game[];
    total: number;
    currencies: Currency[];
    user_free_spin_record: FreeSpinRecord;
    requested_record_id: number;
    found_record_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

/**
 * Hook for fetching free spins game details with infinite loading
 * @param params - Optional query parameters
 * @returns Infinite query hook with paginated game details
 */
export const useGetGameDetailsByUserFreeSpinRecord = (params: Omit<GameDetailsByUserFreeSpinRecordParams, "page" | "page_size"> = {}) => {
  const user = useBoundStore((state) => state.user);
  const PAGE_SIZE = 20; // Default page size

  return useInfiniteQuery<GameDetailsByUserFreeSpinRecordResponse>({
    queryKey: ["gameDetailsByUserFreeSpinRecord", params],
    queryFn: async ({ pageParam = 1 }) => {
      // Support page-based pagination
      const queryParams: GameDetailsByUserFreeSpinRecordParams = {
        ...params,
        page: Number(pageParam),
        page_size: PAGE_SIZE,
      };

      const response = await getUserFreeGameRecords(queryParams);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Handle page-based pagination with pagination object
      if (lastPage.data && lastPage.data.has_next) {
        const currentPage = lastPage.data.page;
        if (lastPage.data.has_next && currentPage < lastPage.data.total_pages) {
          return currentPage + 1;
        }
        return undefined;
      }

      // Handle simple has_more flag without pagination object
      if (lastPage.data && lastPage.data.has_next && lastPage.data.page_size === PAGE_SIZE) {
        // Calculate next page based on the number of pages we've already fetched
        return allPages.length + 1;
      }

      return undefined;
    },
    refetchOnMount: true,
    enabled: !!user,
  });
};

// ========== Free Spins 可申请 ==========

/**
 * Query key for the Free Spins apply entry
 */
export const FREE_SPIN_APPLY_ENTRY_KEY = ["freeSpinApplyEntry"] as const;

/**
 * Hook for fetching whether the Free Spins apply entry should be shown
 * @returns Query hook with { show, template_key }
 */
export const useFreeSpinApplyEntry = () => {
  const user = useBoundStore((state) => state.user);
  return useQuery({
    queryKey: FREE_SPIN_APPLY_ENTRY_KEY,
    queryFn: () => getFreeSpinApplyEntry(),
    select: (res) => res?.data as { show: number; template_key: string; next_apply_at?: number } | undefined,
    enabled: !!user,
    refetchInterval: 30 * 1000,
  });
};

/**
 * Hook for submitting a Free Spins apply request
 * @returns Mutation hook for applying free spins
 */
export const useApplyFreeSpin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => applyFreeSpin(),
    onSuccess: (result) => {
      if (result.code === 0) {
        // 触发常驻 FreeSpinContainerV2 重新拉取最早 pending 记录 → 自动弹领取弹窗
        void queryClient.invalidateQueries({ queryKey: ["earliestPendingRecord"] });
        // 申请后入口应消失
        void queryClient.invalidateQueries({ queryKey: FREE_SPIN_APPLY_ENTRY_KEY });
      }
    },
  });
};
