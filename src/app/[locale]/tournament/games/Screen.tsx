import { searchParamsToObject } from "@/lib/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCasinoGameList } from "@/services/public/game";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";
import { useQuery } from "@tanstack/react-query";
import i18n from "@/i18n.ts";
import Iconify from "@/components/iconify";
import { ExploreGameGrid } from "@/sections/explore";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useSearchParams } from "next/navigation";

const GAME_LIMIT = 30;

function RouteComponent() {
  const navigate = useAppNavigate();
  const { t } = useTranslation(["tournament", "casino"]);
  const routeSearchParams = useSearchParams();
  const { id: provider } = searchParamsToObject(routeSearchParams);
  const isGameBanned = useBannedGameCheck(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [allGames, setAllGames] = useState<any[]>([]);
  const prevProviderRef = useRef(provider);

  // 供应商切换时重置分页
  useEffect(() => {
    if (prevProviderRef.current !== provider) {
      prevProviderRef.current = provider;
      setCurrentPage(1);
      setAllGames([]);
    }
  }, [provider]);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["TournamentGameList", provider, currentPage],
    queryFn: () =>
      getCasinoGameList({
        limit: GAME_LIMIT,
        page: currentPage,
        providers: provider === "RakeRace" ? "" : provider,
        is_tournament: "1",
        lang: i18n.language?.toUpperCase?.() || "EN",
      }),
    enabled: !!provider,
    placeholderData: (prev) => prev,
  });

  // 追加游戏列表
  useEffect(() => {
    if (data?.code !== 0 || !Array.isArray(data?.data)) return;
    const filtered = data.data.filter((game: Record<string, any>) => !isGameBanned(game));
    if (currentPage === 1) {
      setAllGames(filtered);
    } else {
      setAllGames((prev) => [...prev, ...filtered]);
    }
  }, [data, currentPage]);

  const hasMoreGames = useMemo(
    () => !!data && data.code === 0 && data.data?.length === GAME_LIMIT,
    [data]
  );

  const handleLoadMore = useCallback(() => {
    setCurrentPage((p) => p + 1);
  }, []);

  const initialLoading = isLoading && allGames.length === 0;
  const isLoadingMore = isFetching && currentPage > 1;

  return (
    <div className="p-1">
      <div className="flex items-center justify-between px-3 pt-3 pb-4">
        <div className="flex items-center gap-2">
          <Iconify icon="custom:gameboy" className="w-6 h-6 text-primary" />
          <span className="font-bold text-base-content text-base">
            {t("tournament:participatingGames", "Participating Games")}
          </span>
        </div>
        <button
          className="btn btn-sm btn-primary btn-soft"
          onClick={() =>
            void navigate({
              to: "/explore",
              search: { type: "casino", sort: "popular", category: "hot" },
            })
          }
        >
          {t("casino:all", "All")}
        </button>
      </div>

      <ExploreGameGrid
        isLoading={initialLoading}
        isError={isError}
        casinoGameList={{ data: allGames }}
        hasMoreGames={hasMoreGames}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        currentCount={allGames.length}
      />
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
