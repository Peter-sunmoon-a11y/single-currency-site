import { useParams } from "next/navigation";
import { GameIframe } from "@/components/game/GameIframe.tsx";
import { useBoundStore } from "@/store";
import { useLaunchDemoGameMutation, useLaunchGameMutation } from "@/hooks/api/useAuth.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { trackCustomEvent } from "@/utils/helper";
import { PromoGuard } from "@/sections/casino/PromoGuard.tsx";
import { GamingGuard } from "@/sections/gameId/gaming-guard.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Gamepad, Gamepad2 } from "lucide-react";
import {
  RegionalAccessProhibited,
  CurrencySettlementProhibited,
  InsufficientBalance, MainContent, HeroBanner,
  GAME_PANEL_CLS, GAME_PANEL_STYLE
} from "@/sections/gameId/components.tsx";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { BigWinGuard } from "@/sections/gameId/big-win-guard.tsx";
import { GameLoadingScreen } from "@/components/game/GameLoadingScreen.tsx";

/** isDirectPlay 模式：mount 时触发一次，useRef 防止 StrictMode 重复调用 */
const AutoPlayTrigger = ({ onPlay }: { onPlay: () => void }) => {
  const triggered = useRef(false);
  useEffect(() => {
    if (!triggered.current) {
      triggered.current = true;
      onPlay();
    }
  }, []);
  return null;
};

// Game Detail Component
const GameDetail = () => {
  const { gameId } = useParams();

  const { t, i18n } = useTranslation(["common", "menu", "gameDetail", "bonus"]);

  const { navigateCallback } = useNavigateGuard();

  const { setHeaderBackAction } = useBoundStore();

  const isDirectPlay = useBoundStore((s) => s.isDirectPlay);
  const isGameFullScreen = useBoundStore((state) => state.isGameFullScreen);
  const setGameFullScreen = useBoundStore((state) => state.setGameFullScreen);

  const [currentGameInfo, setCurrentGameInfo] = useState<{
    launchData: string;
    launchType: "url" | "html";
  } | null>(null);

  const user = useBoundStore((state) => state.user);
  const { mutate: launchGame, isPending: isLaunchingGame } = useLaunchGameMutation();
  const { mutate: launchDemoGame, isPending: isLaunchingDemoGame } = useLaunchDemoGameMutation();

  // 关闭游戏：退出全屏 → 清除游戏数据
  const onClose = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
    setGameFullScreen(false);
    setCurrentGameInfo(null);
  }, [gameId]);

  // 游戏运行时将 header 返回按钮绑定到关闭游戏，离开时清除
  useEffect(() => {
    setHeaderBackAction(currentGameInfo ? onClose : null);
    return () => setHeaderBackAction(null);
  }, [currentGameInfo, onClose]);

  return (
    <PromoGuard>
      <GamingGuard>
        {({
            gamingGuide,
            gameCurrency,
            supportGameTrial,
            is_insufficient,
            is_regional_access_prohibited,
            is_currency_settlement_prohibited
          }) => {

          const handlePlayNow = () => {
            if (is_insufficient) {
              toast.error(t("finance:insufficient_balance"));
              return;
            }
            if (is_regional_access_prohibited) {
              toast.error(t("common.gameNotAccessibleInYourRegion"));
              return;
            }
            if (is_currency_settlement_prohibited) {
              toast.error(t("common.gameAccessibleToCurrencies"));
              return;
            }

            const origin = window.location.origin;
            const launchParams = {
              lang: i18n.language ?? "en",
              home_url: `${origin}/casino`,
              close_url: `${origin}/casino`,
              deposit_url: `${origin}/finance/deposit`,
              inner_game_id: gamingGuide.inner_game_id,
              game_provider: gamingGuide.game_provider,
              game_currency: gameCurrency
            };

            launchGame(launchParams, {
              onSuccess: (response) => {
                if (response.code === 0 && response.data) {
                  setCurrentGameInfo({ launchData: response.data, launchType: response.launch_type });
                  trackCustomEvent("user_play_game", "userPlayGame", {
                    ...launchParams,
                    user_id: user?.id,
                    launchType: response.launch_type
                  });
                } else {
                  // 体育彩金币种无法玩其他游戏
                  toast.error(response.code === 30009 ? t("toast:cannotBetby") : t("toast:failedToLaunchGame"));
                }
              },
              onError: () => toast.error(t("toast:failedToLaunchGame"))
            });
          };

          const handlePlayTry = () => {
            if (is_regional_access_prohibited) {
              toast.error(t("common.gameNotAccessibleInYourRegion"));
              return;
            }

            const origin = window.location.origin;
            launchDemoGame({
              lang: i18n.language.toUpperCase(),
              home_url: `${origin}/casino`,
              close_url: `${origin}/casino`,
              deposit_url: `${origin}/finance/deposit`,
              inner_game_id: gamingGuide.inner_game_id,
              game_provider: gamingGuide.game_provider,
              game_currency: gameCurrency
            }, {
              onSuccess: (response) => {
                if (response.code === 0 && response.data) {
                  setCurrentGameInfo({ launchData: response.data, launchType: response.launch_type });
                } else {
                  toast.error(t("toast:failedToLaunchDemoGame"));
                }
              },
              onError: () => toast.error(t("toast:failedToLaunchDemoGame"))
            });
          };

          return (
            <BigWinGuard isPlaying={!!currentGameInfo}>
              {/* 游戏运行中：全屏 / 非全屏共用同一 GameIframe 实例，切全屏只改 props，
                  避免卸载重建导致游戏重载或 StrictMode 下 about:blank 白屏。 */}
              {currentGameInfo ? (
                <div
                  className={!isGameFullScreen ? GAME_PANEL_CLS : undefined}
                  style={!isGameFullScreen ? GAME_PANEL_STYLE : undefined}
                >
                  <div className={!isGameFullScreen ? "h-[calc(100%)] w-full" : undefined}>
                    <GameIframe
                      onError={() => toast.error(t("toast:failedToLaunchGame"))}
                      onClose={onClose}
                      gameGuide={gamingGuide}
                      launchData={currentGameInfo.launchData}
                      launchType={currentGameInfo.launchType}
                      isFullScreen={isGameFullScreen}
                    />
                  </div>
                </div>
              ) : isDirectPlay ? (
                <div
                  className={GAME_PANEL_CLS}
                  style={GAME_PANEL_STYLE}
                >
                  <div className="h-[calc(100%)] w-full">
                    <AutoPlayTrigger onPlay={() => navigateCallback(handlePlayNow, true)} />
                    <GameLoadingScreen sample={true} gameGuide={gamingGuide} fixed />
                  </div>
                </div>
              ) : (
                <div className="min-h-screen flex flex-col">

                  {/* ── Hero Banner ── */}
                  <HeroBanner image={gamingGuide?.image} display_game_name={gamingGuide?.display_game_name} />

                  {/* ── 主内容 ── */}
                  <MainContent gamingGuide={gamingGuide} />

                  {/* ── 底部操作栏（sticky）── */}
                  <div className="sticky bottom-0 mt-auto">
                    <div className="flex flex-col gap-1 p-4 bg-base-300">
                      {is_insufficient && <InsufficientBalance />}
                      {is_regional_access_prohibited && <RegionalAccessProhibited />}
                      {is_currency_settlement_prohibited && <CurrencySettlementProhibited />}
                      <div className="flex gap-2">
                        <ConfirmBox
                          onClick={() => navigateCallback(handlePlayNow, true)}
                          loading={isLaunchingGame}
                          disabled={isLaunchingGame}
                          className="btn btn-primary flex-1 text-sm uppercase"
                        >
                          <Gamepad2 className="" />{t("gameDetail:play", "Play")}
                        </ConfirmBox>
                        {supportGameTrial && (
                          <ConfirmBox
                            onClick={() => navigateCallback(handlePlayTry, true)}
                            loading={isLaunchingDemoGame}
                            disabled={isLaunchingDemoGame}
                            className="btn btn-ghost flex-1 uppercase text-sm"
                          >
                            <Gamepad className="" />{t("gameDetail:demoPlay", "Demo")}
                          </ConfirmBox>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </BigWinGuard>
          );
        }}
      </GamingGuard>
    </PromoGuard>
  );
};

export const beforeLoad = undefined;

export default GameDetail;
