"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useBoundStore } from "@/store";
import { useCallback } from "react";

export type AuthActionTab = "signin" | "signup" | "sign-in" | "sign-up";

type RequireAuthOptions = {
  initialTab?: AuthActionTab;
};

export function useAuthAction() {
  const { isAuthenticated } = useAuth();
  const openModal = useBoundStore((state) => state.openModal);

  const openAuth = useCallback((initialTab: AuthActionTab = "signin") => {
    const normalizedTab = initialTab === "sign-up"
      ? "signup"
      : initialTab === "sign-in"
        ? "signin"
        : initialTab;

    openModal("OPEN_AUTH_MODAL", {
      initialTab: normalizedTab,
    });
  }, [openModal]);

  const requireAuth = useCallback((
    action?: () => void,
    options?: RequireAuthOptions,
  ) => {
    if (!isAuthenticated) {
      openAuth(options?.initialTab ?? "signin");
      return false;
    }

    action?.();
    return true;
  }, [isAuthenticated, openAuth]);

  return {
    isAuthenticated,
    openAuth,
    requireAuth,
  };
}
