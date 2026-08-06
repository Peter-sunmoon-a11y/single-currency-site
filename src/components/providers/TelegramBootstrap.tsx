"use client";

import { useTelegramBootstrapState } from "@/hooks/useTelegramBootstrapState";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function TelegramBootstrap() {
  const { t } = useTranslation(["toast", "login", "common"]);
  const { showLoginFailedNotice, hideLoginFailedNotice } = useTelegramBootstrapState();
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    // TG 登录失败后，用和版本更新一致的 toast 形态提示用户重试。
    if (!showLoginFailedNotice) {
      if (toastIdRef.current !== null) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      return;
    }

    if (toastIdRef.current !== null) return;

    toastIdRef.current = toast.info(t("toast:signInFailed", "Sign in failed"), {
      // 失败态不占页面布局，只提供最小重试入口。
      description: t("login:tgReopenHint", "Please reopen this page from Telegram or reload and try again."),
      action: {
        label: t("common:reload", "Reload"),
        onClick: () => {
          hideLoginFailedNotice();
          window.location.reload();
        },
      },
      closeButton: false,
      duration: Infinity,
      position: "top-center",
      onDismiss: () => {
        hideLoginFailedNotice();
        toastIdRef.current = null;
      },
    });
  }, [hideLoginFailedNotice, showLoginFailedNotice, t]);

  return null;
}
