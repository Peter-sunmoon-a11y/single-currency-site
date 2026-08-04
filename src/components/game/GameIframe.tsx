import { GameLoadingScreen } from "@/components/game/GameLoadingScreen.tsx";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft } from "lucide-react";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { isSlotsGame } from "@/sections/joker-bonus/slotsGuard.ts";

interface GameIframeProps {
  launchData?: string;
  launchType?: "url" | "html";
  isFullScreen?: boolean;
  onError?: () => void;
  onClose?: () => void;
  onLoad?: () => void;
  gameGuide: Record<string, any>;
}

const IFRAME_ALLOW =
  "microphone; camera; payment; autoplay; encrypted-media; storage-access";
const IFRAME_ALLOW_FULLSCREEN =
  `fullscreen; ${IFRAME_ALLOW}`;
const IFRAME_SANDBOX =
  "allow-forms allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-downloads allow-storage-access-by-user-activation";

const JokerBonusGameOverlay = dynamic(
  () => import("@/sections/joker-bonus/JokerBonusGameOverlay.tsx").then((mod) => mod.JokerBonusGameOverlay),
  { ssr: false, loading: () => null }
);

// ─── GameIframe ─────────────────────────────────────────────────────────────

export function GameIframe(
  {
    onLoad,
    onError,
    onClose,
    gameGuide,
    launchData,
    launchType,
    isFullScreen = false
  }: GameIframeProps) {

  const navigate = useAppNavigate();
  // iframeLoading 初始 true：覆盖"等待 launchData"和"等待 iframe onLoad"两个阶段
  const [iframeLoading, isFrameLoading] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  // const openModal = useBoundStore((state) => state.openModal);

  useEffect(() => {
    if (!isFullScreen) return;
    document.documentElement.classList.add("game-fullscreen");
    return () => document.documentElement.classList.remove("game-fullscreen");
  }, [isFullScreen]);

  // ⚠️ React 执行顺序：渲染 → Commit DOM（写入新 src）→ 旧 cleanup → 新 setup
  //    因此 cleanup 可能在 launchData 变化时触发，此时 iframe 已加载新内容。
  //    必须把"blob 回收 / srcdoc 清空 / stop()"和"about:blank 导航"拆成两个 effect：
  //    前者跟随 launchData 变化执行（释放旧资源），后者仅在组件真正卸载时执行。
  //
  //    若将 about:blank 放在 [launchData] cleanup 里，会在 React Commit 新 src 之后
  //    再覆盖为 about:blank，而 React 虚拟 DOM 认为 src 未变故不会重写，导致白屏。
  //    StrictMode 的双调用（setup→cleanup→setup）同样会触发此问题。

  // 用 ref 保存最新 iframe 引用，供卸载专用 effect 使用
  // （组件卸载时 iframeRef.current 已被 React 置 null，需自行保留）
  const iframeForUnmount = useRef<HTMLIFrameElement | null>(null);

  // ⚠️ StrictMode 在同一 event loop tick 内执行 setup → cleanup → setup。
  //    所有修改 iframe DOM 的操作（stop / srcdoc="" / about:blank）都放在 [] effect，
  //    由 iframeForUnmount.current 把守：setTimeout(0) 让赋值发生在 StrictMode 模拟
  //    卸载之后，模拟卸载时 ref 仍为 null，跳过清理，不会白屏或中断加载。
  //
  //    [launchData] cleanup 只做 Blob URL 回收（纯内存操作，不碰 iframe DOM），
  //    同时 clearTimeout 确保 dep 变化时赋值也被取消（不影响新游戏加载）。
  useEffect(() => {
    if (!launchData) return;
    const iframe = iframeRef.current;
    const t = setTimeout(() => { iframeForUnmount.current = iframe; }, 0);

    return () => {
      clearTimeout(t);
      // 仅回收 Blob URL，不操作 iframe DOM
      if (launchData.startsWith("blob:")) URL.revokeObjectURL(launchData);
    };
  }, [launchData]);

  // 真正卸载时才执行重资源清理
  useEffect(() => {
    return () => {
      const iframe = iframeForUnmount.current;
      if (!iframe) return;
      try {
        const win = iframe.contentWindow;
        if (win) {
          win.onbeforeunload = null;      // 阻止游戏弹"确认退出"对话框
          win.stop();                     // 停止所有进行中的网络请求和脚本
        }
      } catch { /* 跨域 iframe 无法访问 contentWindow，忽略 */ }
      if (iframe.srcdoc) iframe.srcdoc = ""; // srcDoc 游戏 HTML 可能数 MB，提前释放
      iframe.src = "about:blank";            // 触发页面卸载，销毁 WS/WebRTC/AudioContext
    };
  }, []);

  const handleBack = () => (onClose ? onClose() : navigate({ back: true }));

  const handleLoad = () => {
    isFrameLoading(false);
    onLoad?.();
  };

  const shouldShowJokerOverlay = isSlotsGame(gameGuide);

  // url 和 html 两种类型合为一个 iframe，避免重复
  const iframe = launchData && launchType ? (
    <iframe
      ref={iframeRef}
      {...(launchType === "url" ? { src: launchData } : { srcDoc: launchData })}
      className="h-full w-full border-none"
      allowFullScreen={isFullScreen}
      allow={isFullScreen ? IFRAME_ALLOW_FULLSCREEN : IFRAME_ALLOW}
      sandbox={IFRAME_SANDBOX}
      onLoad={handleLoad}
      onError={onError}
      title="Game"
    />
  ) : null;

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[1002] bg-base-400">
        <button
          onClick={handleBack}
          className="fixed z-[9999] btn btn-sm btn-circle btn-primary btn-soft h-7 w-7"
          style={{
            top: "calc(var(--safe-area-inset-top) + 1rem)",
            left: "calc(var(--safe-area-inset-left) + 1rem)"
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {(iframeLoading || !gameGuide) && <GameLoadingScreen gameGuide={gameGuide} />}

        <div className="h-[100dvh] w-full">{iframe}</div>

        {shouldShowJokerOverlay && <JokerBonusGameOverlay active page="game_play" />}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {(iframeLoading || !gameGuide) && <GameLoadingScreen gameGuide={gameGuide} />}

      <div className="h-full w-full overflow-hidden">
        {iframe}
      </div>

      {shouldShowJokerOverlay && <JokerBonusGameOverlay active page="game_play" />}
    </div>
  );
}
