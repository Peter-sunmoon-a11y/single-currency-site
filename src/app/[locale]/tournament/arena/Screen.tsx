import { searchParamsToObject } from "@/lib/navigation";
import { useSearchParams } from "next/navigation";
import { useTournamentList } from "@/hooks/api/useAuth";
import {
  TournamentMyProgress,
  TournamentMyProgressV2,
  TournamentRulesSectionV2,
  TournamentRulesSectionV3,
} from "@/sections/tournament";
import { useState, useEffect, PropsWithChildren } from "react";

function TournamentArenaPage() {
  const searchSearchParams = useSearchParams();
  const search = searchParamsToObject(searchSearchParams);

  const { tournamentList } = useTournamentList();

  const [selectedIndex, setSelectedIndex] = useState(0);

  // 根据查询参数确定初始选中的赛事
  useEffect(() => {
    if (tournamentList.length === 0) return;

    let targetIndex = 0;
    if (search.id !== undefined) {
      const cleanIdNum = Number(String(search.id).replace(/^"+|"+$/g, ""));
      const targetId = Number.isNaN(cleanIdNum) ? String(search.id) : cleanIdNum;
      const foundIndex = tournamentList.findIndex(item => String(item.id) === String(targetId));
      if (foundIndex >= 0) targetIndex = foundIndex;
    } else if (search.provider) {
      const foundIndex = tournamentList.findIndex(item => item.game_provider === search.provider);
      if (foundIndex >= 0) targetIndex = foundIndex;
    }

    setSelectedIndex(targetIndex);
  }, [tournamentList, search.id, search.provider]);

  const selectedTournament = tournamentList[selectedIndex] || null;

  return (
    <div className="p-4">
      {/* Tournament Details */}
      <div className="flex flex-col gap-4">
        {/* My Progress */}
        {selectedTournament?.user_info && selectedTournament.id && (
          selectedTournament.game_provider !== "RakeRace" ? (
            <TournamentMyProgressV2 data={selectedTournament}>
              <TournamentRulesSectionV3 data={selectedTournament} />
            </TournamentMyProgressV2>
          ) : (
            <TournamentMyProgress data={selectedTournament}>
              <TournamentRulesSectionV2 data={selectedTournament} />
            </TournamentMyProgress>
          )
        )}
      </div>
    </div>
  );
}

// 新版本锦标赛
// 300016 = Rake Race
export const TOURNAMENT_SET = new Set(["300016", "200015"]);
export const TournamentRulesSectionGuard = ({ reverse = false, children }: PropsWithChildren<{
  reverse?: boolean
}>) => {
  const searchParamsSearchParams = useSearchParams();
  const searchParams = searchParamsToObject(searchParamsSearchParams);
  return (reverse ? TOURNAMENT_SET.has(searchParams?.id!) : !TOURNAMENT_SET.has(searchParams?.id!)) && children;
};

export const beforeLoad = undefined;

export default TournamentArenaPage;
