import { cn } from "@/utils/cn";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon.tsx";
import { Decimal } from "decimal.js";

export const BetRowSkeleton = () => (
  <div className="px-3 sm:px-6 py-3 sm:py-3 bg-base-200 rounded-field mb-1">
    <div className="grid grid-cols-[0.75fr_0.75fr_0.5fr_1fr] gap-4 items-center">
      <div className="skeleton h-4 w-full rounded-sm"></div>
      <div className="skeleton h-4 w-full rounded-sm"></div>
      <div className="skeleton h-4 w-full rounded-sm"></div>
      <div className="flex justify-end">
        <div className="skeleton h-4 w-full rounded-sm"></div>
      </div>
    </div>
  </div>
);

interface BetRowProps {
  bet: any;
  index: number;
  format: (amount: number, currency: string, opts: any) => { formatted: string };
  onClick: (bet: any) => void;
}

export const BetRow = ({ bet, index, format, onClick }: BetRowProps) => {
  const winAmount = bet.real_win_amount || bet.win_amount || 0;
  const betAmount = bet.real_bet_amount || bet.bet_amount || 0;
  const currency = bet.real_currency || bet.currency || "USD";
  const multiplier = Number(betAmount) > 0 ? Number(winAmount) / Number(betAmount) : null;
  return (
    <div
      key={bet._uniqueKey || `fallback-${bet.id || index}-${bet.nickname}`}
      className="px-2 py-2 hover:bg-base-200/90 transition-colors cursor-pointer bg-base-200 rounded-lg mb-1"
      onClick={() => onClick(bet)}
    >
      <div className="grid grid-cols-[0.75fr_0.75fr_0.5fr_1fr] gap-4 items-center">
        {/* Game */}
        <div className="font-bold text-base-content text-xs min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 min-w-0 w-full overflow-hidden">
            {/*<Iconify icon={`custom:${gameCategory}`} className="min-w-4 min-h-4" />*/}
            <p className="truncate font-bold min-w-0 w-full">{bet.game_name}</p>
          </div>
        </div>

        {/* User */}
        <div className="text-base-content/70 text-xs min-w-0 font-bold">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold">{bet.nickname || '--'}</p>
          </div>
        </div>

        {/* Multiplier */}
        <div className="text-xs min-w-0">
          <span className="truncate italic text-base-content/70">
            {`${Decimal(multiplier ?? 0).toDP(2, Decimal.ROUND_DOWN)}x`}
          </span>
        </div>

        {/* Profit */}
        <div className="text-end text-xs min-w-0">
          <div className="flex items-center gap-1 justify-end">
            <span
              className={cn("truncate text-xs font-bold", winAmount > 0 ? "text-primary" : "text-base-content/50")}>
              {winAmount > 0 ? "+" : ""}
              {format(winAmount, currency, {
                compact: true,
                showCode: false,
                showSymbol: true,
                minimizeDecimals: true
              }).formatted}
            </span>
            <CurrencyIcon currency={currency} className="h-5 w-5 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const getBetOrderRowKey = (bet: Record<string, any>, index: number) => {
  const betId = bet?.id;
  const betCreatedAt = bet?.created_at;
  const stableKey = [
    String(betId),
    String(betCreatedAt ?? ""),
    String(bet?.nickname ?? ""),
    String(bet?.game_name ?? ""),
  ].join("|");
  return betId != null ? `bet-${stableKey}` : `bet-fallback-${stableKey}-${index}`;
};

export const ROW_LIMIT = 10
