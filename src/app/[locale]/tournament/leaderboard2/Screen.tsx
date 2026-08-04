import { searchParamsToObject } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useTournamentLeaderboard, useTournamentList } from "@/hooks/api/useAuth.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import Iconify from "@/components/iconify";
import clsx from "clsx";
import { Decimal } from "decimal.js";
import { Paginate } from "@/sections/tournament/components/Paginate.tsx";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { RankDisplay } from "@/sections/tournament/tournament-my-progress-v2.tsx";

function RouteComponent() {
  const routeSearchParams = useSearchParams();
  const { id, level } = searchParamsToObject(routeSearchParams);
  const { tournamentList } = useTournamentList();

  const tournament = useMemo(() => {
    if (!id || !tournamentList) return undefined;
    const cleanId = Number(String(id).replace(/^"+|"+$/g, ""));
    return tournamentList.find(item => String(item.id) === String(Number.isNaN(cleanId) ? id : cleanId));
  }, [id, tournamentList]);

  const { t } = useTranslation(["tournament"]);

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    last_id: "",
    last_wagered: "",
    tournament_id: "",
    tournament_level: "",
    is_jump_page: false
  });

  const { data, isFetching } = useTournamentLeaderboard({
    page: status.page,
    limit: status.limit,
    // last_id: status.is_jump_page ? "" : status.last_id,
    // last_wagered: status.is_jump_page ? "" : status.last_wagered,
    tournament_id: id || "",
    tournament_level: level || "bronze"
  });

  /**
   * TODO: 快速点击分页的时候会导致数据更新出问题,需要限制更新频率
   *       isFetching
   */
  useEffect(() => {
    if (isFetching) return;
    setStatus((v) => ({
      ...v,
      ...data?.next_page_params,
      data: data?.data ?? [],
      is_jump_page: false
    }));
  }, [data, isFetching]);

  if (!tournament) return null;

  return <div className="p-4 flex flex-col gap-4">
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
        <span>{t("tournament:player", "Wagered")} | {t("tournament:wagered", "Wagered")}</span>
        <span>{t("tournament:prize", "Prize")}</span>
      </div>

      <div className="space-y-1">
        {status.data.map((item: Record<string, any>, index: number) => {
          // 前端自行管理排名顺序：按分页计算全局名次
          const baseRank = (status.page - 1) * status.limit;
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
              <div className="flex justify-between">
                <div>
                  {/* Player */}
                  <div className="flex items-center gap-2">
                    {/* 用户排名 */}
                    <RankDisplay position={rank} className={"text-sm"} />

                    {/* 用户昵称 */}
                    <InnerUserName className="text-sm" username={item?.username ?? ""} />
                  </div>

                  {/* Wagered */}
                  <div className="text-base-content/50 text-xs">
                    {formattedWagered.formatted}
                  </div>
                </div>

                {/* Prize */}
                <InnerPrizeValue
                  rate={Decimal(prizeRate).toDP(8).toString()}
                  prize={formattedPrize.formatted}
                  className="text-xs" />
              </div>
            </div>
          );
        })}
      </div>

      {isFetching && <DataLoading />}
      {!isFetching && Number(data?.total || 0) === 0 && <NothingFound />}
    </div>

    {/* Pagination */}
    <Paginate
      page={status.page}
      limit={status.limit}
      disabled={isFetching}
      pageCount={Math.ceil((data?.total || 0) / status.limit)}
      onJumpPage={(page) => {
        setStatus((v) => ({
          ...v,
          page,
          last_id: "",
          last_wagered: "",
          is_jump_page: true
        }));
      }}
      onPaginate={(page) => {
        setStatus((v) => ({ ...v, page, is_jump_page: false }));
      }} />
  </div>;
}

const InnerUserName = ({ username, className }: { username: string, className?: string }) => {
  return <div className={clsx("font-semibold text-base-content/50 truncate text-sm", className)}>
    {username}
  </div>;
};

const InnerPrizeValue = ({ prize, rate, className }: { prize: string, rate: string, className?: string }) => {
  return <div className={clsx("text-right text-sm", className)}>
    <div className="text-primary">{prize}</div>
    <div className={clsx("text-[12px] text-base-content/50")}>
      {rate}%
    </div>
  </div>;
};
export const beforeLoad = undefined;

export default RouteComponent;
