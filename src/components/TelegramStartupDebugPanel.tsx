import { useEffect, useMemo, useState } from "react";

import {
  getTelegramInitData,
  getTelegramLaunchParamsSnapshot,
  getTelegramViewportSnapshot,
  hasTelegramWebAppQuery,
  isTelegramContext,
  isTelegramWebApp,
} from "@/utils/telegramWebApp";

type TelegramBootDebugState = {
  phase?: string;
  reason?: string;
  ready?: boolean;
  mounted?: boolean;
  hasInitData?: boolean;
  initDataLength?: number;
  loginStatus?: "idle" | "pending" | "success" | "failed";
  error?: string;
  timestamp?: number;
  attempts?: number;
};

declare global {
  interface Window {
    __tgDebugBoot?: TelegramBootDebugState;
  }
}

const readBootState = () => {
  if (typeof window === "undefined") return null;
  return window.__tgDebugBoot ?? null;
};

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleTimeString();
};

export function TelegramStartupDebugPanel() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((v) => v + 1), 800);
    return () => window.clearInterval(timer);
  }, []);

  const snapshot = useMemo(() => {
    if (typeof window === "undefined") return null;

    const initData = getTelegramInitData();
    const launchParams = getTelegramLaunchParamsSnapshot();
    const boot = readBootState();

    return {
      location: {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
      flags: {
        isTelegramWebApp: isTelegramWebApp(),
        isTelegramContext: isTelegramContext(),
        hasTelegramWebAppQuery: hasTelegramWebAppQuery(),
      },
      initData: {
        hasInitData: Boolean(initData),
        length: initData.length,
      },
      launchParams,
      viewport: getTelegramViewportSnapshot(),
      boot,
      userAgent: navigator.userAgent,
    };
  }, [tick]);

  if (!snapshot) return null;

  const shouldShow = snapshot.flags.isTelegramContext || /Telegram/i.test(snapshot.userAgent);

  if (!shouldShow) return null;

  return (
    <details
      open
      className="fixed bottom-24 right-3 z-9999 w-[min(92vw,26rem)] rounded-lg border border-base-content/20 bg-base-100/95 p-2 text-xs shadow-2xl backdrop-blur"
    >
      <summary className="cursor-pointer select-none font-semibold">Telegram Debug</summary>
      <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
        <span>context</span>
        <span>{String(snapshot.flags.isTelegramContext)}</span>
        <span>webApp</span>
        <span>{String(snapshot.flags.isTelegramWebApp)}</span>
        <span>query</span>
        <span>{String(snapshot.flags.hasTelegramWebAppQuery)}</span>
        <span>initData</span>
        <span>{snapshot.initData.hasInitData ? `yes (${snapshot.initData.length})` : "no"}</span>
        <span>boot phase</span>
        <span>{snapshot.boot?.phase ?? "-"}</span>
        <span>login</span>
        <span>{snapshot.boot?.loginStatus ?? "-"}</span>
        <span>attempts</span>
        <span>{snapshot.boot?.attempts ?? 0}</span>
        <span>reason</span>
        <span>{snapshot.boot?.reason ?? "-"}</span>
        <span>error</span>
        <span>{snapshot.boot?.error ?? "-"}</span>
        <span>updated</span>
        <span>{formatTimestamp(snapshot.boot?.timestamp)}</span>
      </div>

      <div className="mt-2 max-h-52 overflow-auto rounded bg-base-200/60 p-2 font-mono text-[10px] leading-relaxed">
        <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(
            {
              location: snapshot.location,
              launchParams: snapshot.launchParams,
              viewport: snapshot.viewport,
              boot: snapshot.boot,
            },
            null,
            2,
          )}
        </pre>
      </div>
    </details>
  );
}
