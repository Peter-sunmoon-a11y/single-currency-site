"use client";

import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const PwaUpdateToastHost = () => {
  const { t } = useTranslation("pwa");
  const updateAvailable = useBoundStore((s) => s.pwaUpdateAvailable);
  const setUpdateAvailable = useBoundStore((s) => s.setPwaUpdateAvailable);
  const toastIdRef = useRef<string | number | null>(null);
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (!updateAvailable) return;
    if (toastIdRef.current !== null) return;

    const dismiss = () => {
      if (toastIdRef.current !== null) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    };

    const controllerChange = () => {
      if (!refreshingRef.current) return;
      refreshingRef.current = false;
      setUpdateAvailable(false);
      dismiss();
      window.location.reload();
    };

    const refresh = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        const waiting = registration?.waiting;
        if (!waiting) {
          setUpdateAvailable(false);
          dismiss();
          window.location.reload();
          return;
        }

        refreshingRef.current = true;
        waiting.postMessage({ type: "SKIP_WAITING" });
      } catch {
        setUpdateAvailable(false);
        dismiss();
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", controllerChange);
    toastIdRef.current = toast.info(t("updateTitle", "New version ready"), {
      description: t("updateDescription", "Refresh to load the latest version."),
      action: {
        label: t("refreshNow", "Refresh"),
        onClick: () => void refresh(),
      },
      closeButton: false,
      duration: Infinity,
      position: "top-center",
      onDismiss: () => {
        setUpdateAvailable(false);
        dismiss();
      },
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChange);
      dismiss();
    };
  }, [setUpdateAvailable, t, updateAvailable]);

  return null;
};
