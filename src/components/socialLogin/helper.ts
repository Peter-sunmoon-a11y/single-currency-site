import { analyticsConfig } from "@/lib/env";
import { getSocialList } from "@/services/public/auth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const SOCIAL_LIST_IDLE_TIMEOUT_MS = 1500;

export function sleep(seconds = 3_000) {
  return new Promise((resolve) => setTimeout(() => {
    resolve(true);
  }, seconds));
}

export function getAdvertisementParams() {
  let ad_param = "";

  // For RoiBest
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("__rb_") && key.endsWith("_params")) {
      ad_param = localStorage.getItem(key) || "";
      break;
    }
  }

  let pixelIdFromAdParam = "";
  try {
    const normalized = ad_param.startsWith("?") ? ad_param.slice(1) : ad_param;
    pixelIdFromAdParam = new URLSearchParams(normalized).get("pixel_id") || "";
  } catch {
    pixelIdFromAdParam = "";
  }

  return {
    fbp: cookie("_fbp") || "",
    fbc: cookie("_fbc") || "",
    pixel_id: pixelIdFromAdParam || analyticsConfig.facebookPixelId || "",
    ad_param
  };
}

export function cookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function parseURLParamsToJson(uri: string) {
  return Object.fromEntries(new URLSearchParams(decodeURIComponent(uri)).entries());
}

export const auth_themes = {
  google: `linear-gradient(135deg,#4285f4 0%, #ea4335 25%,#fbbc04 50%,#34a853 75%,#4285f4 100%)`
};

type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export const useSocialList = (enabled?: boolean) => {
  const [delayedEnabled, setDelayedEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDelayedEnabled(false);
      return;
    }

    let timeoutId: number | null = null;
    let idleId: number | null = null;
    let activated = false;
    const idleWindow = window as IdleWindow;

    const activate = () => {
      if (activated) return;
      activated = true;
      setDelayedEnabled(true);
    };

    if (idleWindow.requestIdleCallback) {
      idleId = idleWindow.requestIdleCallback(activate, { timeout: SOCIAL_LIST_IDLE_TIMEOUT_MS });
    } else {
      timeoutId = window.setTimeout(activate, SOCIAL_LIST_IDLE_TIMEOUT_MS);
    }

    return () => {
      if (idleId !== null && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [enabled]);

  return useQuery({
    queryKey: ["socialList"],
    queryFn: () => getSocialList(),
    enabled: delayedEnabled
  });
};
