import { useState, useEffect } from "react";
import type { ITournament } from "@/types/tournament";
import { useTournamentLeaderboard } from "@/hooks/api/useAuth.ts";
import { TournamentLeaderboardTable } from "./tournament-leaderboard-table";

interface TournamentLeaderboardProps {
  tournament: ITournament | null;
}

export function TournamentLeaderboardV2({ tournament }: TournamentLeaderboardProps) {
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

  const tournament_id = tournament?.user_info?.tournament_id;
  const tournament_level = tournament?.user_info?.tournament_level || "bronze";

  const { data, isFetching } = useTournamentLeaderboard({
    page: status.page,
    limit: status.limit,
    // last_id: status.is_jump_page ? "" : status.last_id,
    // last_wagered: status.is_jump_page ? "" : status.last_wagered,
    tournament_id,
    tournament_level
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