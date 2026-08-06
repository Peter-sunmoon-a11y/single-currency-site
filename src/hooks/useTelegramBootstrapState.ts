"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLoginByTMA } from "@/hooks/api/useAuth";
import { useTelegramContext } from "@/hooks/useTelegramContext";
import { useBoundStore } from "@/store";
import { hasAuth } from "@/utils/auth";
import { uuidv4Generate } from "@/utils/helper.ts";
import {
  ensureTelegramSdkMounted,
  getTelegramInitData,
  markTelegramReady,
} from "@/utils/telegramWebApp";
import { useEffect, useRef, useState } from "react";

const TG_LOGIN_FAILED_SESSION_KEY = "__tg_tma_login_failed";
const TG_LOGIN_ATTEMPTS_SESSION_KEY = "__tg_tma_login_attempts";
const TG_BLOCKED_MODAL_EVENT = "tg:blocked-modal";

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

function updateTelegramBootDebugState(patch: Partial<TelegramBootDebugState>) {
  if (typeof window === "undefined") return;

  const current = ((window as Window & { __tgDebugBoot?: TelegramBootDebugState }).__tgDebugBoot ?? {}) as TelegramBootDebugState;
  (window as Window & { __tgDebugBoot?: TelegramBootDebugState }).__tgDebugBoot = {
    ...current,
    ...patch,
    timestamp: Date.now(),
  };
}

function readSessionFlag(key: string) {
  if (typeof window === "undefined") return false;

  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string, value: boolean) {
  if (typeof window === "undefined") return;

  try {
    if (value) {
      window.sessionStorage.setItem(key, "1");
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // ignore storage failures
  }
}

function readSessionNumber(key: string) {
  if (typeof window === "undefined") return 0;

  try {
    const value = Number(window.sessionStorage.getItem(key) ?? "0");
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeSessionNumber(key: string, value: number) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(key, String(value));
  } catch {
    // ignore storage failures
  }
}

export function useTelegramBootstrapState() {
  const { user, isInitialized, refetchUser } = useAuth();
  const { mutateAsync: loginByTMA, isPending: isTmaLoginPending } = useLoginByTMA();
  const isTelegram = useTelegramContext();
  const closeModal = useBoundStore((state) => state.closeModal);
  const isAuthModalOpen = useBoundStore((state) => "OPEN_AUTH_MODAL" in state.modals);
  const isLoginAttemptInFlightRef = useRef(false);
  const [showLoginFailedNotice, setShowLoginFailedNotice] = useState(false);
  const isAuthenticated = Boolean(user || hasAuth());

  useEffect(() => {
    if (!isTelegram) return;
    // 登录失败状态只在 TG 场景下恢复，避免普通 H5 被误伤。
    setShowLoginFailedNotice(readSessionFlag(TG_LOGIN_FAILED_SESSION_KEY));
  }, [isTelegram]);

  useEffect(() => {
    if (!isTelegram) return;

    const handleBlockedModal = (event: Event) => {
      if (isAuthenticated) return;

      // TG 环境下如果还有旧认证弹窗入口被触发，直接切到失败提示。
      const modalType = event instanceof CustomEvent ? event.detail?.type : undefined;
      setShowLoginFailedNotice(true);
      updateTelegramBootDebugState({
        phase: "blocked-modal",
        reason: modalType ?? "unknown-modal",
        loginStatus: "failed",
      });
    };

    window.addEventListener(TG_BLOCKED_MODAL_EVENT, handleBlockedModal);
    return () => window.removeEventListener(TG_BLOCKED_MODAL_EVENT, handleBlockedModal);
  }, [isAuthenticated, isTelegram]);

  useEffect(() => {
    if (!isTelegram) {
      updateTelegramBootDebugState({
        phase: "skipped",
        reason: "not-telegram-context",
        loginStatus: "idle",
      });
      return;
    }

    updateTelegramBootDebugState({
      phase: "mounting",
      reason: "telegram-context-detected",
      loginStatus: "idle",
      attempts: readSessionNumber(TG_LOGIN_ATTEMPTS_SESSION_KEY),
    });

    void ensureTelegramSdkMounted().then((mounted) => {
      updateTelegramBootDebugState({
        phase: mounted ? "mounted" : "mount-failed",
        mounted,
        ready: mounted,
        hasInitData: Boolean(getTelegramInitData()),
        initDataLength: getTelegramInitData().length,
      });

      if (mounted) {
        // 让 Telegram 客户端知道页面已准备好，再进入自动登录阶段。
        markTelegramReady();
        updateTelegramBootDebugState({
          phase: "ready",
          ready: true,
        });
      }
    });
  }, [isTelegram]);

  useEffect(() => {
    if (!isTelegram || !isAuthModalOpen) return;
    // TG 内不允许把普通认证弹窗拉出来，统一收口。
    closeModal("OPEN_AUTH_MODAL");
  }, [closeModal, isAuthModalOpen, isTelegram]);

  useEffect(() => {
    if (!isTelegram) return;
    if (!isInitialized) return;
    if (isAuthenticated) {
      setShowLoginFailedNotice(false);
      updateTelegramBootDebugState({
        phase: "authenticated",
        loginStatus: "success",
      });
      return;
    }
    if (isTmaLoginPending || isLoginAttemptInFlightRef.current) return;
    if (readSessionFlag(TG_LOGIN_FAILED_SESSION_KEY)) {
      // 上一次已经失败过，就不要在同一次会话里无限重试。
      setShowLoginFailedNotice(true);
      updateTelegramBootDebugState({
        phase: "blocked",
        reason: "previous-login-failed",
        loginStatus: "failed",
        attempts: readSessionNumber(TG_LOGIN_ATTEMPTS_SESSION_KEY),
      });
      return;
    }

    const initData = getTelegramInitData();
    if (!initData) {
      // 先等 Telegram runtime 把 initData 准备好，再进入登录。
      updateTelegramBootDebugState({
        phase: "waiting-init-data",
        reason: "missing-init-data",
        hasInitData: false,
        initDataLength: 0,
      });
      return;
    }

    isLoginAttemptInFlightRef.current = true;
    const attempts = readSessionNumber(TG_LOGIN_ATTEMPTS_SESSION_KEY) + 1;
    writeSessionNumber(TG_LOGIN_ATTEMPTS_SESSION_KEY, attempts);
    updateTelegramBootDebugState({
      phase: "logging-in",
      loginStatus: "pending",
      attempts,
      hasInitData: true,
      initDataLength: initData.length,
    });

    void loginByTMA({ device_id: uuidv4Generate() })
      .then(async () => {
        writeSessionFlag(TG_LOGIN_FAILED_SESSION_KEY, false);
        setShowLoginFailedNotice(false);
        updateTelegramBootDebugState({
          phase: "login-success",
          loginStatus: "success",
          error: undefined,
        });
        await refetchUser();
      })
      .catch((error) => {
        // 失败后只保留最小提示，不继续打登录弹窗。
        writeSessionFlag(TG_LOGIN_FAILED_SESSION_KEY, true);
        setShowLoginFailedNotice(true);
        updateTelegramBootDebugState({
          phase: "login-failed",
          loginStatus: "failed",
          reason: "login-by-tma-failed",
          error: error instanceof Error ? error.message : "unknown-error",
          attempts,
        });
      })
      .finally(() => {
        isLoginAttemptInFlightRef.current = false;
      });
  }, [isAuthenticated, isInitialized, isTelegram, isTmaLoginPending, loginByTMA, refetchUser]);

  return {
    showLoginFailedNotice,
    hideLoginFailedNotice: () => {
      writeSessionFlag(TG_LOGIN_FAILED_SESSION_KEY, false);
      setShowLoginFailedNotice(false);
    },
  };
}
