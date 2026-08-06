import { GameImage } from "@/components/ui/GameImage";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { VirtuosoGrid } from "react-virtuoso";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";

interface ExploreGameGridProps {
  isLoading: boolean;
  isError: boolean;
  casinoGameList?: {
    data?: Array<{
      id: string;
      name: string;
      image: string;
    }>;
  };
  hasMoreGames?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  currentCount?: number;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}

export function ExploreGameGrid({
                                  isLoading,
                                  isError,
                                  casinoGameList,
                                  hasMoreGames = false,
                                  isLoadingMore = false,
                                  onLoadMore,
                                  currentCount = 0,
                                  scrollContainerRef
                                }: ExploreGameGridProps) {
  const { t } = useTranslation();
  const isGameBanned = useBannedGameCheck(true);
  const scrollParent = (scrollContainerRef?.current ?? document.getElementById("main-scroll")) as HTMLElement | null;

  const hasMoreRef = useRef(hasMoreGames);
  const isLoadingMoreRef = useRef(isLoadingMore);
  const onLoadMoreRef = useRef(onLoadMore);
  hasMoreRef.current = hasMoreGames;
  isLoadingMoreRef.current = isLoadingMore;
  onLoadMoreRef.current = onLoadMore;

  const handleEndReached = useCallback(() => {
    if (hasMoreRef.current && !isLoadingMoreRef.current) {
      onLoadMoreRef.current?.();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-bars loading-sm text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <NothingFound className="static min-h-[50vh]" />
    );
  }

  const games = (casinoGameList?.data ?? []).filter((game) => !isGameBanned(game));

  if (!games.length) {
    return <NothingFound className="static min-h-[50vh]" />;
  }

  return (
    <div>
      <VirtuosoGrid
        customScrollParent={scrollParent ?? undefined}
        data={games}
        endReached={handleEndReached}
        overscan={900}
        listClassName="grid grid-cols-4 gap-1"
        itemClassName="w-full"
        itemContent={(_, game: any) => (
          <GameImage
            key={game.id ?? `${game.game_provider}:${game.inner_game_id}`}
            data={game}
            game={{
              inner_game_id: game.inner_game_id,
              game_provider: game.game_provider,
              game_name: game.display_game_name || game.name,
              image: game.image
            }}
            enabledBanGameList
          />
        )}
        components={{
          Footer: () => (
            <div className="flex flex-col items-center py-5 gap-2 pb-[calc(var(--app-sidebar-bottom-gap)+var(--safe-area-inset-bottom))]">
              {isLoadingMore && (
                <span className="loading loading-bars loading-sm text-primary" />
              )}
              {!hasMoreGames && !isLoadingMore && currentCount > 0 && (
                <div className="text-sm text-base-content/50">
                  {t("explore:allGamesLoaded", "All games loaded")}
                </div>
              )}
            </div>
          )
        }}
      />
    </div>
  );
}
