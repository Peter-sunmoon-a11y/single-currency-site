import { GameCarousel } from "@/components/ui/GameCarousel";
import { GameImage } from "@/components/ui/GameImage";
import { useCasinoHomeGameList } from "@/hooks/api/usePublic.ts";
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";
import { localizeHref } from "@/lib/navigation";
import { ChevronsRight, Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const FeaturedGamesList = () => {
  const { data: casinoHomeGameListResponse } = useCasinoHomeGameList();
  const { data: casinoHomeGameList } = casinoHomeGameListResponse ?? {};

  const categories = casinoHomeGameList?.home_data?.hot_game ?? [];

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameCheck(false);

  // 过滤掉加载失败的游戏
  const validGames = categories.filter((game: Record<string, any>) => !isGameBanned(game));

  return <FeaturedGames games={validGames} />;
};

type FeaturedGamesProps = {
  country_code?: string;
  games: any[];
};

export const FeaturedGames = ({ games }: FeaturedGamesProps) => {
  const t = useTranslations();

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameCheck(false);

  const router = useRouter();

  const handleAllClick = useCallback(() => {
    router.push(localizeHref("/explore?type=casino&category=hot"));
  }, [router]);

  // 过滤掉加载失败的游戏
  const validGames = (games ?? []).filter((game) => !isGameBanned(game));

  return (
    <GameCarousel className="gap-2 animate-fade-in">
      <GameCarousel.Header
        onTitleClick={handleAllClick}
        onAllClick={handleAllClick}
        allLabel={
          <div className="btn btn-primary btn-xs btn-soft text-[12px]">
            {t("casino.all")}
            <ChevronsRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        }
      >
        <Flame className={"text-primary"} strokeWidth={3} size={16} />
        <p className="text-base font-bold uppercase text-primary">{t(`casino.hot`)}</p>
      </GameCarousel.Header>
      <GameCarousel.Content>
        <GameCarousel.Track>
          {validGames.map((game: any) => (
            <GameCarousel.Item
              key={game.id}
              className="flex flex-col items-center w-25"
              lazy
              placeholder={<div className="w-full aspect-[3/4] rounded-lg bg-base-200" />}
            >
              <GameImage
                size={96}
                data={game}
                game={{
                  inner_game_id: game.inner_game_id,
                  game_provider: game.game_provider,
                  game_name: game.display_game_name,
                  image: game.image,
                }}
                enabledBanGameList={false}
                showHoverEffects={true}
                className="object-cover origin-center"
                containerClassName="rounded-lg"
              />
            </GameCarousel.Item>
          ))}
        </GameCarousel.Track>
        <GameCarousel.Fade />
      </GameCarousel.Content>
    </GameCarousel>
  );
};
