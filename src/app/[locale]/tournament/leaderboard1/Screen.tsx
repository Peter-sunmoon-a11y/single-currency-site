import { searchParamsToObject } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useTournamentLeaderboard, useTournamentList } from "@/hooks/api/useAuth.ts";
import { TournamentLeaderboardTable } from "@/sections/tournament/tournament-leaderboard-table.tsx";

function RouteComponent() {
  const routeSearchParams = useSearchParams();
  const { id, level } = searchParamsToObject(routeSearchParams);
  const { tournamentList } = useTournamentList();

  const tournament = useMemo(() => {
    if (!id || !tournamentList) return undefined;
    const cleanId = Number(String(id).replace(/^"+|"+$/g, ""));
    return tournamentList.find(item => String(item.id) === String(Number.isNaN(cleanId) ? id : cleanId));
  }, [id, tournamentList]);

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

  return (
    <TournamentLeaderboardTable
      data={status.data}
      page={status.page}
      limit={status.limit}
      isFetching={isFetching}
      total={data?.total || 0}
      onPaginate={setStatus}
    />
  );
}
export const beforeLoad = undefined;

export default RouteComponent;
