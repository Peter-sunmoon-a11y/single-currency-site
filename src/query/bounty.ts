import {
  getBountyChallengeList,
  getBountyMyWinList,
  getBountyStatus,
  type BountyClaimStatus,
  type BountySortBy,
  type BountyTab,
} from "@/services/auth/bounty";
import { useBoundStore } from "@/store";
import { hasAuth } from "@/utils/auth.ts";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const BOUNTY_QUERY_KEYS = {
  status: ["bounty", "status"] as const,
  challengeList: ["bounty", "challenge-list"] as const,
  myWinList: ["bounty", "my-win-list"] as const,
};

export interface BountyWinner {
  winner_id: number;
  username?: string;
  avatar?: string;
  slot_no?: number;
  settle_at?: number;
  bet_multiplier?: number;
  bet_amount?: number;
  bet_currency?: string;
  claim_status?: number;
  claimed_at?: number;
}

export interface BountyChallengeItem {
  winner_id: number;
  bounty_name: string;
  inner_game_id: string;
  game_provider: string;
  display_game_name: string;
  image: string;
  multiplier: number;
  min_bet_amount: number;
  min_bet_currency: string;
  winner_slots: number;
  completed_count: number;
  reward_amount: number;
  reward_currency: string;
  status: number;
  status_label: string;
  winner?: BountyWinner;
}

export interface BountyMyWinItem {
  winner_id: number;
  number: string;
  bounty_name: string;
  inner_game_id: string;
  game_provider: string;
  display_game_name: string;
  image: string;
  multiplier: number;
  winner_slots: number;
  completed_count: number;
  min_bet_amount: number;
  min_bet_currency: string;
  slot_no: number;
  bet_multiplier: number;
  bet_amount: number;
  bet_currency: string;
  settle_at: number;
  reward_amount: number;
  reward_currency: string;
  claim_amount: number;
  claim_currency: string;
  claim_status: number;
  claimed_at: number;
}

export interface BountyPagedData<T> {
  count: number;
  page: number;
  limit: number;
  list: T[];
}

export const DEFAULT_LIMIT = 5;

export function useBountyStatus() {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: BOUNTY_QUERY_KEYS.status,
    queryFn: () => getBountyStatus(),
    enabled: !!user && hasAuth(),
    refetchOnMount: true,
  });
}

export function useBountyChallengeList(params: {
  tab: BountyTab;
  sortBy: BountySortBy;
  keyword: string;
  limit?: number;
  enabled?: boolean;
}) {
  const user = useBoundStore((state) => state.user);
  const limit = params.limit ?? DEFAULT_LIMIT;

  return useInfiniteQuery({
    queryKey: [...BOUNTY_QUERY_KEYS.challengeList, params.tab, params.sortBy, params.keyword, limit],
    queryFn: async ({ pageParam = 1 }) => {
      return getBountyChallengeList({
        page: Number(pageParam),
        limit,
        sort_by: params.sortBy,
        sort_order: "desc",
        tab: params.tab,
        keyword: params.keyword || undefined,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const data = lastPage?.data as BountyPagedData<BountyChallengeItem> | undefined;
      if (!data) return undefined;
      const loaded = (data.page || 1) * (data.limit || limit);
      return loaded < (data.count || 0) ? (data.page || 1) + 1 : undefined;
    },
    enabled: !!user && hasAuth() && (params.enabled ?? true),
  });
}

export function useBountyMyWinList(params: { claimStatus: BountyClaimStatus; limit?: number; enabled?: boolean }) {
  const user = useBoundStore((state) => state.user);
  const limit = params.limit ?? DEFAULT_LIMIT;

  return useInfiniteQuery({
    queryKey: [...BOUNTY_QUERY_KEYS.myWinList, params.claimStatus, limit],
    queryFn: async ({ pageParam = 1 }) => {
      return getBountyMyWinList({
        page: Number(pageParam),
        limit,
        claim_status: params.claimStatus,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const data = lastPage?.data as BountyPagedData<BountyMyWinItem> | undefined;
      if (!data) return undefined;
      const loaded = (data.page || 1) * (data.limit || limit);
      return loaded < (data.count || 0) ? (data.page || 1) + 1 : undefined;
    },
    enabled: !!user && hasAuth() && (params.enabled ?? true),
  });
}
