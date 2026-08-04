import type { ApiResponse } from "@/types/auth";
import {
  dailyCheckInConfig,
  getAggregationConfig,
  getChatwootInboxId,
  getExchangeRates,
  getGameCategories,
  getSupportedGameCurrencies,
  getSupportedLanguages,
  getSupportedSettlementCurrencies,
  getVipConfig
} from "@/services/public/config";
import { getCasinoGameList, getCasinoHomeGameList, getGameDetail, getGameProviders, getGreatestBets, getGreatestGameOrder, getLatestBets, getLatestWins } from "@/services/public/game";
import { getDepositBonusConfig, getLuckyNumberConfig, getMembersDayConfig } from "@/services/public/bonus";
import { getGlobalCommissions } from "@/services/public/referral";
import { getRtpFourHourSnapshot, getRtpThreeDaySummary, type RtpSummarySort } from "@/services/public/rtp";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { decodeRouteParam } from "@/lib/navigation";
import { useIdleEnabled } from "@/hooks/useIdleEnabled";

export const PUBLIC_QUERY_KEYS = {
  languages: ["public", "languages"] as const,
  baseConfig: ["public", "baseConfig"] as const,
  aggregationConfig: ["public", "aggregationConfig"] as const,
  greatestGameOrder: ["public", "greatestGameOrder"] as const,
  supportedGameCurrencies: ["public", "supportedGameCurrencies"] as const,
  supportedSettlementCurrencies: ["public", "supportedSettlementCurrencies"] as const,
  currencyExchangeRate: ["public", "currencyExchangeRate"] as const,
  casinoHomeGameList: ["public", "casinoHomeGameList"] as const,
  gameProviders: ["public", "gameProviders"] as const,
  chatwootInboxId: ["public", "chatwootInboxId"] as const,
  latestWins: ["public", "latestWins"] as const,
  latestBets: ["public", "latestBets"] as const,
  greatestBets: ["public", "greatestBets"] as const,
  casinoGameList: ["public", "casinoGameList"] as const,
  depositBonusConfig: ["public", "depositBonusConfig"] as const,
  luckyNumberConfig: ["public", "luckyNumberConfig"] as const,
  membersDayConfig: ["public", "membersDayConfig"] as const,
  gameCategories: ["public", "gameCategories"] as const,
  vipConfig: ["public", "vipConfig"] as const,
  mainBannerContent: ["public", "mainBannerContent"] as const,
  globalCommissions: ["public", "globalCommissions"] as const,
  dailyCheckInConfig: ["public", "dailyCheckInConfig"] as const,
  rtpFourHourSnapshot: ["public", "rtpFourHourSnapshot"] as const,
  rtpThreeDaySummary: ["public", "rtpThreeDaySummary"] as const
};

const AGGREGATION_FIELDS = [
  "game_home_cache",
  "inbox_id",
  "deposit_bonus_config",
  "language_list",
  "country_code",
  "base_url",
  "game_currency",
  "currency",
  "get_by_group",
  "big_win_list",
  "get_providers_v1",
  "newest_v3",
  "get_payment_icons"
] as const;

export type AggregationField = (typeof AGGREGATION_FIELDS)[number];

export type AggregationPayload = Partial<Record<AggregationField, ApiResponse<any>>>;


export function getAggregationPayload(
  aggregationResponse?: ApiResponse<any> | AggregationPayload | null
): AggregationPayload | null {
  if (!aggregationResponse || typeof aggregationResponse !== "object") return null;

  const hasAggregationField = (value: unknown) =>
    Boolean(
      value &&
      typeof value === "object" &&
      AGGREGATION_FIELDS.some((field) => field in (value as Record<string, unknown>))
    );

  const responseData = (aggregationResponse as ApiResponse<any>)?.data;
  if (hasAggregationField(responseData)) {
    return responseData as AggregationPayload;
  }

  if (hasAggregationField(aggregationResponse)) {
    return aggregationResponse as AggregationPayload;
  }

  return null;
}

/**
 * 获取支持的语言
 * 缓存最大保持30分钟
 * @returns
 */
export function useSupportedLanguages() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.languages,
    queryFn: () => getSupportedLanguages(),
  });
}

/**
 * 基础配置（含 is_league）
 */
export function useBaseConfig() {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const aggregationLang = i18n.language || "en";

  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.baseConfig,
    queryFn: async () => {
      const cachedBaseConfig = queryClient.getQueryData<ApiResponse<any>>(PUBLIC_QUERY_KEYS.baseConfig);
      if (cachedBaseConfig?.code === 0) return cachedBaseConfig;

      const cachedAggregation = queryClient.getQueryData<ApiResponse<any> | AggregationPayload>([
        ...PUBLIC_QUERY_KEYS.aggregationConfig,
        aggregationLang
      ]);
      const cachedPayload = getAggregationPayload(cachedAggregation);
      if (cachedPayload?.base_url?.code === 0) return cachedPayload.base_url;

      const aggregationResponse = await queryClient.fetchQuery({
        queryKey: [...PUBLIC_QUERY_KEYS.aggregationConfig, aggregationLang],
        queryFn: () => getAggregationConfig(aggregationLang),
      });

      const aggregationPayload = getAggregationPayload(aggregationResponse);
      if (aggregationPayload?.base_url?.code === 0) return aggregationPayload.base_url;

      return cachedBaseConfig ?? { code: 0, data: {} };
    },
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false
  });
}

/**
 * 是否启用 League/Tournament 功能
 * is_league === 1 时返回 true
 */
export function useIsLeagueEnabled() {
  const { data: baseConfig, isLoading } = useBaseConfig();
  const isLeagueEnabled = baseConfig?.data?.is_league === 1;
  return { isLeagueEnabled, isLoading };
}

/**
 * 获取最大赢家游戏订单
 * 缓存最大保持10秒
 * @returns
 */
export function useGreatestGameOrder() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.greatestGameOrder,
    queryFn: () => getGreatestGameOrder(),
    retry: 3
  });
}

/**
 * 获取所有支持的游戏币列表
 * 缓存最大保持5分钟
 * @returns
 */
export function useSupportedGameCurrencies() {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const aggregationLang = i18n.language || "en";

  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.supportedGameCurrencies,
    queryFn: async () => {
      const cachedAggregation = queryClient.getQueryData<ApiResponse<any> | AggregationPayload>([
        ...PUBLIC_QUERY_KEYS.aggregationConfig,
        aggregationLang
      ]);
      const cachedPayload = getAggregationPayload(cachedAggregation);
      if (cachedPayload?.game_currency?.code === 0) return cachedPayload.game_currency;

      const aggregationResponse = await queryClient.fetchQuery({
        queryKey: [...PUBLIC_QUERY_KEYS.aggregationConfig, aggregationLang],
        queryFn: () => getAggregationConfig(aggregationLang),
      });

      const aggregationPayload = getAggregationPayload(aggregationResponse);
      if (aggregationPayload?.game_currency?.code === 0) return aggregationPayload.game_currency;

      return getSupportedGameCurrencies();
    },
  });
}

export function useSupportedSettlementCurrencies() {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const aggregationLang = i18n.language || "en";

  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.supportedSettlementCurrencies,
    queryFn: async () => {
      const cachedAggregation = queryClient.getQueryData<ApiResponse<any> | AggregationPayload>([
        ...PUBLIC_QUERY_KEYS.aggregationConfig,
        aggregationLang
      ]);
      const cachedPayload = getAggregationPayload(cachedAggregation);
      if (cachedPayload?.currency?.code === 0) return cachedPayload.currency;

      const aggregationResponse = await queryClient.fetchQuery({
        queryKey: [...PUBLIC_QUERY_KEYS.aggregationConfig, aggregationLang],
        queryFn: () => getAggregationConfig(aggregationLang),
      });

      const aggregationPayload = getAggregationPayload(aggregationResponse);
      if (aggregationPayload?.currency?.code === 0) return aggregationPayload.currency;

      return getSupportedSettlementCurrencies();
    },
  });
}

export function useLuckyNumberConfig() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.luckyNumberConfig,
    queryFn: () => getLuckyNumberConfig(),
  });
}

export function useMembersDayConfig() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.membersDayConfig,
    queryFn: () => getMembersDayConfig(),
  });
}

/**
 * 获取所有币汇率
 * 缓存最大保持1分钟
 * @returns
 */
export function useCurrencyExchangeRate() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.currencyExchangeRate,
    queryFn: () => getExchangeRates(),
  });
}

export function useCasinoHomeGameList() {
  const enabled = useIdleEnabled();

  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.casinoHomeGameList,
    queryFn: () => getCasinoHomeGameList(),
    enabled,
  });
}

/**
 * 获取Casino首页游戏提供商列表
 * 缓存最大保持2分钟
 */
export function useGameProviders() {
  const enabled = useIdleEnabled();

  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.gameProviders,
    queryFn: () => getGameProviders(),
    enabled
  });
}

/**
 * 获取Chatwoot Inbox ID
 * 缓存最大保持2分钟
 */
export function useChatwootInboxId() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.chatwootInboxId,
    queryFn: () => getChatwootInboxId(),
  });
}

/**
 * 获取Latest Wins (只返回赢钱的记录)
 */
export function useLatestWins(lang?: string) {
  const enabled = useIdleEnabled();

  return useQuery({
    queryKey: [...PUBLIC_QUERY_KEYS.latestWins, lang],
    queryFn: () => getLatestWins(lang),
    gcTime: 5 * 60 * 1000,
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: (previousData) => previousData
  });
}

/**
 * 获取Latest Bets (所有投注记录)
 */
export function useLatestBets() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.latestBets,
    queryFn: () => getLatestBets(),
    staleTime: 0,
    gcTime: 0, // 立即垃圾回收，不保留缓存
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
    networkMode: "always", // 始终发起网络请求
    placeholderData: (previousData) => previousData
  });
}

/**
 * 获取Greatest bets
 */
export function useGreatestBets() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.greatestBets,
    queryFn: () => getGreatestBets(),
    staleTime: 0,
    gcTime: 0, // 立即垃圾回收，不保留缓存
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
    networkMode: "always", // 始终发起网络请求
    placeholderData: (previousData) => previousData
  });
}

/**
 * 获取Casino游戏列表
 */
export function useCasinoGameList(data: any, options: any = {}) {
  return useQuery({
    queryKey: [...PUBLIC_QUERY_KEYS.casinoGameList, data],
    queryFn: () => getCasinoGameList(data),
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
    networkMode: "always", // 始终发起网络请求
    ...options
  });
}

/**
 * 获取Casino游戏列表 - 无限滚动版本
 */
export function useCasinoGameListInfinite(baseParams: any, options: any = {}) {
  const pageSize = baseParams?.limit || 24;

  return useInfiniteQuery({
    queryKey: [...PUBLIC_QUERY_KEYS.casinoGameList, "infinite", baseParams],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { ...baseParams, page: pageParam, limit: pageSize };
      return getCasinoGameList(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, allPages: any[]) => {
      const data = lastPage?.data || [];
      // 如果返回的数据少于 pageSize，说明没有更多数据
      if (data.length < pageSize) return undefined;
      return allPages.length + 1;
    },
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options
  });
}

/**
 * Get deposit bonus config
 */
export function useDepositBonusConfig(enabled = true) {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.depositBonusConfig,
    queryFn: () => getDepositBonusConfig(),
    enabled: enabled
  });
}

/**
 * 获取游戏分类列表
 * 缓存最大保持5分钟
 */
export function useGameCategories() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.gameCategories,
    queryFn: () => getGameCategories(),
    retry: 2
  });
}

/**
 * 获取VIP等级配置列表
 * 缓存最大保持10分钟
 */
export function useVipConfig() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.vipConfig,
    queryFn: () => getVipConfig(),
    retry: 2
  });
}

/**
 * 获取全球实时奖励数据
 */
export function useGlobalCommissions() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.globalCommissions,
    queryFn: () => getGlobalCommissions(),
    staleTime: 0,
    gcTime: 0, // 立即垃圾回收，不保留缓存
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1,
    networkMode: "always" // 始终发起网络请求
  });
}

export function useAggregationConfig() {
  const { i18n } = useTranslation();
  const aggregationLang = i18n.language || "en";

  return useQuery({
    queryKey: [...PUBLIC_QUERY_KEYS.aggregationConfig, aggregationLang],
    queryFn: () => getAggregationConfig(aggregationLang),
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
}

export function useAggregationBootstrap() {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const { data: aggregationResponse, isSuccess } = useAggregationConfig();

  useEffect(() => {
    if (!isSuccess) return;

    const aggregationPayload = getAggregationPayload(aggregationResponse);
    if (!aggregationPayload) return;

    const setApiResponse = (key: readonly unknown[], response?: ApiResponse<any>) => {
      if (!response || response.code !== 0) return;
      queryClient.setQueryData(key, response);
    };

    const setApiData = (key: readonly unknown[], response?: ApiResponse<any>) => {
      if (!response || response.code !== 0) return;
      queryClient.setQueryData(key, response.data);
    };

    setApiData(PUBLIC_QUERY_KEYS.languages, aggregationPayload.language_list);
    setApiResponse(PUBLIC_QUERY_KEYS.baseConfig, aggregationPayload.base_url);
    setApiResponse(["baseConfig"], aggregationPayload.base_url);
    setApiResponse(PUBLIC_QUERY_KEYS.casinoHomeGameList, aggregationPayload.game_home_cache);
    setApiResponse(PUBLIC_QUERY_KEYS.gameProviders, aggregationPayload.get_providers_v1);
    setApiResponse(PUBLIC_QUERY_KEYS.chatwootInboxId, aggregationPayload.inbox_id);
    setApiResponse(PUBLIC_QUERY_KEYS.depositBonusConfig, aggregationPayload.deposit_bonus_config);
    setApiResponse(PUBLIC_QUERY_KEYS.supportedGameCurrencies, aggregationPayload.game_currency);
    setApiResponse(PUBLIC_QUERY_KEYS.supportedSettlementCurrencies, aggregationPayload.currency);
    setApiResponse(PUBLIC_QUERY_KEYS.greatestGameOrder, aggregationPayload.big_win_list);
    setApiResponse(PUBLIC_QUERY_KEYS.greatestBets, aggregationPayload.big_win_list);
    setApiResponse(["paymentIcons"], aggregationPayload.get_payment_icons);
    setApiResponse(["countryCodeByIp"], aggregationPayload.country_code);

    if (aggregationPayload.newest_v3?.code === 0) {
      const languageKey = i18n.language || "en";
      queryClient.setQueryData([...PUBLIC_QUERY_KEYS.latestWins, languageKey], aggregationPayload.newest_v3);
    }
  }, [aggregationResponse, i18n.language, isSuccess, queryClient]);
}

export function useDailyCheckInConfig() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.dailyCheckInConfig,
    queryFn: () => dailyCheckInConfig(),
    enabled: true
  });
}

export function useGamingGuide(gameId: string) {
  const decodedGameId = useMemo(() => decodeRouteParam(gameId), [gameId]);
  const parsedGameId = useMemo(() => {
    if (decodedGameId.includes(":")) {
      const [provider, inner_game_id] = decodedGameId.split(":");
      return { provider, inner_game_id };
    }
    return { provider: "", inner_game_id: decodedGameId };
  }, [decodedGameId]);

  return useQuery({
    queryKey: ["gameGuide", parsedGameId.provider, parsedGameId.inner_game_id],
    queryFn: () => getGameDetail(parsedGameId).then(r => r.data),
  });
}

export function useRtpFourHourSnapshot(params: { lang: string; currency?: string }, enabled = true) {
  return useQuery({
    queryKey: [...PUBLIC_QUERY_KEYS.rtpFourHourSnapshot, params.lang, params.currency ?? ""],
    queryFn: () => getRtpFourHourSnapshot(params),
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1,
    networkMode: "always",
    placeholderData: (previousData) => previousData
  });
}

export function useRtpThreeDaySummary(
  params: { lang: string; sort: RtpSummarySort; currency?: string },
  enabled = true
) {
  return useQuery({
    queryKey: [...PUBLIC_QUERY_KEYS.rtpThreeDaySummary, params.lang, params.sort, params.currency ?? ""],
    queryFn: () => getRtpThreeDaySummary(params),
    enabled,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 1,
    networkMode: "always",
    placeholderData: (previousData) => previousData
  });
}
