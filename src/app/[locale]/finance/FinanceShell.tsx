"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { cn } from "@/utils/cn";
import { emitter } from "@/store/emitter";
import { IconDeposit, IconSwap, IconWithdraw } from "./icons";

const tabItems = [
  { label: "deposit", trans: "common:common.deposit", icon: <IconDeposit /> },
  { label: "withdraw", trans: "common:common.withdraw", icon: <IconWithdraw /> },
  { label: "swap", trans: "common:common.swap", icon: <IconSwap /> }
] as const;

export function FinanceShell({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab =
    pathname.endsWith("/finance/withdraw") || tabParam === "withdraw"
      ? "withdraw"
      : pathname.endsWith("/finance/swap") || tabParam === "swap"
        ? "swap"
        : "deposit";

  useEffect(() => {
    emitter.emit("OPEN_FINANCE_MODAL");
    return () => {
      emitter.emit("CLOSE_FINANCE_MODAL");
    };
  }, []);

  return (
    <div className="p-4">
      <div role="tablist" className="tabs tabs-box w-full">
        {tabItems.map(({ label, trans, icon }) => (
          <Link
            key={label}
            href={`/finance/${label}`}
            role="tab"
            className={cn(
              "tab flex-1 gap-1 text-sm px-1 font-bold",
              activeTab === label && "tab-active text-primary"
            )}
          >
            {icon}
            {t(trans)}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
