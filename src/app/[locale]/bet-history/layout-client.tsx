"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { localizeHref } from "@/lib/navigation";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function BetHistoryLayoutClient({ children }: Props) {
  const { t } = useTranslation(["profile", "common"]);
  const pathname = usePathname();
  const isCasinoActive = pathname.endsWith("/bet-history/casino") || pathname.endsWith("/bet-history");
  const isSportsActive = pathname.endsWith("/bet-history/sports");

  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="p-4 flex flex-col gap-4">
      <div role="tablist" className="tabs tabs-box w-full">
        <Link
          href={localizeHref("/bet-history/casino")}
          role="tab"
          className={cn(
            "tab flex-1 gap-1 text-sm px-1 font-bold",
            isCasinoActive && "tab-active text-primary"
          )}
        >
          {t("common:common.casino", "Casino")}
        </Link>
        <Link
          href={localizeHref("/bet-history/sports")}
          role="tab"
          className={cn(
            "tab flex-1 gap-1 text-sm px-1 font-bold",
            isSportsActive && "tab-active text-primary"
          )}
        >
          {t("common:common.sports", "Sports")}
        </Link>
      </div>

      {children}
    </div>
  );
}
