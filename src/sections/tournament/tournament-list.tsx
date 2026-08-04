import { TournamentCard, TournamentCardData } from "./tournament-card";
import { useMemo } from "react";
import { useTournamentList } from "@/hooks/api/useAuth";
import type { ITournament } from "@/types/tournament";
import { getTournamentVisual } from "./tournament-visuals";
import { NothingFound } from "@/components/ui/NothingFound";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const TournamentList = () => {
  const navigate = useAppNavigate();
  const { tournamentList, isLoading } = useTournamentList();

  const mapTournamentToCard = (item: ITournament): TournamentCardData => {
    const userInfo = (item.user_info || {}) as any;
    const visual = getTournamentVisual(item.game_provider || "");
    return {
      id: (item as any).id ?? `${item.game_provider}-${item.end_time}`,
      titleHighlight: visual.titleHighlight,
      title: visual.title,
      endTime: item.end_time || 0,
      prizePool: Number(userInfo?.prize ?? 0),
      image: visual.images.mobile,
      provider: item.game_provider,
      tournamentId: userInfo?.tournament_id ?? (item as any).id,
      tournamentLevel: userInfo?.tournament_level ?? "bronze",
    };
  };

  const tournaments: TournamentCardData[] = useMemo(() =>
    (tournamentList || [])
      .filter(item => (item.game_provider || "").toLowerCase() !== "newbie")
      .map(mapTournamentToCard),
    [tournamentList]
  );

  const handleCardClick = (tournament: TournamentCardData) => {
    const cleanIdNum = Number(String(tournament.id).replace(/^"+|"+$/g, ""));
    const idStr = Number.isNaN(cleanIdNum) ? String(tournament.id) : String(cleanIdNum);
    void navigate({ to: "/tournament/arena", search: { id: idStr, provider: undefined } });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton rounded-lg min-h-[110px]" />
        ))}
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="relative min-h-[110px]">
        <NothingFound />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {tournaments.map((tournament) => (
        <TournamentCard
          key={tournament.id}
          data={tournament}
          onClick={() => handleCardClick(tournament)}
        />
      ))}
    </div>
  );
};
