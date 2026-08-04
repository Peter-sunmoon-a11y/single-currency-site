import Copy from "@/components/ui/Copy";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import type { BetHistoryRecord } from "@/types/bet-history";
import { cn } from "@/utils/cn";
import { memo } from "react";
import { parseAmount, resolveFirstString, resolveTimestamp } from "./utils";
import Decimal from "decimal.js";

export interface BetHistoryTableProps {
  records: BetHistoryRecord[];
  isLoading?: boolean;
  isFetchingMore?: boolean;
  showNoMore?: boolean;
  emptyMessage?: string;
  showBetId?: boolean;
}

const BetHistoryTableComponent = ({
                                    records,
                                    isLoading,
                                    isFetchingMore,
                                    showBetId = true
                                  }: BetHistoryTableProps) => {
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const renderAmount = (amount: number | undefined, currency?: string, forceNegative?: boolean, prefixPlus?: boolean) => {
    if (amount === undefined || !currency) {
      return "--";
    }

    const value = forceNegative ? -Math.abs(amount) : amount;
    const result = formatWithConversion(value, currency, {
      showSymbol: false,
      showCode: true,
      displayDecimal: 8
    });
    console.info(result);
    if (prefixPlus && value > 0 && !result.formatted.trim().startsWith("+")) {
      return `+${result.formatted}`;
    }

    return result.formatted;
  };

  const renderMobileCards = () => {
    return records.map((record, index) => {
      const gameName = resolveFirstString(record.game_name, record.game, record.game_title, record.gameName) ?? "--";
      const provider = resolveFirstString(record.game_provider, record.provider, record.publisher, record.vendor, record.brand) ?? "--";
      const primaryBetId = resolveFirstString(record.bet_id, record.game_order_id, record.order_id, record.id);
      const betId = primaryBetId ?? "--";
      const currency = resolveFirstString(record.currency, record.asset, record.account_currency, record.real_currency);
      // bet 和 win 需要减去 f6
      const f6Value = new Decimal(record.f6 as string | number || 0);
      const rawBetAmount = parseAmount(
        record.bet_amount ?? record.amount_in ?? record.amountIn ?? record.betIn ?? record.stake ?? record.amount
      );
      const rawWinAmount = parseAmount(
        record.win_amount ?? record.bet_out ?? record.amount_out ?? record.reward ?? record.payout ?? record.winAmount
      );
      const betAmount = rawBetAmount !== undefined ? new Decimal(rawBetAmount).minus(f6Value).toNumber() : undefined;
      const winAmount = rawWinAmount !== undefined ? new Decimal(rawWinAmount).minus(f6Value).toNumber() : undefined;
      const timestamp = resolveTimestamp(
        record.order_time,
        record.created_at,
        record.updated_at,
        record.bet_time,
        record.createdAt,
        record.timestamp
      );

      const rowKey = primaryBetId ?? `${index}-${gameName}`;
      const winColor =
        winAmount && winAmount > 0 ? "text-success" : winAmount && winAmount < 0 ? "text-error" : "text-base-content/50";

      return (
        <div key={rowKey}
             className={cn("rounded-lg p-2 flex flex-col gap-1 bg-base-300 w-full overflow-hidden")}>
          {/* Row 1: game name | provider name */}
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-sm font-bold text-base-content truncate">{gameName}</span>
            </div>
            <span className="text-sm text-base-content truncate font-bold uppercase">{provider}</span>
          </div>

          {/* Row 2 & 3: (bet datetime + order id) | (bet out + bet in + ICON) */}
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-xs text-base-content/50 font-semibold">{timestamp ?? "--"}</span>
            </div>
            <div className="flex items-stretch gap-2 shrink-0">
              {/* Bet */}
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[12px] uppercase text-base-content/35 leading-none">Bet</span>
                <span className="text-sm font-semibold tabular-nums text-base-content/50 leading-none">
                  {renderAmount(betAmount, currency, false)}
                </span>
              </div>
              {/* 分隔线 */}
              <div className="w-px bg-base-content/10 self-stretch" />
              {/* Win */}
              <div className="flex flex-col items-end gap-0.5">
                <span className={cn("text-[12px] uppercase text-base-content/35 leading-none", winColor)}>Win</span>
                <span className={cn("text-sm tabular-nums leading-none", winColor)}>
                  {renderAmount(winAmount, currency, false, true)}
                </span>
              </div>
            </div>
          </div>

          {showBetId && (
            <div className="flex items-center gap-2 justify-between">
              <span className="text-sm text-base-content/50">{betId}</span>
              {primaryBetId && <Copy text={primaryBetId} />}
            </div>
          )}
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

export const BetHistoryTable = memo(BetHistoryTableComponent);
