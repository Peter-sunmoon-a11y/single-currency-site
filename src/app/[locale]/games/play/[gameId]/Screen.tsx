import { decodeRouteParam, searchParamsToObject } from "@/lib/navigation";
import { useSearchParams, useParams } from "next/navigation";
import { GameIframe } from "@/components/game/GameIframe.tsx";
import { useBoundStore } from "@/store";
import { useLaunchGameMutation } from "@/hooks/api/useAuth.ts";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { useGamingGuide } from "@/hooks/api/usePublic.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { trackCustomEvent } from "@/utils/helper.ts";

// 支持两种格式:
//   "provider:inner_game_id"
//   "inner_game_id/provider"  或  "inner_game_id/provider/currency"
function parseGameId(gameId: string): { inner_game_id: string; game_provider: string; path_currency: string } | null {
  if (gameId.includes(":")) {
    const [game_provider, inner_game_id] = gameId.split(":");
    return { inner_game_id, game_provider, path_currency: "" };
  }

  if (gameId.includes("/")) {
    const parts = gameId.split("/");
    if (parts.length < 2) return null;
    const [inner_game_id, game_provider, path_currency = ""] = parts;
    return { inner_game_id, game_provider, path_currency };
  }

  return null;
}

const CASINO_NAV = { to: "/casino" as const, search: {} as any };

const PLAYER_CONTAINER =
  "overflow-hidden min-h-[calc(var(--app-viewport-height,100dvh)-3rem-var(--safe-area-inset-top)-var(--safe-area-inset-bottom))]";
const PLAYER_INNER =
  "w-full h-[calc(var(--app-viewport-height,100dvh)-3rem-var(--safe-area-inset-top)-var(--safe-area-inset-bottom))]";

const GamePlay = () => {

  const navigate = useAppNavigate();
  const isGameFullScreen = useBoundStore((state) => state.isGameFullScreen);

  // 锁住主滚动容器，防止移动端滚动事件抢走 iframe 内的 touch 事件
  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (!el) return;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => { el.style.overflow = prev; };
  }, []);

  const user = useBoundStore((state) => state.user);
  const { gameId } = useParams<{ gameId?: string }>();
  const routeSearchParams = useSearchParams();
  const { currency: search } = searchParamsToObject(routeSearchParams);
  const { t, i18n } = useTranslation();
  const { mutate: launchGame } = useLaunchGameMutation();
  // 游戏详情信息，包含必要启动参数
  const resolvedGameId = decodeRouteParam(gameId);
  const { data: gamingGuide } = useGamingGuide(resolvedGameId);

  const parsed = parseGameId(resolvedGameId);

  const [gameData, setGameData] = useState<{
    launchData: string;
    launchType: "url" | "html";
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!parsed) {
      toast.error(t("toast:failedToLaunchGame"));
      return;
    }

    const { inner_game_id, game_provider, path_currency } = parsed;
    const game_currency = search?.trim() || path_currency || user.currency_fiat || "USDT";
    const origin = window.location.origin;

    const launchParams = {
      lang: i18n.language ?? "en",
      home_url: `${origin}/casino`,
      close_url: `${origin}/casino`,
      deposit_url: `${origin}/finance/deposit`,
      inner_game_id,
      game_provider,
      game_currency
    };

    launchGame(
      {
        inner_game_id,
        game_provider,
        game_currency,
        lang: i18n.language,
        home_url: `${origin}/casino`,
        close_url: `${origin}/casino`,
        deposit_url: `${origin}/finance/deposit`
      },
      {
        onSuccess: (response) => {
          if (response.code === 0 && response.data) {
            setGameData({ launchData: response.data, launchType: response.launch_type });
            trackCustomEvent("user_play_game_freespins", "userPlayGameFreeSpins", {
              ...launchParams,
              user_id: user?.id,
              launchType: response.launch_type
            });
          } else {
            toast.error(response.code === 30009 ? t("toast:cannotBetby") : t("toast:failedToLaunchGame"));
          }
        },
        onError: () => void navigate(CASINO_NAV)
      }
    );
  }, [user]);

  return (
    <div className={PLAYER_CONTAINER}>
      <div className={PLAYER_INNER}>
        <GameIframe
          onError={() => void navigate(CASINO_NAV)}
          gameGuide={gamingGuide}
          launchData={gameData?.launchData}
          launchType={gameData?.launchType}
          isFullScreen={isGameFullScreen}
        />
      </div>
    </div>
  );
};

export const beforeLoad = undefined;

export default GamePlay;
