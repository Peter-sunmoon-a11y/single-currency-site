"use client";

import { apiConfig } from "@/lib/env";
import { defaultLocale, isSupportedLocale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref } from "@/lib/navigation";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { memo, useEffect, useMemo } from "react";

const sanitizeReturnPath = (value: string | null, locale: string) => {
  if (!value || !value.startsWith("/")) {
    return localizeHref("/", locale);
  }

  return localizeHref(value, locale);
};

const probeApiReachable = async () => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 5000);

  try {
    await fetch(apiConfig.url, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
};

const RouteComponent = memo(function RouteComponent() {
  const { t } = useTranslation("information");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const safeLocale = isSupportedLocale(locale) ? locale : defaultLocale;
  const from = useMemo(() => sanitizeReturnPath(searchParams.get("from"), safeLocale), [safeLocale, searchParams]);
  const homeHref = useMemo(() => localizeHref("/", safeLocale), [safeLocale]);

  useEffect(() => {
    let cancelled = false;
    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isReload = navigationEntry?.type === "reload";

    if (!isReload) {
      return () => {
        cancelled = true;
      };
    }

    const redirectHome = () => {
      if (!cancelled) {
        window.location.replace(homeHref);
      }
    };

    const checkAndRedirect = async () => {
      const reachable = await probeApiReachable();
      if (reachable) {
        redirectHome();
      }
    };

    void checkAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [homeHref]);

  return (
    <div className="main-app-shell fixed inset-0 flex items-center justify-center bg-base-300" style={{ overscrollBehavior: "none" }}>
      <div
        className="main-app-shell__frame phone-frame relative min-h-0 flex overflow-hidden bg-base-300"
        style={{ transform: "translateZ(0)", overscrollBehavior: "none" }}
      >
        <div className="min-h-full w-full text-base-content flex flex-col items-center justify-center px-4 gap-4">
          <img src="/favicon/favicon-96x96.png" alt="" className="grayscale" />

          <div className="space-y-4 text-center">
            <h1 className="text-lg font-bold">{t("networkError.title")}</h1>
            <p className="text-sm text-base-content/70">{t("networkError.description")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="btn btn-primary w-full h-9 text-sm"
              onClick={() => window.location.replace(from)}
            >
              <RefreshCcw size={16} />
              {t("retry")}
            </button>

            <Link href={localizeHref("/", safeLocale)} className="btn btn-primary btn-soft w-full h-9 text-sm">
              {t("goBack")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

export const beforeLoad = undefined;

export default RouteComponent;
