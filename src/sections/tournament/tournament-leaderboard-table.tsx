import { type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import Iconify from "@/components/iconify";
import { Decimal } from "decimal.js";
import clsx from "clsx";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { RankDisplay } from "@/sections/tournament/tournament-my-progress-v2.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";

export function TournamentLeaderboardTable({
                                             data,
                                             page,
                                             limit,
                                             isFetching,
                                             total,
                                             onPaginate
                                           }: {
  data: Record<string, any>[];
  page: number;
  limit: number;
  isFetching: boolean;
  total: number;
  onPaginate: Dispatch<SetStateAction<Record<string, any>>>;
}) {
  const { t } = useTranslation(["tournament"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Iconify
          icon="custom:leaderboard"
          className="w-5 h-5 text-primary"
        />
        <h3 className="text-base font-bold text-base-content">
          {t("tournament:leagueLeaderboard")}
        </h3>
      </div>

      {/* Header row */}
      <div className="relative min-h-[160px]">
        <div className="flex justify-between text-base-content/50 text-xs uppercase">
          <span>{t("tournament:player", "Player")} | {t("tournament:rank")}</span>
          <span>{t("tournament:prize", "Prize")} | {t("tournament:wagered", "Wagered")}</span>
        </div>

        <div className="space-y-1">
          {data.map((item: Record<string, any>, index: number) => {
            // 前端自行管理排名顺序：按分页计算全局名次
            const baseRank = (page - 1) * limit;
            const rank = baseRank + (index + 1);
            const formattedWagered = formatWithConversion(
              Number(item.wagered || 0),
              "USD",
              { showCode: false, showSymbol: true, displayDecimal: 0 }
            );
            const formattedPrize = formatWithConversion(
              Number(item.prize || 0),
              "USD",
              { showCode: false, showSymbol: true }
            );
            const prizeRate = Number(item.prize_rate || 0) * 100;

            return (
              <div
                key={index}
                className={clsx("rounded-md px-2 py-2 bg-base-200")}
              >
                {/* 移动端时候的卡片模式 */}
                <div className="flex justify-between">
                  {/* Player */}
                  <div className="flex flex-col">
                    {/* 用户昵称 */}
                    <InnerUserName className="text-sm" username={item?.username ?? ""} />
                    {/* 用户排名 */}
                    <RankDisplay position={rank} className={"text-sm"} />
                  </div>

                  <div className={"flex flex-col items-end"}>
                    {/* Prize */}
                    <InnerPrizeValue
                      rate={Decimal(prizeRate).toDP(8).toString()}
                      prize={formattedPrize.formatted}
                      className="text-xs" />

                    {/* Wagered */}
                    <div className="text-base-content/50 text-xs">
                      {formattedWagered.formatted}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isFetching && <DataLoading />}
        {!isFetching && Number(total || 0) === 0 && <NothingFound />}
      </div>

      {/* Pagination */}
      <Paginate
        page={page}
        limit={limit}
        disabled={isFetching}
        pageCount={Math.ceil((total || 0) / limit)}
        onJumpPage={(page) => {
          onPaginate((v) => ({
            ...v,
            page,
            last_id: "",
            last_wagered: "",
            is_jump_page: true
          }));
        }}
        onPaginate={(page) => {
          onPaginate((v) => ({ ...v, page, is_jump_page: false }));
        }} />
    </div>
  );
}

const InnerUserName = ({ username, className }: { username: string, className?: string }) => {
  return <div className={clsx("font-semibold text-base-content/50 truncate text-sm", className)}>
    {username}
  </div>;
};

const InnerPrizeValue = ({ prize, rate, className }: { prize: string, rate: string, className?: string }) => {
  return <div className={clsx("text-center text-sm", className)}>
    <div className="text-success">{prize} ({rate}%)</div>
    {/* <div className={clsx("text-[12px] text-base-content/50")}>
      {rate}%
    </div> */}
  </div>;
};