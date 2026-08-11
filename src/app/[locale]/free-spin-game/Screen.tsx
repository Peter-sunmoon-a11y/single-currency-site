import {
  useCancelFreeSpinRecord,
  useEarliestPendingRecord,
  useEnableRecord,
  useSupportedGamesInfinite
} from "@/query/free-spins";
import { useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { VirtuosoGrid } from "react-virtuoso";
import { GameImage } from "@/components/ui/GameImage";
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import type { GameItem } from "@/sections/free-spins/types";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { GlobeLock } from "lucide-react";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { toast } from "sonner";
import { useAppNavigate } from "@/hooks/useAppNavigate";

function RouteComponent() {

  const navigate = useAppNavigate();
  const { t } = useTranslation("popup");

  const { data: earliestPendingRecord } = useEarliestPendingRecord();

  const { mutate: enableRecordMutation, isPending: p1 } = useEnableRecord();

  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  const isGameBanned = useBannedGameCheck(true);

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending
  } = useSupportedGamesInfinite({
    record_id: earliestPendingRecord?.id || ""
  });

  const allGames = useMemo(() => {
    if (!infiniteData?.pages) return [];
    return infiniteData.pages
      .flatMap((page: any) => (page.code === 0 ? page.data.games || [] : []))
      .filter((game: Record<string, any>) => !isGameBanned(game));
  }, [infiniteData, isGameBanned]);

  const { mutate: cancelFreeSpinRecordMutation, isPending: p2 } = useCancelFreeSpinRecord();

  const handleClose = () => {
    cancelFreeSpinRecordMutation(selectedGame?.id || "", {
      onSuccess: () => {
      },
      onSettled: () => {
      }
    });
  };

  const handleClaim = () => {
    if (!earliestPendingRecord?.id || !selectedGame?.inner_game_id) {
      toast.error(t("toast:selectGameFirst"));
      return;
    }
    enableRecordMutation(
      { game_id: selectedGame.id, record_id: earliestPendingRecord.id, inner_game_id: selectedGame.inner_game_id },
      {
        onSuccess: (result) => {
          if (result.code === 0) {
            setSelectedGame(null);
            void navigate({ to: "/bonus", search: { view: undefined, tab: undefined } });
          }
        }
      }
    );
  };

  if (!earliestPendingRecord || (earliestPendingRecord && !earliestPendingRecord?.can_enable)) {
    return <NothingFound />;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <InnerSlogan
        // 根据设计稿自行修改文字
        title={t("freeSpins.claim_free_spins")}
        // 根据设计稿自行修改图片
        picture="/images/free_spins/free-spins.png"
      />

      <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-4">
        <TextBaseContent
          text={t("freeSpins.eligible_games_desc", { freeSpinsCount: earliestPendingRecord?.bet_count || "" })} />
        <div className="flex items-center text-2xl font-bold text-primary tabular-nums shrink-0">
          x{earliestPendingRecord?.bet_count}
        </div>
      </div>

      {/* 内容区 */}
      <div>
        {isPending ? (
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-full aspect-[3/4] rounded-lg bg-base-200 animate-pulse" />
            ))}
          </div>
        ) : allGames.length === 0 ? (
          <div className=" min-h-50 text-sm font-bold text-base-content/60 flex flex-col items-center justify-center gap-2">
            <GlobeLock className="w-8 h-8" />
            {t("bonus:no_games_available")}
          </div>
        ) : (
          <VirtuosoGrid
            customScrollParent={document.getElementById("main-scroll") ?? undefined}
            data={allGames}
            endReached={() => {
              if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
            }}
            overscan={900}
            listClassName="grid grid-cols-4 gap-1"
            itemClassName="w-full"
            itemContent={(_, item) => {
              const isSelected = selectedGame?.id === item.id;
              return (
                <div onClick={() => setSelectedGame((prev) => (prev?.id === item.id ? null : item))}>
                  <GameImage
                    data={item}
                    game={{ game_provider: item.game_provider, image: item.image }}
                    isActive={isSelected}
                    disableNavigation={true}
                  />
                </div>
              );
            }}
            components={{
              Footer: () => isFetchingNextPage ? (
                <div className="flex justify-center">
                  <span className="loading loading-bars loading-sm text-primary" />
                </div>
              ) : null
            }}
          />
        )}
      </div>

      {/* 吸底按钮 */}
      <div className="-mx-4 sticky bottom-0 bg-base-300 flex items-center gap-2 px-4 py-2">
        {allGames.length > 0 && (
          <>
            <ConfirmBox
              loading={p1}
              onClick={handleClaim}
              className="flex-1"
            >
              {t("bonus:continue")}
            </ConfirmBox>
            <ConfirmBox
              loading={p2}
              className="btn-soft flex-1"
              onClick={handleClose}>
              {t("bonus:giveUp")}
            </ConfirmBox>
          </>
        )}
      </div>
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
