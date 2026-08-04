import { useTranslation } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import type { ITournamentInfo } from "@/types/tournament";
import { ReactNode } from "react";
import { Medal, SquareArrowOutUpRight } from "lucide-react";
import { RankDisplay } from "@/sections/tournament/tournament-my-progress-v2.tsx";
import Iconify from "@/components/iconify";
import { useAppNavigate } from "@/hooks/useAppNavigate";

interface TournamentMyProgressProps {
  data: ITournamentInfo;
  children?: ReactNode;
}

export function TournamentMyProgress({ data, children }: TournamentMyProgressProps) {

  const navigate = useAppNavigate();
  const { t } = useTranslation("tournament");
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const position = data?.user_info?.rank || 0;
  const wagered = Number(data?.user_info?.wagered || 0);
  const prize = Number(data?.user_info?.prize || 0);

  // 格式化金额显示 (假设后端返回的是 USD)
  const formattedWagered = formatWithConversion(
    wagered,
    "USD",
    { showCode: false, showSymbol: true }
  );

  const formattedPrize = formatWithConversion(
    prize,
    "USD",
    { showCode: false, showSymbol: true }
  );

  return (
    <div className="flex flex-col gap-3">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <Medal size={16} className="text-primary" />
        <h3 className="text-base font-bold text-base-content">
          {t("myProgress", "My Progress")}
        </h3>
      </div>

      {/* 三格数据 */}
      <div className="grid grid-cols-3 gap-2">
        {/* 排名 */}
        <div className="bg-base-200 rounded-box p-2 flex flex-col items-center justify-center gap-1">
          <span className="text-[12px] text-base-content/50 uppercase font-bold tracking-wide">
            {t("myPosition", "Rank")}
          </span>
          <RankDisplay position={position} />
        </div>

        {/* 下注额 */}
        <div className="bg-base-200 rounded-box p-2 flex flex-col items-center justify-center gap-1">
          <span className="text-[12px] text-base-content/50 uppercase font-bold tracking-wide">
            {t("wagered", "Wagered")}
          </span>
          <span className="text-sm font-black text-primary truncate max-w-full">
            {formattedWagered.formatted}
          </span>
        </div>

        {/* 奖励 */}
        <div className="bg-base-200 rounded-box p-2 flex flex-col items-center justify-center gap-1">
          <span className="text-[12px] text-base-content/50 uppercase font-bold tracking-wide">
            {t("prize", "Prize")}
          </span>
          <span
            className={`text-sm font-black truncate max-w-full ${prize > 0 ? "text-primary" : "text-base-content/30"}`}>
            {formattedPrize.formatted}
          </span>
        </div>
      </div>

      {/* 榜单 + 游戏 各占一半 */}
      <div className="grid grid-cols-2 gap-1">
        <div className="bg-base-200 rounded-box p-2 flex flex-col items-center justify-center gap-1"
             onClick={() => {
               const id = data?.user_info?.tournament_id;
               const level = data?.user_info?.tournament_level || "bronze";
               void navigate({ to: "/tournament/leaderboard2", search: { id, level } });
             }}>
          <div className="flex items-center gap-1 text-[12px] text-base-content/50 uppercase font-bold tracking-wide">
            <Iconify icon="custom:leaderboard" className="w-5 h-5 text-primary" />
            {t("tournament:leagueLeaderboard")}
          </div>
          <SquareArrowOutUpRight size={20} className="text-primary" />
        </div>
        <div className="bg-base-200 rounded-box p-2 flex flex-col items-center justify-center gap-1"
             onClick={() => {
               const game_provider = data?.game_provider;
               void navigate({ to: "/tournament/games", search: { id: game_provider } });
             }}>
          <div className="flex items-center gap-1 text-[12px] text-base-content/50 uppercase font-bold tracking-wide">
            <Iconify icon="custom:gameboy" className="w-5 h-5 text-primary" />
            {t("tournament:participatingGames")}
          </div>
          <SquareArrowOutUpRight size={20} className="text-primary" />
        </div>
      </div>

      {children}
    </div>
  );
}