import { useMqttTopicMessages } from "@/contexts/mqtt";
import { useSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { getAggregationPayload, PUBLIC_QUERY_KEYS, useBaseConfig, useRtpFourHourSnapshot, useRtpThreeDaySummary } from "@/hooks/api/usePublic";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { GameImage } from "@/components/ui/GameImage";
import { NothingFound } from "@/components/ui/NothingFound";
import clsx from "clsx";
import { ChartNoAxesCombined, ChevronRight, Rocket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { Decimal } from "decimal.js";
import { queryClient } from "@/integrations/tanstack-query/root-provider.tsx";
import { getAggregationConfig } from "@/services/public/config";
import type { ApiResponse } from "@/types/auth";
import { buildHref } from "@/lib/navigation.ts";

type RtpView = "fourHour" | "threeDay";
type SortValue = "highest" | "lowest";

type NormalizedRtpRow = {
  key: string;
  innerGameId: string;
  title: string;
  image: string;
  provider: string;
  trendItems: Array<{ label: string; value: string }>;
  rtp: number;
  betInUsdt: number;
  betOutUsdt: number;
  original: Record<string, any>;
};

const RTP_TOPIC = "public/rtp/4h";
const TOP_LIMIT = 35;

const isRtpEnabledFromBaseConfig = (baseConfig?: ApiResponse<any> | null) => {
  const switchValue = baseConfig?.data?.bonus_switch?.rtp_activity;
  if (typeof switchValue === "number") return switchValue !== 0;

  return baseConfig?.data?.rtp_activity !== 0;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const pickString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,|/]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeTrendLabel = (value: string) => {
  const normalized = value.trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (!normalized) return "";

  const lower = normalized.toLowerCase();
  if (lower === "auto") return "Auto";
  if (lower === "manual") return "Manual";
  if (lower === "turbo") return "Turbo";
  if (lower === "quick" || lower === "quick spin") return "Quick";
  if (lower === "skip animation" || lower === "skip animations" || lower === "skip") return "Skip Animation";

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

const extractArrayPayload = (payload: unknown): Record<string, any>[] => {
  if (Array.isArray(payload)) return payload.filter((item): item is Record<string, any> => Boolean(item && typeof item === "object"));
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, any>;
  const candidateKeys = ["data", "list", "items", "rows", "games", "records", "result"];

  for (const key of candidateKeys) {
    const nested = extractArrayPayload(record[key]);
    if (nested.length > 0) return nested;
  }

  return [];
};

const extractTrendItems = (value: unknown): Array<{ label: string; value: string }> => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractTrendItems(item));
  }

  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];

    const match = text.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
    if (match) {
      const label = normalizeTrendLabel(match[1] ?? "");
      const count = match[2] ?? "";
      return label && count ? [{ label, value: `${label} ${count}` }] : [];
    }

    return toStringArray(value).flatMap((item) => extractTrendItems(item));
  }

  if (typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  const explicitLabel = pickString(record.label, record.name, record.mode, record.key, record.title, record.type);
  const explicitCount = pickString(record.count, record.value, record.total, record.times, record.num);

  if (explicitLabel && explicitCount) {
    const label = normalizeTrendLabel(explicitLabel);
    return label ? [{ label, value: `${label} ${explicitCount}` }] : [];
  }

  const knownKeyLabels: Array<[string, string]> = [
    ["auto", "Auto"],
    ["manual", "Manual"],
    ["turbo", "Turbo"],
    ["quick", "Quick"],
    ["quick_spin", "Quick"],
    ["skip_animation", "Skip Animation"],
    ["skip_animations", "Skip Animation"],
    ["skip", "Skip Animation"]
  ];

  const mappedItems = knownKeyLabels.flatMap(([key, label]) => {
    const raw = record[key];
    const count = typeof raw === "number" ? String(raw) : (typeof raw === "string" ? raw.trim() : "");
    return count ? [{ label, value: `${label} ${count}` }] : [];
  });

  if (mappedItems.length > 0) return mappedItems;

  return [];
};

const normalizeRtpRow = (row: Record<string, any>): NormalizedRtpRow => {
  const innerGameId = pickString(row.inner_game_id, row.game_id, row.id, row.game_code, row.slug);
  const provider = pickString(row.provider, row.game_provider, row.publisher, row.game_publisher);
  const title = pickString(row.game_name, row.name, row.title, row.en_name, innerGameId, provider, "Unknown Game");
  const image = pickString(
    row.image,
    row.img,
    row.icon,
    row.picture,
    row.cover,
    row.game_img,
    row.game_image,
    row.game_cover
  );
  const betInUsdt = toNumber(row.bet_in_usdt ?? row.total_bet_usdt ?? row.bet_in ?? row.bet_amount);
  const betOutUsdt = toNumber(row.bet_out_usdt ?? row.total_bet_out_usdt ?? row.bet_out ?? row.payout_amount);
  const rawRtp = toNumber(row.live_rtp ?? row.rtp ?? row.rtp_value ?? row.percent ?? row.value);
  const rtp = rawRtp > 0 ? rawRtp : (betInUsdt > 0 ? (betOutUsdt / betInUsdt) * 100 : 0);
  const key = `${provider || "unknown"}:${innerGameId || title}`;
  const trendItems = [
    row.play_modes,
    row.modes,
    row.mode_list,
    row.play_mode_stats,
    row.trend_items,
    row.trend_boxes,
    row.boxes,
    row.popular_settings
  ]
    .flatMap((item) => extractTrendItems(item))
    .filter((item, index, list) => list.findIndex((candidate) => candidate.value === item.value) === index)
    .slice(0, 3);

  return {
    key,
    innerGameId,
    title,
    image,
    provider,
    trendItems,
    rtp,
    betInUsdt,
    betOutUsdt,
    original: row
  };
};

const mergeRealtimePayload = (
  baseRows: NormalizedRtpRow[],
  messages: Array<{ parsed: unknown }>
) => {
  if (messages.length === 0) return baseRows;

  const merged = new Map(baseRows.map((row) => [row.key, row]));

  for (const message of messages) {
    const updates = extractArrayPayload((message as { parsed?: unknown }).parsed);
    for (const update of updates) {
      const nextRow = normalizeRtpRow(update);
      const previous = merged.get(nextRow.key);
      merged.set(nextRow.key, previous ? normalizeRtpRow({ ...previous.original, ...update }) : nextRow);
    }
  }

  return Array.from(merged.values());
};

const sortRows = (rows: NormalizedRtpRow[], sort: SortValue) => {
  return [...rows].sort((a, b) => (
    sort === "highest" ? b.rtp - a.rtp : a.rtp - b.rtp
  ));
};

function useRelativeUpdatedLabel(timestamp: number | null, t: (key: string, values?: Record<string, any>) => string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!timestamp) return t("updatedFallback");

  const seconds = Math.max(1, Math.floor((now - timestamp) / 1000));
  return `${seconds}s ago`;
}

function RtpSectionCard({
                          row
                        }: {
  row: NormalizedRtpRow;
}) {
  const isHotRtp = row.rtp >= 100;
  return (
    <article className="flex flex-col gap-1">
      <GameImage
        data={row.original}
        game={{
          inner_game_id: row.innerGameId,
          game_provider: row.provider,
          game_name: row.title,
          image: row.image
        }}
        disableNavigation={!row.innerGameId}
        hideLock
        enabledBanGameList
      />
      <div className="flex flex-col gap-1 px-1 py-1 bg-primary/20 rounded-lg">
        <h2 className="text-sm truncate">{row.title}</h2>
        <div className="flex items-center justify-between gap-2">
          <TextBaseContent text={"RTP"} className={"text-xs"} />
          <span
            className={`flex shrink-0 items-center gap-1 text-xs ${isHotRtp ? "text-primary" : "text-base-content"}`}>
            {isHotRtp && <Rocket size={14} className="shrink-0 animate-rocket-fly" />}
            <span>{Decimal(row.rtp).toDP(2, Decimal.ROUND_DOWN).toString()}%</span>
          </span>
        </div>
      </div>
    </article>
  );
}

function RouteComponent() {
  const { t } = useTranslation("rtp");
  const { i18n } = useTranslation();
  const navigate = useAppNavigate();
  const { selectedCurrency } = useSettlementCurrency();
  const { data: baseConfig } = useBaseConfig();
  const [view, setView] = useState<RtpView>("fourHour");
  const [sort, setSort] = useState<SortValue>("highest");

  const isRtpEnabled = isRtpEnabledFromBaseConfig(baseConfig);

  const fourHourQuery = useRtpFourHourSnapshot({
    lang: i18n.language || "en",
    currency: selectedCurrency || undefined
  }, isRtpEnabled);

  const threeDayQuery = useRtpThreeDaySummary({
    lang: i18n.language || "en",
    sort,
    currency: selectedCurrency || undefined
  }, isRtpEnabled);

  const { parsedMessages } = useMqttTopicMessages(
    isRtpEnabled && view === "fourHour" ? RTP_TOPIC : null,
    { qos: 0 }
  );

  const activeQuery = view === "fourHour" ? fourHourQuery : threeDayQuery;
  const activeResponse = activeQuery.data;
  const unavailableMessage = activeResponse?.code === 1 ? (activeResponse.msg || t("unavailable")) : "";

  const rows = useMemo(() => {
    const sourceRows = extractArrayPayload(activeResponse?.data).map(normalizeRtpRow);
    const mergedRows = view === "fourHour" ? mergeRealtimePayload(sourceRows, parsedMessages) : sourceRows;
    return sortRows(mergedRows, sort).slice(0, TOP_LIMIT);
  }, [activeResponse?.data, parsedMessages, sort, view]);

  const lastUpdatedAt = useMemo(() => {
    const latestMqttTimestamp = parsedMessages[0]?.timestamp;
    if (view === "fourHour" && latestMqttTimestamp) return latestMqttTimestamp;
    return activeQuery.dataUpdatedAt || null;
  }, [activeQuery.dataUpdatedAt, parsedMessages, view]);

  const updatedLabel = useRelativeUpdatedLabel(lastUpdatedAt, t);

  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;

  return (
    <div className="flex flex-col gap-4 p-4">
      <section className="relative rounded-lg bg-base-200 p-4 flex flex-col gap-2">
        <p className="text-base font-bold">
          {t("heroTitle")}
        </p>
        <TextBaseContent className="text-base font-bold" text={`- ${t("title")}`} />
        <TextBaseContent text={`- ${t("subtitle")}`} />
        <TextBaseContent text={`- ${t("disclaimer")}`} />

        <button
          className="flex items-center justify-between rounded-lg bg-base-100 p-2 text-sm text-base-content/60"
          onClick={() => void navigate({ to: "/dollars/rtp/qa" })}
        >
          <span>{t("faqTitle")}</span>
          <ChevronRight className="h-4 w-4 text-base-content/45" />
        </button>

        <ChartNoAxesCombined size={200} className={"top-0 right-0 absolute text-primary opacity-10"} />
      </section>

      <div role="tablist" className="tabs tabs-box w-full">
        <button
          role="tab"
          type="button"
          className={clsx("tab flex-1 text-sm font-bold", view === "fourHour" && "tab-active text-primary")}
          onClick={() => setView("fourHour")}
        >
          {t("fourHourTab")}
        </button>
        <button
          role="tab"
          type="button"
          className={clsx("tab flex-1 text-sm font-bold", view === "threeDay" && "tab-active text-primary")}
          onClick={() => setView("threeDay")}
        >
          {t("threeDayTab")}
        </button>
      </div>

      <div className="flex items-center gap-2 justify-between">
        <div className="text-sm italic text-base-content/60">
          {t("updatedLabel", { value: updatedLabel })}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={clsx(
              "btn btn-sm",
              sort === "highest" ? "btn-primary" : "btn-primary btn-soft"
            )}
            onClick={() => setSort("highest")}
          >
            {t("sortHighest")}
          </button>
          <button
            type="button"
            className={clsx(
              "btn btn-sm",
              sort === "lowest" ? "btn-primary" : "btn-primary btn-soft"
            )}
            onClick={() => setSort("lowest")}
          >
            {t("sortLowest")}
          </button>
        </div>
      </div>

      {isRtpEnabled && !unavailableMessage && (
        <>
          {isLoading && (
            <div className="flex items-center justify-center min-h-[50vh]">
              <span className="loading loading-bars loading-sm text-primary" />
            </div>
          )}

          {!isLoading && isError && (
            <NothingFound className="static min-h-[50vh]" text={t("loadFailed")} />
          )}

          {!isLoading && !isError && rows.length === 0 && (
            <NothingFound className="static min-h-[50vh]" text={t("empty")} />
          )}

          {!isLoading && !isError && rows.length > 0 && (
            <div className="grid grid-cols-3 gap-1">
              {rows.map((row) => <RtpSectionCard key={row.key} row={row} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const redirectToCasino = () => {
  const error = new Error("APP_CLIENT_REDIRECT") as Error & { href?: string };
  error.href = String(buildHref({ to: "/casino" }));
  throw error;
};

export const beforeLoad = async () => {
  let baseConfig = queryClient.getQueryData<ApiResponse<any>>(PUBLIC_QUERY_KEYS.baseConfig);

  if (!baseConfig) {
    const aggregationKey = [...PUBLIC_QUERY_KEYS.aggregationConfig, "en"] as const;
    const cachedAggregation = queryClient.getQueryData<ApiResponse<any>>(aggregationKey);
    const cachedPayload = getAggregationPayload(cachedAggregation);
    baseConfig = cachedPayload?.base_url;
  }

  if (!baseConfig) {
    const aggregationResponse = await queryClient.fetchQuery({
      queryKey: [...PUBLIC_QUERY_KEYS.aggregationConfig, "en"],
      queryFn: () => getAggregationConfig("en")
    });
    const aggregationPayload = getAggregationPayload(aggregationResponse);
    baseConfig = aggregationPayload?.base_url;

    if (baseConfig?.code === 0) {
      queryClient.setQueryData(PUBLIC_QUERY_KEYS.baseConfig, baseConfig);
      queryClient.setQueryData(["baseConfig"], baseConfig);
    }
  }

  if (!isRtpEnabledFromBaseConfig(baseConfig)) {
    redirectToCasino();
  }
};

export default RouteComponent;
