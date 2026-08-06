"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/react-i18next";

export const TransactionsPageShell = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation(["transaction", "finance", "bonus", "sportsBonus"]);
  const pathname = usePathname();

  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  const segments = pathname.split("/").filter(Boolean);
  const transactionsIndex = segments.findIndex((segment) => segment === "transactions");
  const childSegment = transactionsIndex >= 0 ? segments[transactionsIndex + 1] : undefined;

  const title = (() => {
    switch (childSegment) {
      case "deposit":
        return t("transaction:transactionTypes.deposit");
      case "withdraw":
        return t("transaction:transactionTypes.withdrawal");
      case "swap":
        return t("finance:swap");
      case "bonus":
        return t("transaction:transactionTypes.bonus");
      case "slot-bonus":
        return t("bonus:slotBonus");
      case "sports-bonus":
        return t("sportsBonus:sportsBonusStore");
      case "referral":
        return t("transaction:transactionTypes.referral");
      case "commission":
        return t("transaction:transactionTypes.commission");
      default:
        return t("transaction:tabs.transactionHistory");
    }
  })();

  return (
    <div className="p-4 flex flex-col gap-4">
      <h3 className="text-base text-primary font-bold border-l-4 pl-2 border-l-primary">
        {title}
      </h3>
      {children}
    </div>
  );
};
