import { memo } from "react";
import Iconify from "@/components/iconify/iconify";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Copy from "@/components/ui/Copy";
import { cn } from "@/utils/cn";
import type { BetHistoryRecord } from "@/types/bet-history";
import { parseAmount, resolveFirstString, resolveTimestamp } from "./utils";

import type { BetHistoryTableProps } from "./BetHistoryTable";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { Decimal } from "decimal.js";

interface SportsCompetitorEntry {
  competitor_name?: string;
  tournament_name?: string;
  sport_name?: string;
}

const normalizeCompetitorEntry = (entry: unknown): SportsCompetitorEntry | undefined => {
  if (!entry || typeof entry !== "object") return undefined;
  const node = entry as Record<string, unknown>;
  const competitor = resolveFirstString(node.competitor_name, node.name, node.display_name);
  const tournament = resolveFirstString(node.tournament_name, node.league_name, node.tournament);
  const sport = resolveFirstString(node.sport_name, node.category_name, node.sport);

  if (!competitor && !tournament && !sport) {
    return undefined;
  }

  return {
    competitor_name: competitor,
    tournament_name: tournament,
    sport_name: sport
  };
};

const SPORT_ICON_KEYWORDS: [string[], string][] = [
  [["football", "soccer"],        "custom:football"],
  [["basketball"],                "custom:basketball"],
  [["baseball"],                  "custom:baseball"],
  [["tennis"],                    "custom:tennis"],
  [["ice hockey", "icehockey"],   "custom:ice-hockey"],
  [["volleyball"],                "custom:volleyball"],
  [["formula", "f1"],             "custom:formula1"],
];

const getSportIcon = (sportName?: string): string => {
  if (!sportName) return "";
  const lower = sportName.toLowerCase();
  for (const [keywords, icon] of SPORT_ICON_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw))) return icon;
  }
  return "";
};

const parseCompetitorEntries = (value: unknown): SportsCompetitorEntry[] => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") {
          return {
            competitor_name: entry
          };
        }
        return normalizeCompetitorEntry(entry);
      })
      .filter((entry): entry is SportsCompetitorEntry => Boolean(entry));
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parseCompetitorEntries(parsed);
      }
    } catch {
      const parts = value
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
      if (parts.length) {
        return parts.map((part) => ({ competitor_name: part }));
      }
    }
  }

  return [];
};

const getCompetitorDisplay = (record: BetHistoryRecord, t: ReturnType<typeof useTranslation>["t"]): string => {
  const entries = parseCompetitorEntries(record.competitor_name);
  if (entries.length === 1 && entries[0].competitor_name) {
    return entries[0].competitor_name;
  }
  if (entries.length > 1) {
    return t("transaction:betHistory.parlay", "Parlay");
  }

  const raw = resolveFirstString(record.competitor_name, record.game_name);
  if (raw) {
    const parts = raw
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length === 1) {
      return parts[0];
    }
    if (parts.length > 1) {
      return t("transaction:betHistory.parlay", "Parlay");
    }
  }

  return resolveFirstString(record.game_name, record.bet_id, record.order_id) ?? "--";
};

const getTournamentOrSportDisplay = (record: BetHistoryRecord): string | undefined => {
  const entries = parseCompetitorEntries(record.competitor_name);
  const tournaments = Array.from(
    new Set(
      entries
        .map((entry) => entry.tournament_name)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  );

  if (tournaments.length) {
    return tournaments.join(", ");
  }

  const sports = Array.from(
    new Set(
      entries
        .map((entry) => entry.sport_name)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  );

  if (sports.length) {
    return sports.join(", ");
  }

  return resolveFirstString(record.tournament_name, record.sport_name);
};

const SportsBetHistoryTableComponent = ({
                                          records,
                                          isLoading,
                                          isFetchingMore
                                        }: BetHistoryTableProps) => {
  const { t } = useTranslation(["profile", "transaction"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  console.info(records);
  const renderAmount = (amount: number | undefined, currency?: string, forceNegative?: boolean, prefixPlus?: boolean) => {
    if (amount === undefined || !currency) {
      return "--";
    }
    console.info(amount);
    const value = forceNegative ? -(amount) : amount;
    const result = formatWithConversion(value, currency, {
      showSymbol: false,
      showCode: true,
      minimizeDecimals: true
    });
    console.info(result);
    if (prefixPlus && value > 0 && !result.formatted.trim().startsWith("+")) {
      return `+${result.formatted}`;
    }

    return `${result.formatted}`;
  };

  const renderMobileCards = () => {
    return records.map((record, index) => {
      const competitorDisplay = getCompetitorDisplay(record, t);
      const tournamentDisplay = getTournamentOrSportDisplay(record) ?? "--";
      const entries = parseCompetitorEntries(record.competitor_name);
      const sportIcon = getSportIcon(
        entries.find(e => e.sport_name)?.sport_name
        ?? resolveFirstString(record.sport_name, record.category_name)
      );
      console.info(sportIcon);
      const primaryId = resolveFirstString(record.order_id, record.bet_id, record.game_order_id, record.id);
      const betId = primaryId ?? "--";

      const currency = resolveFirstString(
        record.game_currency,
        record.settlement_currency,
        record.currency,
        record.account_currency
      );

      const betAmount = parseAmount(
        record.game_bet_amount ??
        record.settlement_bet_amount ??
        record.bet_amount ??
        record.amount ??
        record.amount_in ??
        record.amountIn
      );

      const winAmount = parseAmount(
        record.game_win_amount ??
        record.settlement_win_amount ??
        record.win_amount ??
        record.amount_out ??
        record.reward ??
        record.payout
      );

      const timestamp = resolveTimestamp(
        record.order_time,
        record.created_at,
        record.updated_at,
        record.bet_time,
        record.createdAt,
        record.timestamp
      );

      const isPending = record.status === 1 || record.status === "1";
      const rowKey = primaryId ?? `${index}-${competitorDisplay}`;
      const profitAmount = !isPending && winAmount !== undefined && betAmount !== undefined ? Decimal(winAmount).minus(betAmount).toNumber() : winAmount;
      const profitColor =
        isPending
          ? "text-warning"
          : profitAmount && profitAmount > 0
            ? "text-success"
            : profitAmount && profitAmount < 0
              ? "text-error"
              : "text-base-content/70";

      return (
        <div key={rowKey}
             className={cn("rounded-lg p-2 flex flex-col gap-2 bg-base-300 w-full overflow-hidden")}>
          {/* Row 1-2: (match name + tournament) | (bet out + bet in + icon) */}
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-1 min-w-0">
              <Iconify icon={sportIcon} size={16} className="shrink-0 text-base-content/40" />
              <span className="text-sm font-bold text-base-content truncate">{competitorDisplay}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 w-full">
            <span className="bg-base-100 px-1 flex items-center gap-1 text-sm text-base-content/70 truncate italic">
              {tournamentDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs text-base-content/50 font-semibold">{timestamp ?? "--"}</span>
            </div>
            <div className="flex items-stretch gap-1 shrink-0">
              {/* Bet */}
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[12px] uppercase text-base-content/35 leading-none">
                  {t("transaction:betHistory.bet")}
                </span>
                <span className="text-sm font-semibold tabular-nums text-base-content/50 leading-none">
                  {renderAmount(betAmount, currency, false)}
                </span>
              </div>

              {/* 分隔线 */}
              <div className="w-px bg-base-content/20 self-stretch" />

              {/* Profit */}
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[12px] uppercase text-base-content/35 leading-none">
                  {t("transaction:tableHeaders.profit")}
                </span>
                <span className={cn("text-sm tabular-nums leading-none", profitColor)}>
                  {profitAmount !== undefined && profitAmount > 0 && "+"}
                  {renderAmount(profitAmount, currency, false, false)}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: time | bet id */}
          <div className="flex items-center gap-2 justify-between">
            <span className="text-sm text-base-content/50">{betId}</span>
            {primaryId && <Copy text={String(primaryId)} />}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="relative rounded-lg bg-base-200 p-2 min-h-[125px]">
      <div className="space-y-1">
        {renderMobileCards()}
      </div>
      {!isLoading && !isFetchingMore && records.length === 0 && <NothingFound />}
      {(isLoading || isFetchingMore) && <DataLoading />}
    </div>
  );
};

export const SportsBetHistoryTable = memo(SportsBetHistoryTableComponent);
