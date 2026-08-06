import { apiConfig } from "@/lib/env";
import { defaultLocale } from "@/lib/i18n/config";
import { generateLocalizedMetadata } from "@/lib/seo";
import { getBannerContentList } from "@/services/public/banner";
import type { ApiResponse } from "@/types/auth";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import ClientPage from "./ClientPage";

export const revalidate = 30;
export const generateMetadata = (props: { params: Promise<{ locale: string }> }) => generateLocalizedMetadata(props, "/casino");

const PUBLIC_QUERY_KEYS = {
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
  greatestBets: ["public", "greatestBets"] as const,
  depositBonusConfig: ["public", "depositBonusConfig"] as const,
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
  "get_payment_icons",
] as const;

type AggregationField = (typeof AGGREGATION_FIELDS)[number];
type AggregationPayload = Partial<Record<AggregationField, ApiResponse<any>>>;

const getAggregationConfig = async (lang: string): Promise<ApiResponse<any>> => {
  const url = new URL("/TelegramBot/baseUrlAgg", apiConfig.url);
  url.searchParams.set("lang", lang);

  const response = await fetch(url, {
    next: { revalidate },
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Aggregation bootstrap failed: ${response.status}`);
  }

  return response.json();
};

const getAggregationPayload = (aggregationResponse?: ApiResponse<any> | AggregationPayload | null): AggregationPayload | null => {
  if (!aggregationResponse || typeof aggregationResponse !== "object") return null;

  const hasAggregationField = (value: unknown) =>
    Boolean(value && typeof value === "object" && AGGREGATION_FIELDS.some((field) => field in (value as Record<string, unknown>)));

  const responseData = (aggregationResponse as ApiResponse<any>)?.data;
  if (hasAggregationField(responseData)) {
    return responseData as AggregationPayload;
  }

  if (hasAggregationField(aggregationResponse)) {
    return aggregationResponse as AggregationPayload;
  }

  return null;
};

const setApiResponse = (queryClient: QueryClient, key: readonly unknown[], response?: ApiResponse<any>) => {
  if (!response || response.code !== 0) return;
  queryClient.setQueryData(key, response);
};

const setApiData = (queryClient: QueryClient, key: readonly unknown[], response?: ApiResponse<any>) => {
  if (!response || response.code !== 0) return;
  queryClient.setQueryData(key, response.data);
};

const primeAggregationCaches = (queryClient: QueryClient, payload: AggregationPayload | null, aggregationLang: string) => {
  if (!payload) return;

  setApiData(queryClient, PUBLIC_QUERY_KEYS.languages, payload.language_list);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.baseConfig, payload.base_url);
  setApiResponse(queryClient, ["baseConfig"], payload.base_url);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.casinoHomeGameList, payload.game_home_cache);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.gameProviders, payload.get_providers_v1);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.chatwootInboxId, payload.inbox_id);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.depositBonusConfig, payload.deposit_bonus_config);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.supportedGameCurrencies, payload.game_currency);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.supportedSettlementCurrencies, payload.currency);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.greatestGameOrder, payload.big_win_list);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.greatestBets, payload.big_win_list);
  setApiResponse(queryClient, [...PUBLIC_QUERY_KEYS.latestWins, aggregationLang], payload.newest_v3);
  setApiResponse(queryClient, ["paymentIcons"], payload.get_payment_icons);
  setApiResponse(queryClient, ["countryCodeByIp"], payload.country_code);
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const queryClient = new QueryClient();
  const { locale: requestedLocale } = await params;
  const locale = requestedLocale || defaultLocale;

  try {
    const aggregationResponse = await getAggregationConfig(locale);
    queryClient.setQueryData([...PUBLIC_QUERY_KEYS.aggregationConfig, locale], aggregationResponse);
    primeAggregationCaches(queryClient, getAggregationPayload(aggregationResponse), locale);
  } catch {
    // Keep SSR resilient; client-side queries still fetch if server bootstrap fails.
  }

  try {
    const bannerResponse = await getBannerContentList();
    queryClient.setQueryData(["bannerContentList"], bannerResponse);
  } catch {
    // Banner list is a performance hint, not a hard dependency.
  }

  return <ClientPage dehydratedState={dehydrate(queryClient)} />;
}
