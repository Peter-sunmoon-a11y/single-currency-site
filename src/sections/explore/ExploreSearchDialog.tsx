import { GameImage } from "@/components/ui/GameImage";
import { Modal } from "@/components/ui/Modal";
import { useCasinoGameList, useCasinoGameListInfinite } from "@/hooks/api/usePublic";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBannedGameForceCheck } from "@/hooks/useBannedGameCheck.ts";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

const MIN_SEARCH_LENGTH = 3;
const PAGE_SIZE = 12;

export interface ExploreSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  baseFilters: Record<string, any>;
}

export function ExploreSearchDialog({ isOpen, onClose, baseFilters }: ExploreSearchDialogProps) {
  const navigate = useAppNavigate();
  const { t } = useTranslation();
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [searchText, setInputValue] = useState("");
  const debouncedValue = useDebounce(searchText, 300);
  const trimmedDebouncedQuery = debouncedValue.trim();

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameForceCheck();

  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = window.setTimeout(() => {
      searchRef.current?.focus();
      searchRef.current?.select();
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  const meetsMinLength = trimmedDebouncedQuery.length >= MIN_SEARCH_LENGTH;

  const searchParams = useMemo(() => {
    if (!meetsMinLength) return null;
    return {
      ...baseFilters,
      keyword: trimmedDebouncedQuery,
      limit: PAGE_SIZE,
    };
  }, [baseFilters, trimmedDebouncedQuery, meetsMinLength]);

  // 获取 Hot Games 数据
  const hotGamesParams = useMemo(() => ({
    ...baseFilters,
    category: 'hot',
    page: 1,
    limit: 12,
  }), [baseFilters]);

  const { data: hotGamesData } = useCasinoGameList(hotGamesParams, {
    enabled: isOpen,
    refetchOnMount: false,
  });

  const hotGames = useMemo(() => {
    const list = Array.isArray((hotGamesData as any)?.data) ? (hotGamesData as any).data : [];
    return list.filter((game: Record<string, any>) => !isGameBanned(game)).slice(0, 12);
  }, [hotGamesData, isGameBanned]);

  const {
    data: searchGameListData,
    isFetching: isSearchFetching,
    isFetched: isSearchFetched,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCasinoGameListInfinite(searchParams, {
    enabled: Boolean(searchParams),
    refetchOnMount: false,
  });

  const displayResults = useMemo(() => {
    if (!meetsMinLength || !searchGameListData?.pages) return [];
    return searchGameListData.pages.flatMap((page: any) => page?.data || [])?.filter((game: Record<string, any>) => !isGameBanned(game));
  }, [meetsMinLength, searchGameListData, isGameBanned]);

  // IntersectionObserver 触发加载更多
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 只在首次加载时显示 loading（没有任何数据时）
  const showLoading = meetsMinLength && isSearchFetching && displayResults.length === 0;
  const showNoResults = meetsMinLength && isSearchFetched && !isSearchFetching && displayResults.length === 0;
  const showResults = meetsMinLength && displayResults.length > 0;

  const handleResultNavigate = (game: any) => {
    const provider = game?.game_provider ?? game?.provider;
    const innerId = game?.inner_game_id ?? game?.innerGameId ?? game?.id;
    const navigationId = provider && innerId ? `${provider}:${innerId}` : innerId;

    if (!navigationId) return;

    onClose();
    navigate({ to: "/games/$gameId", params: { gameId: navigationId }, search: {} });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("common:common.search")}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <label className="input bg-base-200 w-full !outline-0 border-0 font-bold flex">
          <Search className="text-base-content/50 w-4 h-4" />
          <input
            ref={searchRef}
            type="text"
            value={searchText}
            placeholder={t("explore:searchMinLength", { count: MIN_SEARCH_LENGTH })}
            onChange={(event) => setInputValue(event.target.value)}
          />
        </label>

        <div className="flex-1 min-h-0 overflow-x-hidden">
          <div className="w-full flex flex-col gap-4">
            {showLoading && (
              <div className="flex items-center justify-center py-4">
                <span className="loading loading-bars loading-sm text-primary" />
              </div>
            )}

            {showNoResults && (
              <NothingFound className="static h-[52px]" text={t("explore:noResultsFound")} />
            )}

            {showResults && (
              <div className="flex flex-col gap-1">
                <p className="text-primary font-bold text-sm uppercase">{t("gameDetail:result")}</p>
                <div className="max-h-[28dvh] overflow-y-auto hide-scrollbar touch-pan-y">
                  <div className="grid grid-cols-4 gap-1">
                    {displayResults.map((game: Record<string, any>, index: number) => {
                      const key = game?.id ?? `${game?.game_provider ?? "provider"}-${game?.inner_game_id ?? index}`;
                      return (
                        <GameImage
                          key={key}
                          data={game}
                          game={{
                            inner_game_id: game?.inner_game_id ?? game?.id,
                            game_provider: game?.game_provider ?? game?.provider,
                            game_name: game?.display_game_name ?? game?.name ?? game?.title,
                            image: game?.image || game?.imageUrl || undefined,
                          }}
                          showHoverEffects
                          onClick={() => handleResultNavigate(game)}
                        />
                      );
                    })}
                  </div>
                  {hasNextPage && (
                    <div ref={sentinelRef} className="flex items-center justify-center py-2">
                      <span className="loading loading-bars loading-xs text-primary" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hot Games Section */}
            {hotGames.length > 0 && (
              <div className="text-sm text-base-content/50 max-h-[20dvh] overflow-y-auto hide-scrollbar touch-pan-y">
                <p className="text-primary font-bold text-sm mb-2">{t("explore:gamesYouShouldTry")}</p>
                <div className="grid grid-cols-4 gap-1">
                  {hotGames.map((game: any, index: number) => {
                    const key = game?.id ?? `${game?.game_provider ?? "provider"}-${game?.inner_game_id ?? index}`;
                    return (
                      <GameImage
                        key={key}
                        data={game}
                        game={{
                          inner_game_id: game?.inner_game_id ?? game?.id,
                          game_provider: game?.game_provider ?? game?.provider,
                          game_name: game?.display_game_name ?? game?.name ?? game?.title,
                          image: game?.image || game?.imageUrl || undefined,
                        }}
                        showHoverEffects
                        onClick={() => handleResultNavigate(game)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
