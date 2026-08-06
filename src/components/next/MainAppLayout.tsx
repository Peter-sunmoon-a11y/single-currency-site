"use client";

import { MainAppDock } from "@/components/MainAppDock.tsx";
import Header from "@/components/header/Header";
import { MainAppSidebar } from "@/components/next/MainAppSidebar";
import { PortalContainerProvider } from "@/contexts/PortalContainerContext";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn";
import { scheduleIdle } from "@/utils/helper";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import React from "react";
import { isSupportedLocale } from "@/lib/i18n/config";

const LazyModalManager = dynamic(() => import("@/components/modal/LazyModalManager"), {
  ssr: false,
  loading: () => null,
});

const FreeSpinContainer = dynamic(() => import("@/sections/free-spins").then((mod) => mod.FreeSpinContainer), {
  ssr: false,
  loading: () => null,
});

const LuckySpinContainer = dynamic(() => import("@/sections/lucky-spin/lucky-spin-container.tsx").then((mod) => mod.LuckySpinContainer), {
  ssr: false,
  loading: () => null,
});

const DepositPromotion = dynamic(() => import("@/sections/finance/DepositPromotion.tsx").then((mod) => mod.DepositPromotion), {
  ssr: false,
  loading: () => null,
});

const JokerBonusMqttListener = dynamic(() => import("@/sections/joker-bonus/JokerBonusMqttListener.tsx").then((mod) => mod.JokerBonusMqttListener), {
  ssr: false,
  loading: () => null,
});

const Toaster = dynamic(() => import("@/components/ui/sonner").then((mod) => mod.Toaster), {
  ssr: false,
  loading: () => null,
});

const PwaUpdateToastHost = dynamic(() => import("@/components/PwaUpdateToastHost").then((mod) => mod.PwaUpdateToastHost), {
  ssr: false,
  loading: () => null,
});

const BountyBonusContainer = dynamic(
  () => import("@/sections/bounty-bonus/bounty-bonus-container.tsx").then((mod) => mod.BountyBonusContainer),
  {
    ssr: false,
    loading: () => null,
  }
);

const normalizeGamePathname = (pathname: string) => {
  if (pathname === "/games" || pathname.startsWith("/games/")) {
    return pathname;
  }

  const [, maybeLocale, route, ...rest] = pathname.split("/");

  if (isSupportedLocale(maybeLocale) && route === "games") {
    return rest.length > 0 ? `/games/${rest.join("/")}` : "/games";
  }

  return pathname;
};

export function MainAppLayout({ children }: { children: React.ReactNode }) {
  const mainRef = React.useRef<HTMLElement>(null);

  const [isIdleUiReady, setIsIdleUiReady] = React.useState(false);
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null);

  const pathname = usePathname();
  const headerBackAction = useBoundStore((s) => s.headerBackAction);

  const normalizedPathname = normalizeGamePathname(pathname);
  const isGamePlayPage = normalizedPathname.startsWith("/games/play/");
  const isGameDetailPage = normalizedPathname.startsWith("/games/");
  const isInGameOverlay = isGameDetailPage && Boolean(headerBackAction);
  const shouldShowDock = !(isGamePlayPage || isInGameOverlay);

  // 离开游戏页时清理全屏标记，避免遗留样式影响后续页面。
  React.useEffect(() => {
    if (!normalizedPathname.startsWith("/games/")) {
      document.documentElement.classList.remove("game-fullscreen");
    }
  }, [normalizedPathname]);

  React.useEffect(() => {
    let cancelled = false;

    const enableIdleUi = () => {
      if (!cancelled) setIsIdleUiReady(true);
    };

    const cleanupIdle = scheduleIdle(enableIdleUi);

    return () => {
      cancelled = true;
      cleanupIdle();
    };
  }, []);

  const appContent = (
    <>
      {/* 侧边栏：全局导航抽屉，延迟加载以减少首屏开销 */}
      <MainAppSidebar />
      <div className="min-h-0 flex-1 flex flex-col overflow-hidden" style={{ overscrollBehavior: "none" }}>
        <Header />
        <main
          id="main-scroll"
          ref={mainRef}
          className={cn(
            "flex-1 w-full hide-scrollbar",
            "min-h-0",
            "overflow-y-auto overflow-x-hidden",
            "pt-[calc(var(--app-header-height)+var(--safe-area-inset-top))]",
            shouldShowDock ? "pb-[calc(var(--app-dock-height)+var(--safe-area-inset-bottom))]" : ""
          )}
          style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        >
          {children}
        </main>
      </div>
      {/* 底部主导航：页面级入口与切换操作 */}
      <MainAppDock visible={shouldShowDock} />
      {/* 每日首存奖励 */}
      <DepositPromotion />
      {/* 免费旋转-赠送玩游戏次数 */}
      <FreeSpinContainer />
      {/* 幸运轮盘 */}
      <LuckySpinContainer />
      {/* 全局弹窗层：统一挂载所有懒加载 modal */}
      <LazyModalManager />
      {/* Joker Bonus 全局 MQTT 监听：实时接收新实例并写入本地 storage */}
      <JokerBonusMqttListener />
      {/* 赏金游戏-可以领奖励的提醒 */}
      <BountyBonusContainer />
    </>
  );

  return (
    <div className="main-app-shell fixed inset-0 flex items-center justify-center bg-base-300" style={{ overscrollBehavior: "none" }}>
      <div
        ref={setPortalContainer as React.RefCallback<HTMLDivElement>}
        className="main-app-shell__frame phone-frame relative min-h-0 flex overflow-hidden bg-base-300"
        style={{ transform: "translateZ(0)", overscrollBehavior: "none" }}
      >
        {/* 统一 app shell，由 CSS 决定是否展示 phone frame */}
        <PortalContainerProvider value={portalContainer}>
          {appContent}
        </PortalContainerProvider>
      </div>
      <div className="main-app-shell__toast absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 999 }}>
        <div className="main-app-shell__toast-inner [&>*]:pointer-events-auto" style={{ transform: "translateZ(0)" }}>
          {/* 全局通知出口：始终跟随 app shell 尺寸 */}
          {isIdleUiReady && <Toaster position="top-center" style={{ marginTop: "var(--safe-area-inset-top)" }} />}
          {isIdleUiReady && <PwaUpdateToastHost />}
        </div>
      </div>
    </div>
  );
}
