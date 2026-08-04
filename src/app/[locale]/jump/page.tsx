"use client";

import { defaultLocale, isSupportedLocale } from "@/lib/i18n/config";
import { localizeHref } from "@/lib/navigation";
import { loginByParam } from "@/services/public/auth";
import { useBoundStore } from "@/store";
import { AUTH_STORAGE_KEY } from "@/utils/storageKeys";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";

const REQUIRED_LOGIN_PARAMS = ["ts", "nonce", "token", "id", "expire"] as const;

function decodeMaybeBase64(value: string) {
  const raw = value.trim();
  if (!raw) return "";

  let decodedUri = raw;
  try {
    decodedUri = decodeURIComponent(raw);
  } catch {
    decodedUri = raw;
  }

  if (decodedUri.startsWith("/")) return decodedUri;

  try {
    const normalized = decodedUri.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return window.atob(padded);
  } catch {
    return decodedUri;
  }
}

function resolveSafeDeeplink(value: string, locale: string) {
  const decoded = decodeMaybeBase64(value);
  if (!decoded || !decoded.startsWith("/") || decoded.startsWith("//")) {
    return localizeHref("/", locale);
  }

  return localizeHref(decoded, locale);
}

function getValidStorageValue(key: string) {
  const value = window.localStorage.getItem(key);
  return value && value !== "undefined" && value !== "null" ? value : "";
}

function hasJumpAuth() {
  return Boolean(getValidStorageValue(AUTH_STORAGE_KEY.token) && getValidStorageValue(AUTH_STORAGE_KEY.username));
}

function setWithReadback(key: string, value: string) {
  for (let count = 0; count < 3; count += 1) {
    window.localStorage.setItem(key, value);
    if (window.localStorage.getItem(key) === value) return true;
  }

  return false;
}

function persistJumpSession(response: Record<string, any>) {
  const token = response?.data?.token;
  const username = response?.data?.username ?? response?.user?.username;
  const user = response?.user;
  const status = response?.status;

  if (!token || !username || !user || !status) return false;

  return (
    setWithReadback(AUTH_STORAGE_KEY.token, String(token)) &&
    setWithReadback(AUTH_STORAGE_KEY.username, String(username)) &&
    setWithReadback(AUTH_STORAGE_KEY.user, JSON.stringify(user)) &&
    setWithReadback(AUTH_STORAGE_KEY.status, JSON.stringify(status))
  );
}

function JumpPageContent() {
  const params = useParams<{ locale?: string }>();
  const searchParams = useSearchParams();
  const setUser = useBoundStore((state) => state.setUser);
  const setStatus = useBoundStore((state) => state.setStatus);
  const locale = isSupportedLocale(params.locale) ? params.locale : defaultLocale;

  const targetHref = useMemo(
    () => resolveSafeDeeplink(searchParams.get("deeplink") ?? "", locale),
    [locale, searchParams]
  );

  useEffect(() => {
    let cancelled = false;

    const loginAndRedirect = async () => {
      if (hasJumpAuth()) {
        window.location.replace(targetHref);
        return;
      }

      const loginParams = Object.fromEntries(searchParams.entries());
      const hasRequiredParams = REQUIRED_LOGIN_PARAMS.every((key) => Boolean(loginParams[key]));

      if (!hasRequiredParams) {
        window.location.replace(localizeHref("/", locale));
        return;
      }

      try {
        const response = await loginByParam(loginParams);
        if (cancelled) return;

        if (response.code !== 0 || !persistJumpSession(response)) {
          window.location.replace(localizeHref("/", locale));
          return;
        }

        if (response.user) setUser(response.user);
        if (response.status) setStatus(response.status);
        window.location.replace(targetHref);
      } catch {
        if (cancelled) return;
        window.location.replace(localizeHref("/", locale));
      }
    };

    void loginAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [locale, searchParams, setStatus, setUser, targetHref]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center">
      <img
        src="/favicon/logo-400w.png"
        alt=""
        className="w-50 animate-[jump-logo-pulse_1.35s_ease-in-out_infinite]"
      />
      <style jsx>{`
        @keyframes jump-logo-pulse {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.78;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default function JumpPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-base-300" />}>
      <JumpPageContent />
    </Suspense>
  );
}
