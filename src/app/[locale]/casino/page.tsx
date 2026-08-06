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
  baseConfig: ["public", "baseConfig"] as const,
  casinoHomeGameList: ["public", "casinoHomeGameList"] as const,
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

const primeCasinoAboveFoldCaches = (queryClient: QueryClient, payload: AggregationPayload | null) => {
  if (!payload) return;

  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.baseConfig, payload.base_url);
  setApiResponse(queryClient, ["baseConfig"], payload.base_url);
  setApiResponse(queryClient, PUBLIC_QUERY_KEYS.casinoHomeGameList, payload.game_home_cache);
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const queryClient = new QueryClient();
  const { locale: requestedLocale } = await params;
  const locale = requestedLocale || defaultLocale;

  try {
    const aggregationResponse = await getAggregationConfig(locale);
    // Keep SSR focused on above-the-fold dependencies. The full aggregation
    // payload is still bootstrapped client-side by AppBootstrapEffects.
    primeCasinoAboveFoldCaches(queryClient, getAggregationPayload(aggregationResponse));
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
