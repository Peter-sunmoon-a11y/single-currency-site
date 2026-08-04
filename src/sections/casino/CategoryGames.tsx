import Iconify from "@/components/iconify";
import { GameCarousel } from "@/components/ui/GameCarousel";
import { GameImage } from "@/components/ui/GameImage";
import { useCasinoHomeGameList } from "@/hooks/api/usePublic.ts";
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref } from "@/lib/navigation";
import { ChevronsRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const CategoryGamesList = () => {
  const { data: casinoHomeGameListResponse } = useCasinoHomeGameList();
  const { data: casinoHomeGameList } = casinoHomeGameListResponse ?? {};
  const categories = casinoHomeGameList?.home_data?.game_category ?? [];

  return (
    <>
      {categories.map((c: any) => (
        <CategoryGames key={c.category} games={c.games} category={c.category} />
      ))}
    </>
  );
};

type CategoryGamesProps = {
  games: any[];
  category: string;
};

export const CategoryGames = ({ games, category }: CategoryGamesProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameCheck(false);

  // 因为后端返回的字符串格式与翻译key不匹配，需要将 kebab-case 格式转换为 camelCase 格式
  const categoryKey = category.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

  // 过滤掉加载失败的游戏
  const validGames = games.filter((game) => !isGameBanned(game));

  // 处理 All 按钮点击 - 导航到 explore 页面并设置正确的过滤器
  const handleAllClick = useCallback(() => {
    // 根据 category 映射到正确的一级和二级分类
    // category 格式可能是: "hot", "slots", "live-casino", "fishing", "crash" 等

    // 确定一级分类（game type）
    let gameType = "casino"; // 默认 casino
    let secondaryCategory = category; // 默认使用原始 category

    // 特殊处理某些分类
    if (category === "live-casino" || category === "live") {
      gameType = "liveCasino";
      secondaryCategory = "all";
    } else if (category === "slots") {
      gameType = "slots";
      secondaryCategory = "all";
    } else if (["feature-buy", "enhanced-rtp", "jackpot", "megaways", "table-game", "video-poker", "arcade"].includes(category)) {
      // 这些是 slots 下的二级分类
      gameType = "slots";
      secondaryCategory = category;
    } else if (["baccarat", "blackjack", "roulette", "poker"].includes(category)) {
      // 这些是 liveCasino 下的二级分类
      gameType = "liveCasino";
      secondaryCategory = category;
    } else if (category === "fast") {
      gameType = "fast";
      secondaryCategory = "all";
    } else if (["crash", "plinko", "mines", "scratch", "bingo", "keno"].includes(category)) {
      gameType = "fast";
      secondaryCategory = category;
    } else if (category === "fishing") {
      // fishing 是一级分类，没有二级分类
      gameType = "fishing";
      secondaryCategory = ""; // 不需要 category
    } else if (category === "hot") {
      // hot 是 casino 下的二级分类
      gameType = "casino";
      secondaryCategory = category;
    }

    const searchParams: Record<string, string> = {
      type: gameType,
    };

    // fishing 不需要 category 参数
    if (gameType !== "fishing" && secondaryCategory) {
      searchParams.category = secondaryCategory;
    }

    router.push(localizeHref(`/explore?${new URLSearchParams(searchParams).toString()}`));
  }, [category, router]);

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
        <Iconify icon={`custom:${category}`} className={"text-primary"} strokeWidth={3} size={16} />
        <p className="text-base font-bold uppercase text-primary">{t(`explore:${categoryKey}`)}</p>
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
