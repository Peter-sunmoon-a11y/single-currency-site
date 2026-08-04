import { getBonusWalletRecords, getUserBonusRecords } from "@/services/auth/bonus";
import { getUserCommissionRecords, getUserReferralRecords } from "@/services/auth/referral";
import { getSportsBonusWalletRecords } from "@/services/auth/sportsBonus";
import { getUserLastTournamentInfo } from "@/services/auth/tournament";
import { getUserDepositOrders, getUserSwapRecords, getUserWithdrawOrders } from "@/services/auth/wallet";
import { useBoundStore } from "@/store";
import { useQuery } from "@tanstack/react-query";

export interface TransactionParams {
  status?: string;
  page?: number;
  end_timestamp?: number;
  last_created_at?: number;
  currency?: string;
  limit?: number;
  last_id?: string | number;
}

export interface ClaimLogTransactionParams {
  end_timestamp?: number;
  currency?: string;
  limit?: number;
  page?: number;
  item: "referral" | "group";
}

export interface UseTransactionOptions {
  enabled?: boolean;
}

export const TRANSACTION_PAGE_SIZE = 10;

const buildQueryParams = (params: TransactionParams, options: { includeStatus?: boolean } = { includeStatus: true }) => {
  const size = params.limit ?? TRANSACTION_PAGE_SIZE;
  const queryParams: Record<string, string> = {
    limit: String(size),
  };

  if (params.page) {
    queryParams.page = String(params.page ?? 0);
  }

  if (params.last_id) {
    queryParams.last_id = String(params.last_id ?? 0);
  }

  if (params.last_created_at) {
    queryParams.last_created_at = String(params.last_created_at ?? 0);
  }

  if (options.includeStatus !== false && params.status) {
    queryParams.status = params.status;
  }

  if (params.end_timestamp) {
    queryParams.end_timestamp = String(params.end_timestamp);
  }

  if (params.currency) {
    queryParams.currency = params.currency;
  }

  return queryParams;
};

const buildClaimLogQueryParams = (params: ClaimLogTransactionParams) => {
  const queryParams: Record<string, string> = {
    item: params.item,
    limit: String(params.limit ?? TRANSACTION_PAGE_SIZE),
  };

  if (params.page) {
    queryParams.page = String(params.page);
  }
  if (params.end_timestamp) {
    queryParams.end_timestamp = String(params.end_timestamp);
  }
  if (params.currency) {
    queryParams.currency = params.currency;
  }

  return queryParams;
};

export const useDepositRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["depositRecords", params, user?.id],
    queryFn: () => getUserDepositOrders(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useWithdrawRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["withdrawRecords", params, user?.id],
    queryFn: () => getUserWithdrawOrders(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useBonusRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["bonusRecords", params, user?.id],
    queryFn: () => getUserBonusRecords(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useBonusWalletRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["bonusWalletRecords", params, user?.id],
    queryFn: () => getBonusWalletRecords(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useSportsBonusWalletRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["sportsBonusWalletRecords", params, user?.id],
    queryFn: () => getSportsBonusWalletRecords(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useSwapRecords = (params: TransactionParams, options?: UseTransactionOptions) => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["swapRecords", params, user?.id],
    queryFn: () => getUserSwapRecords(buildQueryParams(params)),
    enabled: !!user && (options?.enabled ?? true),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useReferralRecords = (params: Omit<ClaimLogTransactionParams, "item">, options?: UseTransactionOptions) => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["referralRecords", params, user?.id],
    queryFn: () => getUserReferralRecords(buildClaimLogQueryParams({ ...params, item: "referral" })),
    enabled: !!user && (options?.enabled ?? true),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useCommissionRecords = (params: Omit<ClaimLogTransactionParams, "item">, options?: UseTransactionOptions) => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["commissionRecords", params, user?.id],
    queryFn: () => getUserCommissionRecords(buildClaimLogQueryParams({ ...params, item: "group" })),
    enabled: !!user && (options?.enabled ?? true),
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useLastTournamentInfo = (tournament_id: string) => {
  const user = useBoundStore((state) => state.user);

  return useQuery({
    queryKey: ["lastTournamentInfo", tournament_id],
    queryFn: () => getUserLastTournamentInfo(tournament_id),
    enabled: !!user,
  });
};
