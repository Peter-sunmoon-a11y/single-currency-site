import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Game {
  id: string;
  inner_game_id?: string;
  game_provider?: string;
  display_game_name: string;
  image: string;
  provider?: string;
}

interface GameShuffleSliderProps {
  games: Game[];
  isShuffling: boolean;
  onGameSelected: (game: Game) => void;
  onAnimationComplete: () => void;
}

export const GameShuffleSlider = ({ games, isShuffling, onGameSelected, onAnimationComplete }: GameShuffleSliderProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [displayGames, setDisplayGames] = useState<Game[]>([]);
  const [animationPhase, setAnimationPhase] = useState<"static" | "shuffling" | "shrinking" | "revealing">("revealing"); // 初始状态设为revealing
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false); // 添加初始化标志
  const [animationTimings, setAnimationTimings] = useState({
    shuffleDuration: 1.5,
    shrinkDelay: 1500,
    shrinkDuration: 0.8,
    revealDelay: 500,
    revealDuration: 0.6,
    finalDelay: 1800,
    easing: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    blurIntensity: 4,
  });

  // 使用ref来避免useEffect依赖问题
  const isAnimatingRef = useRef(false);
  const animationKeyRef = useRef("static");
  const recentGamesRef = useRef<string[]>([]); // 追踪最近选中的游戏
  const isDesktop = useMediaQuery("(min-width: 1024px)"); // 与 QuickActions 保持一致

  // 生成随机动画参数
  const generateRandomTimings = useCallback(() => {
    const easingVariations: [number, number, number, number][] = [
      [0.25, 0.46, 0.45, 0.94], // 默认
      [0.175, 0.885, 0.32, 1.275], // 弹性
      [0.645, 0.045, 0.355, 1], // 缓入缓出
      [0.55, 0.085, 0.68, 0.53], // 平滑
      [0.895, 0.03, 0.685, 0.22], // 急速
    ];

    return {
      shuffleDuration: 1.2 + Math.random() * 1.6, // 1.2-2.8秒
      shrinkDelay: 1200 + Math.random() * 800, // 1.2-2秒
      shrinkDuration: 0.6 + Math.random() * 0.6, // 0.6-1.2秒
      revealDelay: 300 + Math.random() * 400, // 0.3-0.7秒
      revealDuration: 0.5 + Math.random() * 0.4, // 0.5-0.9秒
      finalDelay: 1500 + Math.random() * 600, // 1.5-2.1秒
      easing: easingVariations[Math.floor(Math.random() * easingVariations.length)],
      blurIntensity: 3 + Math.random() * 3, // 3-6px模糊
    };
  }, []);

  // 准备显示的游戏列表 - loop模式确保足够卡片轮播
  const prepareDisplayGames = useCallback(() => {
    if (!games || games.length === 0) return [];

    // 响应式卡片尺寸和容器宽度
    const cardWidth = !isDesktop ? 104 + 8 : 176 + 8; // 移动端 w-26 (104px) + gap，桌面端 w-44 (176px)
    const containerWidth = !isDesktop ? (typeof window !== "undefined" ? window.innerWidth : 375) : 800;

    // 移动端限制显示卡片数量，桌面端使用更多
    const maxPossibleScroll = !isDesktop ? 1200 : 6000; // 移动端减少滚动距离
    const visibleCards = Math.ceil(containerWidth / cardWidth);

    // 移动端最多显示4个不同游戏，桌面端正常
    const maxUniqueGames = !isDesktop ? Math.min(4, games.length) : games.length;
    const minCardsNeeded = !isDesktop
      ? Math.ceil(maxPossibleScroll / cardWidth) + visibleCards + 5 // 移动端减少缓冲
      : Math.ceil(maxPossibleScroll / cardWidth) + visibleCards + 15;

    if (games.length >= minCardsNeeded) {
      // 如果游戏数量足够，直接返回原始列表
      return [...games];
    } else {
      // 循环重复游戏，但移动端限制唯一游戏数
      const loopedGames = [];
      const gamesToUse = !isDesktop ? games.slice(0, maxUniqueGames) : games;

      for (let i = 0; i < minCardsNeeded; i++) {
        loopedGames.push(gamesToUse[i % gamesToUse.length]);
      }
      return loopedGames;
    }
  }, [games, isDesktop]);

  // 基于滚动位置选择游戏，但增加随机性避免重复
  const selectGameFromPosition = useCallback(
    (scrollOffset: number, displayGames: Game[]) => {
      if (!displayGames || displayGames.length === 0) return null;

      // 响应式尺寸
      const cardWidth = !isDesktop ? 104 + 8 : 176 + 8;
      const containerWidth = !isDesktop ? (typeof window !== "undefined" ? window.innerWidth : 375) : 800;
      const centerPosition = containerWidth / 2;

      // 计算基础位置
      const centerContentPosition = scrollOffset + centerPosition;
      const baseIndex = Math.floor(centerContentPosition / cardWidth) % displayGames.length;

      // 检查最近选择的游戏
      const recentGames = recentGamesRef.current;
      const maxRecentGames = Math.min(displayGames.length - 1, 5);

      // 如果基础选择在最近列表中，尝试微调位置
      let finalIndex = baseIndex;
      const baseGame = displayGames[baseIndex];

      if (recentGames.includes(baseGame.id) && displayGames.length > 1) {
        // 尝试前后几个位置找到未重复的游戏
        const searchRange = Math.min(3, Math.floor(displayGames.length / 2));
        let found = false;

        for (let offset = 1; offset <= searchRange && !found; offset++) {
          // 随机选择向前或向后偏移
          const direction = Math.random() > 0.5 ? 1 : -1;
          const testIndex = (baseIndex + offset * direction + displayGames.length) % displayGames.length;
          const testGame = displayGames[testIndex];

          if (!recentGames.includes(testGame.id)) {
            finalIndex = testIndex;
            found = true;
          }
        }

        // 如果还是没找到，清空历史记录
        if (!found) {
          recentGamesRef.current = [];
        }
      }

      const selectedGame = displayGames[finalIndex];

      // 更新最近游戏列表
      const newRecentGames = [selectedGame.id, ...recentGames.filter((id) => id !== selectedGame.id)];
      recentGamesRef.current = newRecentGames.slice(0, maxRecentGames);

      return selectedGame;
    },
    [isDesktop],
  );

  // 初始化显示游戏和随机选择
  useEffect(() => {
    if (!isShuffling && !isInitialized && games.length > 0) {
      const displayGames = prepareDisplayGames();
      setDisplayGames(displayGames);

      // 随机选择一个游戏作为初始选中状态
      const randomIndex = Math.floor(Math.random() * games.length);
      const initialSelectedGame = games[randomIndex];

      // 设置初始状态
      setSelectedGame(initialSelectedGame);
      setIsInitialized(true);

      // 通知父组件初始选择
      onGameSelected(initialSelectedGame);
    } else if (!isShuffling && isInitialized) {
      const displayGames = prepareDisplayGames();
      setDisplayGames(displayGames);
    }
  }, [prepareDisplayGames, isShuffling, games, isInitialized, onGameSelected]);

  // 开始动画序列 - 使用ref防止重复执行
  useEffect(() => {
    if (!isShuffling) {
      // 当isShuffling变为false时，只重置动画状态，保持选中游戏
      isAnimatingRef.current = false;
      // 如果是初始化后的第一次非shuffling状态，保持revealing状态
      if (isInitialized && animationPhase !== "revealing") {
        setAnimationPhase("revealing");
      } else if (!isInitialized && animationPhase !== "revealing") {
        setAnimationPhase("static");
      }
      return;
    }

    // 防止重复执行动画
    if (isAnimatingRef.current) {
      console.log("动画已在进行中，跳过");
      return;
    }

    isAnimatingRef.current = true;

    // 生成唯一的动画key，在整个动画过程中保持不变
    animationKeyRef.current = `shuffling-${Date.now()}-${Math.random()}`;

    // 生成随机动画参数
    const randomTimings = generateRandomTimings();
    setAnimationTimings(randomTimings);

    // 开始新动画时重置状态
    setSelectedGame(null);
    setScrollOffset(0);
    setAnimationPhase("shuffling");
    setIsInitialized(true); // 标记为已初始化

    // 生成随机滚动距离，确保不超出准备的卡片范围
    const currentDisplayGames = prepareDisplayGames();

    // 响应式计算
    const cardWidth = !isDesktop ? 104 + 8 : 176 + 8;
    const containerWidth = !isDesktop ? (typeof window !== "undefined" ? window.innerWidth : 375) : 800;
    const maxSafeScroll = currentDisplayGames.length * cardWidth - containerWidth - 300; // 减去安全边界

    // 移动端使用较小的滚动范围
    const baseScroll = !isDesktop
      ? 800 + Math.random() * 600 // 移动端：800-1400px
      : 2000 + Math.random() * 2000; // 桌面端：2000-4000px
    const extraRandomness = (Math.random() - 0.5) * (!isDesktop ? 400 : 1000);
    const microRandomness = (Math.random() - 0.5) * (!isDesktop ? 100 : 200);

    // 时间基础的随机性
    const timeBasedRandom = (Date.now() % 1000) * (Math.random() * (!isDesktop ? 1 : 2));

    const calculatedScroll = baseScroll + extraRandomness + microRandomness + timeBasedRandom;
    const totalScroll = Math.max(!isDesktop ? 600 : 1500, Math.min(calculatedScroll, maxSafeScroll));

    console.log("显示游戏数量:", currentDisplayGames.length);
    console.log("最大安全滚动:", maxSafeScroll);
    console.log("实际滚动距离:", totalScroll);

    // 基于最终滚动位置选择游戏
    const winningGame = selectGameFromPosition(totalScroll, currentDisplayGames);

    if (!winningGame) {
      isAnimatingRef.current = false;
      return;
    }

    // 设置滚动偏移量
    setScrollOffset(totalScroll);

    // 使用随机时间的动画时间线
    const timer1 = setTimeout(() => {
      setAnimationPhase("shrinking");

      const timer2 = setTimeout(() => {
        setSelectedGame(winningGame);
        setAnimationPhase("revealing");
        onGameSelected(winningGame);

        const timer3 = setTimeout(() => {
          onAnimationComplete();
          isAnimatingRef.current = false; // 动画完成后重置标志
          animationKeyRef.current = "static"; // 重置key
        }, randomTimings.finalDelay);

        return () => clearTimeout(timer3);
      }, randomTimings.revealDelay);

      return () => clearTimeout(timer2);
    }, randomTimings.shrinkDelay);

    return () => {
      clearTimeout(timer1);
      // 动画完成后，只重置isAnimatingRef，保持其他状态
      isAnimatingRef.current = false;
    };
  }, [isShuffling]); // 只依赖isShuffling

  if (displayGames.length === 0) return null;

  return (
    <div className="absolute inset-x-0 sm:inset-x-auto sm:right-2 top-1/2 -translate-y-1/2 sm:w-[800px] h-80">
      {/* 背景卡片组容器 (轮播动画需要overflow-hidden) */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 flex items-center h-full"
          style={{
            transform: animationPhase === "shrinking" || animationPhase === "revealing" ? "scale(0.7)" : "scale(1)",
            filter: animationPhase === "shrinking" || animationPhase === "revealing" ? "brightness(50%)" : "brightness(100%)",
            opacity: animationPhase === "revealing" ? 0.3 : 1,
            transition: `transform ${animationPhase === "shrinking" ? animationTimings.shrinkDuration : 0.3}s ease-out, filter 0.3s, opacity 0.3s`,
          }}
        >
          {/* 2D水平滚动的游戏卡片 */}
          <div
            className="flex gap-2 items-center h-full"
            key={animationKeyRef.current}
            style={{
              transform: `translateX(${animationPhase === "shuffling" || animationPhase === "shrinking" || animationPhase === "revealing" ? -scrollOffset : 0}px)`,
              transition:
                animationPhase === "shuffling" ? `transform ${animationTimings.shuffleDuration}s ${animationTimings.easing}` : "none",
            }}
          >
            {displayGames.map((game, index) => (
              <div
                key={`${game.id}-${index}`}
                className="flex-shrink-0 w-36 sm:w-56 aspect-3/4 relative"
                style={{
                  filter: animationPhase === "shuffling" ? `blur(${animationTimings.blurIntensity}px)` : "blur(0px)",
                  transition: "filter 0.3s",
                }}
              >
                <div className="relative w-full h-full rounded-field overflow-hidden shadow-xl shadow-base-200">
                  <img
                    src={game.image}
                    alt={game.display_game_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/placeholder-game.png";
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 选中游戏的放大卡片 */}
      {selectedGame && animationPhase === "revealing" && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 drop-shadow-[0_25px_50px_hsl(var(--primary)/0.5)]">
          <div className="relative rounded-box group shadow-2xl shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-500">
            <div className="absolute -inset-2 sm:-inset-6 rounded-box bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 blur-xl opacity-60 group-hover:opacity-80 animate-pulse transition-all duration-500" />
            <div className="relative w-40 sm:w-64 aspect-3/4 rounded-box overflow-hidden bg-base-100 shadow-lg group-hover:shadow-xl transition-shadow duration-300 z-10">
              <img src={selectedGame.image} alt={selectedGame.display_game_name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute hidden sm:flex bottom-0 translate-y-1/2 z-10 mx-auto left-0 right-0 items-center justify-center">
              <button
                className="btn btn-primary btn-lg w-36"
                onClick={() => {
                  if (selectedGame?.inner_game_id) {
                    const gameId = selectedGame.game_provider
                      ? `${selectedGame.game_provider}:${selectedGame.inner_game_id}`
                      : selectedGame.inner_game_id;
                    router.push(localizeHref(`/games/${gameId}`));
                  }
                }}
              >
                {t("common:common.play")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
