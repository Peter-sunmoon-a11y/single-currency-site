import { useState, useEffect } from "react";
import { useLastTournamentLeaderboard } from "@/hooks/api/useAuth.ts";
import { TournamentLeaderboardTable } from "./tournament-leaderboard-table";

interface TournamentLeaderboardLastWeekProps {
  tournament_id: string | number;
}

export function TournamentLeaderboardLastWeek({ tournament_id }: TournamentLeaderboardLastWeekProps) {
 
  const [status, setStatus] = useState<Record<string, any>>({
    data: [],
    page: 1,
    limit: 10,
    last_id: "",
    last_wagered: "",
    tournament_id: "",
  });

  const { data, isFetching } = useLastTournamentLeaderboard({
    page: status.page,
    limit: status.limit,
    tournament_id: tournament_id.toString(),
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
      data: data?.data ?? []
    }));
  }, [data, isFetching]);

  if (!tournament_id) return null;

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