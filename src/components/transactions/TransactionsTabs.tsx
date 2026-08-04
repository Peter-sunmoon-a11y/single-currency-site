"use client";

import { ExplorePrimaryTabs } from "@/sections/explore/ExplorePrimaryTabs";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { usePathname } from "next/navigation";
import { useAppNavigate } from "@/hooks/useAppNavigate";

const TABS = [
  { to: "/transactions/deposit", labelKey: "transaction:transactionTypes.deposit", fallback: "Deposit" },
  { to: "/transactions/withdraw", labelKey: "transaction:transactionTypes.withdrawal", fallback: "Withdraw" },
  { to: "/transactions/swap", labelKey: "finance:swap", fallback: "Swap" },
  { to: "/transactions/bonus", labelKey: "transaction:transactionTypes.bonus", fallback: "Bonus" },
  { to: "/transactions/slot-bonus", labelKey: "bonus:slotBonus", fallback: "Slot Bonus" },
  { to: "/transactions/sports-bonus", labelKey: "sportsBonus:sportsBonusStore", fallback: "Sports Bonus" },
  { to: "/transactions/referral", labelKey: "transaction:transactionTypes.referral", fallback: "Referral" },
  { to: "/transactions/commission", labelKey: "transaction:transactionTypes.commission", fallback: "Commission" }
] as const;

export function TransactionsTabs() {
  const { t } = useTranslation(["transaction", "finance", "bonus", "sportsBonus"]);
  const pathname = usePathname();
  const navigate = useAppNavigate();

  const items = TABS.map(({ to, labelKey, fallback }) => ({
    value: to,
    label: t(labelKey, fallback)
  }));

  const segments = pathname.split("/").filter(Boolean);
  const transactionsIndex = segments.findIndex((segment) => segment === "transactions");
  const childSegment = transactionsIndex >= 0 ? segments[transactionsIndex + 1] : undefined;
  const activeValue = `/transactions/${childSegment ?? "deposit"}`;

  return (
    <ExplorePrimaryTabs
      items={items}
      activeValue={activeValue}
      onSelect={(value) => void navigate(value)}
      itemClassName="h-8"
    />
  );
}
