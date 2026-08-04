import { GameCarousel } from "@/components/ui/GameCarousel";
import { LazySection } from "@/components/ui/LazySection";
import { useMqttTopicMessages, useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { useAggregationConfig } from "@/hooks/api/usePublic";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref } from "@/lib/navigation";
import { cn } from "@/utils/cn";
import { ChevronsRight, Trophy, Tv } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

type MatchOdds = {
  home: string;
  draw: string;
  away: string;
};

const slugifyBetbyPathSegment = (value?: string) => {
  const normalized = (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "unknown";
};

const TEAM_KIT_MASK_SVG = "/images/common/betby_cloth.svg";
const TEAM_KIT_COLOR_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["22c55e", "ef4444"],
  ["0ea5e9", "f97316"],
  ["a855f7", "facc15"],
  ["14b8a6", "ec4899"],
  ["3b82f6", "f43f5e"],
  ["84cc16", "8b5cf6"],
  ["06b6d4", "f59e0b"],
  ["10b981", "e11d48"],
];

type TeamSide = "home" | "away";

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildTeamIdentity = (sportName: string, teamName: string) => {
  const sportKey = slugifyBetbyPathSegment(sportName);
  const teamKey = slugifyBetbyPathSegment(teamName);
  return `${sportKey}-${teamKey}`;
};

const getTeamKitColor = (matchId: string, side: TeamSide) => {
  if (TEAM_KIT_COLOR_PAIRS.length === 0) {
    return "60a5fa";
  }

  const pairIndex = hashString(matchId) % TEAM_KIT_COLOR_PAIRS.length;
  const colorPair = TEAM_KIT_COLOR_PAIRS[pairIndex];
  return side === "home" ? colorPair[0] : colorPair[1];
};

const getTeamKitAvatarUrl = ({
  matchId,
  sportName,
  teamName,
  side,
}: {
  matchId: string;
  sportName: string;
  teamName: string;
  side: TeamSide;
}) => {
  const identity = teamName && teamName !== "-" ? buildTeamIdentity(sportName, teamName) : `${matchId}-${side}`;
  const backgroundColor = getTeamKitColor(matchId, side);
  const seed = encodeURIComponent(identity);

  return `https://api.dicebear.com/9.x/glass/svg?seed=${seed}&backgroundColor=${backgroundColor}`;
};

const TeamKitAvatar = ({
  matchId,
  sportName,
  teamName,
  side,
  className,
}: {
  matchId: string;
  sportName: string;
  teamName: string;
  side: TeamSide;
  className?: string;
}) => {
  const avatarUrl = getTeamKitAvatarUrl({ matchId, sportName, teamName, side });

  return (
    <span
      className={cn("block w-5 h-6 shrink-0 bg-base-200/40", className)}
      style={{
        backgroundImage: `url(${avatarUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        WebkitMaskImage: `url(${TEAM_KIT_MASK_SVG})`,
        maskImage: `url(${TEAM_KIT_MASK_SVG})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
      role="img"
      aria-label={teamName}
    />
  );
};

const SPORTS_ICON_BASE_PATH = "/images/sports-icons";
const DEFAULT_SPORT_ICON = `${SPORTS_ICON_BASE_PATH}/soccer.svg`;

const SPORT_ICON_KEYS = new Set([
  "american-football",
  "australian-football",
  "baseball",
  "basketball",
  "boxing",
  "chess",
  "cricket",
  "cycling",
  "darts",
  "ebasketball-blitz",
  "ebasketball",
  "ecricket-x-battle-bats",
  "ecricket",
  "efighting",
  "ehorse-racing",
  "esoccer-penalty",
  "esoccer-volta",
  "esoccer-x-battle-fc",
  "esoccer",
  "etennis",
  "evaquejada",
  "floorball",
  "footvolley",
  "formula-1",
  "formula-2",
  "futsal",
  "golf",
  "handball",
  "ice-hockey",
  "indy-racing",
  "kabaddi",
  "mixed-martial-arts",
  "nascar",
  "predictions",
  "pro-wrestling",
  "rowing",
  "rugby-league",
  "rugby-union",
  "snooker",
  "soccer",
  "speedway",
  "table-tennis",
  "tennis",
  "teqball",
  "touring-car-racing",
  "volleyball",
  "water-polo",
]);

const ESPORT_ICON_KEYS = new Set([
  "counter-strike",
  "cricket-24",
  "crossfire",
  "dota-2",
  "esports-hub",
  "fc-26",
  "king-of-glory",
  "league-of-legends",
  "mobile-legends",
  "nba-2k26",
  "overwatch-2",
  "pubg",
  "rainbow-six",
  "valorant",
  "world-of-tanks",
]);

const SPORT_ICON_ALIASES: Record<string, string> = {
  football: "soccer",
  formula1: "formula-1",
  "formula-1-racing": "formula-1",
  mma: "mixed-martial-arts",
  "e-soccer": "esoccer",
  "e-basketball": "ebasketball",
  "e-cricket": "ecricket",
  "e-tennis": "etennis",
  "e-horse-racing": "ehorse-racing",
};

const resolveSportIconSrc = (sportName?: string, tournamentName?: string) => {
  const sportKey = slugifyBetbyPathSegment(sportName);
  const tournamentKey = slugifyBetbyPathSegment(tournamentName);
  const mappedSportKey = SPORT_ICON_ALIASES[sportKey] ?? sportKey;

  if (SPORT_ICON_KEYS.has(mappedSportKey)) {
    return `${SPORTS_ICON_BASE_PATH}/${mappedSportKey}.svg`;
  }

  if (ESPORT_ICON_KEYS.has(tournamentKey)) {
    return `${SPORTS_ICON_BASE_PATH}/${tournamentKey}.svg`;
  }

  if (ESPORT_ICON_KEYS.has(mappedSportKey)) {
    return `${SPORTS_ICON_BASE_PATH}/${mappedSportKey}.svg`;
  }

  if (mappedSportKey.includes("esport")) {
    return `${SPORTS_ICON_BASE_PATH}/esports-hub.svg`;
  }

  return DEFAULT_SPORT_ICON;
};

const buildBetbyPath = (item: BetbyBannerItem, index: number) => {
  const { descriptor, directPath: parsedDirectPath } = parseBetbyBannerContent(item.content);
  const directPath = item.path ?? item.url ?? parsedDirectPath ?? descriptor.path ?? descriptor.url;
  if (typeof directPath === "string" && directPath.trim()) {
    const path = directPath.trim();
    return path.startsWith("/") ? path : `/${path}`;
  }

  const competitors = Array.isArray(descriptor.competitors) ? descriptor.competitors : [];
  const homeTeam = competitors[0]?.name;
  const awayTeam = competitors[1]?.name;
  const matchId = String(descriptor.id ?? item.match_id ?? item.id ?? `match-${index}`);

  return `/${slugifyBetbyPathSegment(descriptor.sport?.name)}/${slugifyBetbyPathSegment(
    descriptor.category?.name,
  )}/${slugifyBetbyPathSegment(item.tournament_name ?? descriptor.tournament?.name)}/${slugifyBetbyPathSegment(
    homeTeam,
  )}-${slugifyBetbyPathSegment(awayTeam)}-${matchId}`;
};

type MatchCard = {
  id: string;
  sportName: string;
  country: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  isLive: boolean;
  scheduledAtMs?: number;
  odds: MatchOdds;
  btPath: string;
  iconSrc: string;
};

type BetbyBannerCompetitor = {
  name?: string;
};

type BetbyBannerContent = {
  id?: string | number;
  sport?: {
    name?: string;
  };
  category?: {
    name?: string;
  };
  tournament?: {
    name?: string;
  };
  scheduled?: number | string;
  competitors?: BetbyBannerCompetitor[];
  market?: unknown;
  url?: string;
  path?: string;
  status?: string | number;
  state?: string | number;
  is_live?: boolean | number | string;
  live?: boolean | number | string;
  in_play?: boolean | number | string;
  inplay?: boolean | number | string;
  start_time?: number | string;
  starts_at?: number | string;
  kickoff?: number | string;
};

type BetbyMatchUpdatePayload = {
  language?: string;
  match_count?: number | string;
  timestamp?: number | string;
};

const BETBY_MATCH_UPDATE_TOPIC = "public/betby/match_update";

type BetbyBannerContentPatchEntry = [unknown, unknown];

type ParsedBetbyBannerContent = {
  descriptor: BetbyBannerContent;
  marketSource: unknown;
  directPath?: string;
};

type BetbyBannerItem = {
  id?: number | string;
  match_id?: number | string;
  scheduled_time?: number | string;
  tournament_name?: string;
  content?: unknown;
  url?: string;
  path?: string;
  status?: string | number;
  state?: string | number;
  is_live?: boolean | number | string;
  live?: boolean | number | string;
  in_play?: boolean | number | string;
  inplay?: boolean | number | string;
  start_time?: number | string;
  starts_at?: number | string;
  kickoff?: number | string;
};

const BETBY_LANG_REGEX = /^[a-zA-Z-]{1,10}$/;

const normalizeBetbyLang = (lang?: string) => {
  const rawLang = lang?.trim() ?? "";
  if (!BETBY_LANG_REGEX.test(rawLang)) {
    return "en";
  }

  return rawLang.toLowerCase();
};

const normalizeMqttLang = (lang?: string) => {
  const normalized = normalizeBetbyLang(lang).replace(/_/g, "-");

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  if (normalized === "zh" || normalized.startsWith("zh-")) {
    return "zh-cn";
  }

  return normalized;
};

const parseBetbyMatchUpdatePayload = (payload: string): BetbyMatchUpdatePayload | null => {
  try {
    const parsed = JSON.parse(payload);
    return isObjectRecord(parsed) ? (parsed as BetbyMatchUpdatePayload) : null;
  } catch {
    return null;
  }
};

const extractOddsFromMarket = (market: unknown): MatchOdds => {
  const odds: string[] = [];

  const walk = (node: unknown) => {
    if (odds.length >= 3 || node == null) {
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    if (typeof node !== "object") {
      return;
    }

    const record = node as Record<string, unknown>;
    const oddValue = record.k;
    if (typeof oddValue === "string" || typeof oddValue === "number") {
      odds.push(String(oddValue));
    }

    Object.values(record).forEach(walk);
  };

  walk(market);

  return {
    home: odds[0] ?? "-",
    draw: odds[1] ?? "-",
    away: odds[2] ?? "-",
  };
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const parseBetbyBannerContent = (content: unknown): ParsedBetbyBannerContent => {
  if (!Array.isArray(content)) {
    const descriptor = isObjectRecord(content) ? (content as BetbyBannerContent) : {};
    return {
      descriptor,
      marketSource: descriptor.market,
      directPath: typeof descriptor.path === "string" ? descriptor.path : typeof descriptor.url === "string" ? descriptor.url : undefined,
    };
  }

  let descriptor: BetbyBannerContent = {};
  const markets: Record<string, unknown> = {};
  let directPath: string | undefined;

  (content as BetbyBannerContentPatchEntry[]).forEach((entry) => {
    if (!Array.isArray(entry) || entry.length < 2) {
      return;
    }

    const [pathRaw, payload] = entry;
    if (!Array.isArray(pathRaw) || pathRaw.length < 2) {
      return;
    }

    const section = String(pathRaw[1] ?? "");
    if (section === "desc" && isObjectRecord(payload)) {
      descriptor = payload as BetbyBannerContent;
      return;
    }

    if ((section === "path" || section === "url") && typeof payload === "string") {
      directPath = payload;
      return;
    }

    if (section === "market") {
      const marketId = String(pathRaw[2] ?? "");
      if (marketId) {
        markets[marketId] = payload;
      }
    }
  });

  return {
    descriptor,
    marketSource: Object.keys(markets).length > 0 ? markets : descriptor.market,
    directPath,
  };
};

const extractThreeWayOdds = (marketSource: unknown): MatchOdds => {
  if (!isObjectRecord(marketSource)) {
    return extractOddsFromMarket(marketSource);
  }

  const marketOne = marketSource["1"];
  if (!isObjectRecord(marketOne)) {
    return extractOddsFromMarket(marketSource);
  }

  const marketPayload = isObjectRecord(marketOne[""]) ? (marketOne[""] as Record<string, unknown>) : marketOne;
  const home = isObjectRecord(marketPayload["1"]) ? marketPayload["1"].k : undefined;
  const draw = isObjectRecord(marketPayload["2"]) ? marketPayload["2"].k : undefined;
  const away = isObjectRecord(marketPayload["3"]) ? marketPayload["3"].k : undefined;

  if (home == null && draw == null && away == null) {
    return extractOddsFromMarket(marketSource);
  }

  return {
    home: home == null ? "-" : String(home),
    draw: draw == null ? "-" : String(draw),
    away: away == null ? "-" : String(away),
  };
};

const parseBooleanLike = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "live", "inplay", "in-play", "running"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "prematch", "pre-match", "upcoming", "scheduled", "not_started"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

const parseTimestampToMs = (value: unknown): number | undefined => {
  if (typeof value !== "number" && typeof value !== "string") {
    return undefined;
  }

  const normalized = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return undefined;
  }

  return normalized > 1e12 ? normalized : normalized * 1000;
};

const resolveScheduledAtMs = (descriptor: BetbyBannerContent, item: BetbyBannerItem): number | undefined => {
  const candidates: unknown[] = [
    item.scheduled_time,
    descriptor.scheduled,
    descriptor.start_time,
    descriptor.starts_at,
    descriptor.kickoff,
    item.start_time,
    item.starts_at,
    item.kickoff,
  ];

  for (const candidate of candidates) {
    const parsed = parseTimestampToMs(candidate);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  return undefined;
};

const formatScheduledAtLabel = (scheduledAtMs: number | undefined, locale: string): string | null => {
  if (!scheduledAtMs) {
    return null;
  }

  const date = new Date(scheduledAtMs);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const datePart = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart}, ${timePart}`;
};

const resolveMatchLiveState = (descriptor: BetbyBannerContent, item: BetbyBannerItem): boolean => {
  const liveFlagCandidates: unknown[] = [
    descriptor.is_live,
    descriptor.live,
    descriptor.in_play,
    descriptor.inplay,
    item.is_live,
    item.live,
    item.in_play,
    item.inplay,
  ];

  for (const candidate of liveFlagCandidates) {
    const parsed = parseBooleanLike(candidate);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  const statusCandidates: unknown[] = [descriptor.status, descriptor.state, item.status, item.state];
  for (const candidate of statusCandidates) {
    const parsed = parseBooleanLike(candidate);
    if (parsed !== undefined) {
      return parsed;
    }
  }

  return false;
};

const getBetbyBannerItems = (aggregationResponse: unknown): BetbyBannerItem[] => {
  if (!aggregationResponse || typeof aggregationResponse !== "object") {
    return [];
  }

  const responseRecord = aggregationResponse as Record<string, unknown>;
  const responseData = responseRecord.data;
  const dataRecord = responseData && typeof responseData === "object" ? (responseData as Record<string, unknown>) : null;

  const betbyBannerResponse =
    dataRecord?.betby_banners && typeof dataRecord.betby_banners === "object"
      ? (dataRecord.betby_banners as Record<string, unknown>)
      : null;

  if (!betbyBannerResponse || betbyBannerResponse.code !== 0) {
    return [];
  }

  const betbyBannerData = betbyBannerResponse.data;
  return Array.isArray(betbyBannerData) ? (betbyBannerData as BetbyBannerItem[]) : [];
};

const mapBannerToCard = (item: BetbyBannerItem, index: number): MatchCard => {
  const { descriptor, marketSource } = parseBetbyBannerContent(item.content);
  const competitors = Array.isArray(descriptor.competitors) ? descriptor.competitors : [];

  return {
    id: String(descriptor.id ?? item.match_id ?? item.id ?? `betby-${index}`),
    sportName: descriptor.sport?.name ?? "sports",
    country: descriptor.category?.name ?? "-",
    league: item.tournament_name ?? descriptor.tournament?.name ?? "-",
    homeTeam: competitors[0]?.name ?? "-",
    awayTeam: competitors[1]?.name ?? "-",
    isLive: resolveMatchLiveState(descriptor, item),
    scheduledAtMs: resolveScheduledAtMs(descriptor, item),
    odds: extractThreeWayOdds(marketSource),
    btPath: buildBetbyPath(item, index),
    iconSrc: resolveSportIconSrc(descriptor.sport?.name, item.tournament_name ?? descriptor.tournament?.name),
  };
};

export const BetByCarousel = ({ className }: { className?: string }) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const currentMqttLang = useMemo(() => normalizeMqttLang(i18n.language), [i18n.language]);
  const timeLocale = useMemo(() => i18n.language || "en", [i18n.language]);
  const lastHandledTimestampRef = useRef<number>(0);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMqttTopicMessages(BETBY_MATCH_UPDATE_TOPIC, { qos: 0 });
  const { parsedMessages: betbyUpdateMessages } = useMqttTopicMessagesReadonly<BetbyMatchUpdatePayload | null>(
    BETBY_MATCH_UPDATE_TOPIC,
    parseBetbyMatchUpdatePayload,
  );

  const {
    data: aggregationResponse,
    refetch,
    isPending,
  } = useAggregationConfig();

  const scheduleRefetch = useCallback(() => {
    if (refreshTimerRef.current) {
      return;
    }

    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null;
      void refetch();
    }, 500);
  }, [refetch]);

  useEffect(() => {
    const latestMessage = betbyUpdateMessages[0]?.parsed;
    if (!latestMessage) {
      return;
    }

    const messageLang = normalizeMqttLang(latestMessage.language);
    if (messageLang !== currentMqttLang) {
      return;
    }

    const messageTimestamp = parseTimestampToMs(latestMessage.timestamp);
    if (messageTimestamp !== undefined) {
      if (messageTimestamp <= lastHandledTimestampRef.current) {
        return;
      }
      lastHandledTimestampRef.current = messageTimestamp;
    }

    scheduleRefetch();
  }, [betbyUpdateMessages, currentMqttLang, scheduleRefetch]);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const matches = useMemo(() => getBetbyBannerItems(aggregationResponse).map(mapBannerToCard), [aggregationResponse]);

  const showLoadingState = isPending && matches.length === 0;

  if (!showLoadingState && matches.length === 0) {
    return null;
  }

  const handleAllClick = () => {
    router.push(localizeHref(`/sports?${new URLSearchParams({ "bt-path": "/" }).toString()}`));
  };

  const handleMatchClick = (btPath: string) => {
    router.push(localizeHref(`/sports?${new URLSearchParams({ "bt-path": btPath }).toString()}`));
  };

  return (
    <LazySection>
      <GameCarousel className={cn("w-full gap-2", className)}>
        <GameCarousel.Header
          onAllClick={handleAllClick}
          allLabel={
            <div className="flex items-center gap-1">
              {t("casino.all")}
              <ChevronsRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          }
        >
          <Trophy className={"text-primary"} strokeWidth={3} size={16} />
          <p className="text-base font-bold uppercase text-primary">{t(`common:common.sports`)}</p>
          <span className="rounded-sm px-1 italic text-sm text-base-content/60">
            {"<<"}
            {t("common:common.sportsMatchCount", { count: matches.length })}
            {">>"}
          </span>
        </GameCarousel.Header>

        <GameCarousel.Content>
          <GameCarousel.Track className="gap-2 touch-pan-x overflow-y-hidden overscroll-y-none">
            {showLoadingState
              ? Array.from({ length: 1 }).map((_, index) => (
                  <GameCarousel.Item key={`sports-loading-${index}`} className="w-full shrink-0">
                    <div className="w-full h-[130px] rounded-lg p-2 bg-base-200 border-t-2 border-primary/20 flex flex-col animate-pulse">
                      {/* 联赛 + 时间 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-3 w-24 rounded-full bg-base-content/15" />
                        <div className="h-3 w-12 rounded-full bg-base-content/10" />
                      </div>
                      {/* 主队 | 图标 | 客队 */}
                      <div className="grid grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] items-center gap-2 mb-2 flex-1">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-sm bg-base-content/15" />
                          <div className="h-3 w-16 rounded-full bg-base-content/10" />
                        </div>
                        <div className="flex items-center justify-center">
                          <Trophy size={40} className="text-primary/30" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-sm bg-base-content/15" />
                          <div className="h-3 w-16 rounded-full bg-base-content/10" />
                        </div>
                      </div>
                      {/* 赔率 */}
                      <div className="grid grid-cols-3 gap-2 mt-auto">
                        <div className="h-6 rounded-sm bg-base-content/10" />
                        <div className="h-6 rounded-sm bg-base-content/10" />
                        <div className="h-6 rounded-sm bg-base-content/10" />
                      </div>
                    </div>
                  </GameCarousel.Item>
                ))
              : matches.map((match) => (
                  <GameCarousel.Item key={match.id} className="w-full shrink-0">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleMatchClick(match.btPath)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") handleMatchClick(match.btPath);
                      }}
                      className="w-full rounded-lg px-2 py-2 bg-base-200 border-t-2 border-primary/80 shadow-md flex flex-col text-left cursor-pointer"
                    >
                      <div className="flex min-w-0 items-center justify-between gap-2 text-base-content/60 mb-2">
                        <div className="min-w-0 flex items-center gap-1 text-sm font-bold text-primary">
                          <span className="shrink-0">{match.country}</span>
                          <span>/</span>
                          <span className="min-w-0 truncate">{match.league}</span>
                        </div>
                        {match.isLive ? (
                          <div className="text-sm shrink-0 flex items-center gap-1 text-primary font-bold">
                            <Tv className="w-4 h-4 shrink-0" />
                            <span className="">Live</span>
                          </div>
                        ) : formatScheduledAtLabel(match.scheduledAtMs, timeLocale) ? (
                          <span className="shrink-0 text-base-content/60 text-xs">
                            {formatScheduledAtLabel(match.scheduledAtMs, timeLocale)}
                          </span>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_60px_minmax(0,1fr)] items-center gap-2 text-sm font-bold text-base-content mb-2">
                        <div className="min-w-0 flex flex-col items-center gap-1">
                          <TeamKitAvatar matchId={match.id} sportName={match.sportName} teamName={match.homeTeam} side="home" />
                          <p className="w-full min-w-0 truncate text-center text-sm">{match.homeTeam}</p>
                        </div>
                        <div className="flex items-center justify-center">
                          <span
                            role="img"
                            aria-label={match.sportName}
                            className="w-[48px] h-[48px] text-base-content/40 bg-current animate-bob-pause"
                            style={{
                              WebkitMaskImage: `url(${match.iconSrc})`,
                              maskImage: `url(${match.iconSrc})`,
                              WebkitMaskRepeat: "no-repeat",
                              maskRepeat: "no-repeat",
                              WebkitMaskPosition: "center",
                              maskPosition: "center",
                              WebkitMaskSize: "contain",
                              maskSize: "contain",
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex flex-col items-center justify-end gap-1">
                          <TeamKitAvatar matchId={match.id} sportName={match.sportName} teamName={match.awayTeam} side="away" />
                          <p className="w-full min-w-0 truncate text-center text-sm">{match.awayTeam}</p>
                        </div>
                      </div>

                      <div className="w-full min-w-0 grid grid-cols-3 gap-2 mt-auto">
                        <div className="min-w-0 h-7 rounded-sm px-2 bg-primary/10 text-base-content flex items-center justify-between">
                          <span className="text-sm font-bold text-base-content">1</span>
                          <span className="text-sm font-bold text-primary">{match.odds.home}</span>
                        </div>
                        <div className="min-w-0 h-7 rounded-sm px-2 bg-primary/10 text-base-content flex items-center justify-between">
                          <span className="text-sm font-bold text-base-content">{t("common:common.draw", { defaultValue: "Draw" })}</span>
                          <span className="text-sm font-bold text-primary">{match.odds.draw}</span>
                        </div>
                        <div className="min-w-0 h-7 rounded-sm px-2 bg-primary/10 text-base-content flex items-center justify-between">
                          <span className="text-sm font-bold text-base-content">2</span>
                          <span className="text-sm font-bold text-primary">{match.odds.away}</span>
                        </div>
                      </div>
                    </div>
                  </GameCarousel.Item>
                ))}
          </GameCarousel.Track>
          <GameCarousel.Fade />
        </GameCarousel.Content>
      </GameCarousel>
    </LazySection>
  );
};
