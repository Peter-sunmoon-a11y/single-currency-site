import { usePortalContainer } from "@/contexts/PortalContainerContext";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { cn } from "@/utils/cn";
import { getImgCompressParams } from "@/utils/helper.ts";
import { createPortal } from "react-dom";

interface GameLoadingScreenProps {
  sample?: boolean;
  gameGuide?: Record<string, any> | null;
  fixed?: boolean;
  topOffset?: string;
}

/** Steam 风格全屏游戏加载页：游戏名居中 + 底部进度条 */
export function GameLoadingScreen({
  sample = true,
  gameGuide,
  fixed = false,
  topOffset = "calc(var(--safe-area-inset-top) + var(--app-header-height))",
}: GameLoadingScreenProps) {
  const { t } = useTranslation("common");
  const portalContainer = usePortalContainer();
  const showGameMeta = sample && gameGuide;
  const rootClassName = cn(
    "flex flex-col bg-base-300 select-none z-[1002]",
    fixed ? "fixed inset-x-0 bottom-0" : "absolute inset-0"
  );
  const rootStyle = fixed ? { top: topOffset } : undefined;
  const shouldPortal = fixed && typeof document !== "undefined";

  const content = (
    <div className={rootClassName} style={rootStyle}>
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {showGameMeta
          ? <>
            <img
              src={getImgCompressParams(gameGuide?.image, 180, 100, 240)}
              alt={gameGuide?.display_game_name}
              loading="lazy"
              className="-z-1 absolute rounded-md object-center shrink-0 opacity-35 w-[180px] h-[240px]" />
            <div className="flex flex-col gap-1 w-full text-center">
              <p className="text-2xl font-bold px-[10%]">{gameGuide?.display_game_name}</p>
              <span className={"font-bold italic text-base text-primary"}>{gameGuide?.provider_name}</span>
            </div>
          </>
          : <div className="flex items-end gap-1">
            <img src="/favicon/logo-400w.png" alt="" className={'w-50'} />
          </div>}
      </div>

      <div className="px-10 pb-16 space-y-2">
        <p className="text-base-content/50 text-sm font-bold italic">{t("common.loading")}…</p>
        <div className="w-full h-[4px] bg-base-content/20 overflow-hidden rounded-lg">
          <div className="h-full bg-primary/70 origin-left animate-[progress-loop_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );

  return shouldPortal ? createPortal(content, portalContainer ?? document.body) : content;
}
