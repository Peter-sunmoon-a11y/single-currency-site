"use client";

import { runtimeConfig } from "@/lib/env";
import { useBoundStore } from "@/store";
import { useEffect } from "react";

export const ServiceWorkerRegister = () => {
  const setPwaUpdateAvailable = useBoundStore((s) => s.setPwaUpdateAvailable);

  useEffect(() => {
    const isDebugToastEnabled = runtimeConfig.isDev && new URLSearchParams(window.location.search).get("pwaUpdateToast") === "1";

    if (isDebugToastEnabled) {
      setPwaUpdateAvailable(true);
    }

    if (!window.isSecureContext) return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    let visibilityHandler: (() => void) | null = null;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (cancelled) return;

        const checkForUpdate = async () => {
          try {
            await registration.update();
          } catch {
            // ignore transient update failures
          }
        };

        const markUpdateAvailable = () => {
          if (!cancelled && registration.waiting) {
            setPwaUpdateAvailable(true);
          }
        };

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed") {
              markUpdateAvailable();
            }
          });
        });

        if (registration.waiting) {
          markUpdateAvailable();
        }

        await checkForUpdate();

        visibilityHandler = () => {
          if (document.visibilityState === "visible") {
            void checkForUpdate();
          }
        };
        document.addEventListener("visibilitychange", visibilityHandler);
      } catch {
        // ignore registration failures and keep the app usable
      }
    };

    void register();

    return () => {
      cancelled = true;
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
    };
  }, [setPwaUpdateAvailable]);

  return null;
};
