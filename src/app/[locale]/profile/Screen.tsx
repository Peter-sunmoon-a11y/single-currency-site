import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext.tsx";
import { requireAuth } from "@/lib/auth-guards";
import { buildHref } from "@/lib/navigation";
import { useTranslation } from "@/lib/i18n/react-i18next";
import Iconify from "@/components/iconify";
import {
  RefreshCw,
  type LucideProps,
  Sparkles,
  History,
  ShieldCheck,
  // Scale,
  Pizza,
} from "lucide-react";
import { IconDeposit, IconWithdraw, IconSwap } from "@/app/[locale]/finance/icons";
import { InnerShareLink } from "@/sections/bonus/buddy-ball/share.tsx";
import Copy from "@/components/ui/Copy.tsx";

export const beforeLoad = requireAuth;

type NavItem = {
  key: string;
  to: string;
  search?: Record<string, string>;
  icon: React.ComponentType<LucideProps>;
  iconSrc?: string;
  translationKey: string;
  namespace: string;
};

type NavGroup = {
  titleKey: string;
  items: NavItem[];
  gridClassName?: string;
};

const makeIconifyIcon = (icon: string): React.ComponentType<LucideProps> => {
  const IconComponent: React.FC<LucideProps> = (props) => <Iconify icon={icon} {...props} />;
  IconComponent.displayName = `Iconify(${icon})`;
  return IconComponent;
};

const profileNavGroups: NavGroup[] = [
  {
    titleKey: "common:common.finance",
    items: [
      {
        key: "deposit",
        to: "/finance/deposit",
        icon: IconDeposit,
        translationKey: "common.deposit",
        namespace: "common"
      },
      {
        key: "withdraw",
        to: "/finance/withdraw",
        icon: IconWithdraw,
        translationKey: "common.withdraw",
        namespace: "common"
      },
      {
        key: "swap",
        to: "/finance/swap",
        icon: IconSwap,
        translationKey: "common.swap",
        namespace: "common"
      }
    ]
  },
  {
    titleKey: "profile:transactions",
    gridClassName: "grid-cols-3",
    items: [
      {
        key: "deposit",
        to: "/transactions/deposit",
        icon: IconDeposit,
        translationKey: "transactionTypes.deposit",
        namespace: "transaction"
      },
      {
        key: "withdraw",
        to: "/transactions/withdraw",
        icon: IconWithdraw,
        translationKey: "transactionTypes.withdrawal",
        namespace: "transaction"
      },
      {
        key: "swap",
        to: "/transactions/swap",
        icon: IconSwap,
        translationKey: "swap",
        namespace: "finance"
      },
      {
        key: "bonus",
        to: "/transactions/bonus",
        icon: makeIconifyIcon("custom:bonus"),
        translationKey: "transactionTypes.bonus",
        namespace: "transaction"
      },
      {
        key: "slot-bonus",
        to: "/transactions/slot-bonus",
        icon: Sparkles,
        iconSrc: "/images/bonus_store/bonus-store-icon.png",
        translationKey: "slotBonus",
        namespace: "bonus"
      },
      {
        key: "sports-bonus",
        to: "/transactions/sports-bonus",
        icon: Sparkles,
        iconSrc: "/images/bonus_sports/sports-bonus-icon.png",
        translationKey: "sportsBonusStore",
        namespace: "sportsBonus"
      },
      {
        key: "referral",
        to: "/transactions/referral",
        icon: makeIconifyIcon("custom:referral"),
        translationKey: "transactionTypes.referral",
        namespace: "transaction"
      },
      {
        key: "commission",
        to: "/transactions/commission",
        icon: makeIconifyIcon("custom:commission-calculator"),
        translationKey: "transactionTypes.commission",
        namespace: "transaction"
      },
      {
        key: "bet-history",
        to: "/bet-history",
        icon: History,
        translationKey: "betHistory.title",
        namespace: "profile"
      },
      { key: "rollover", to: "/rollover", icon: RefreshCw, translationKey: "rollover", namespace: "profile" },
      { key: "free-spin", to: "/free-spin", icon: Sparkles, translationKey: "freeSpins", namespace: "profile" }
    ]
  },
  {
    titleKey: "profile:account",
    items: [
      { key: "security", to: "/security", icon: ShieldCheck, translationKey: "common.security", namespace: "common" }
      // { key: "legal", to: "/legal", icon: Scale, translationKey: "legal", namespace: "profile" }
    ]
  }
];

const NavIconItem = ({ item }: { item: NavItem }) => {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <Link
      href={item.to}
      className="flex flex-col items-center gap-2"
    >
      <div className="w-12 h-12 rounded-lg bg-base-300 flex items-center justify-center">
        {item.iconSrc ? (
          <img
            src={item.iconSrc}
            alt=""
            className="w-8 h-8 object-contain"
            loading="lazy"
          />
        ) : (
          <Icon className="w-6 h-6 text-base-content/70" />
        )}
      </div>
      <span className="text-sm font-semibold text-base-content/70 text-center truncate max-w-full">
        {t(`${item.namespace}:${item.translationKey}`)}
      </span>
    </Link>
  );
};

const NavGroupSection = ({ group }: { group: NavGroup }) => {
  const { t } = useTranslation();
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold text-base-content/40 uppercase tracking-wide px-1">
        {t(group.titleKey)}
      </h3>
      <div className={`grid ${group.gridClassName ?? "grid-cols-3"} gap-2 bg-base-200 rounded-lg p-4`}>
        {group.items.map((item) => (
          <NavIconItem key={item.key} item={item} />
        ))}
      </div>
    </section>
  );
};

function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = (to: string) => {
    router.push(String(buildHref(to, searchParams)));
  };

  const { user, status } = useAuth();
  const { t } = useTranslation("profile");
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2 justify-end bg-base-200 rounded-lg p-4">
        <div className="flex gap-4 items-center">
          <div className="avatar">
            <div className="w-15 h-15 rounded-full">
              <img src={user?.avatar || "/images/avatars/Avatar-0.png"} className="w-full h-full" alt="" />
            </div>
          </div>
          <div>
            <p className="text-lg text-base-content font-bold">{user?.nickname}</p>
            <p
              className="flex items-center gap-1 text-xs font-bold text-base-content/50">{t("profile:gameId")}: {user?.id}<Copy
              text={String(user?.id ?? "")} /></p>
          </div>
        </div>

        <button
          className="btn btn-sm self-end btn-primary btn-soft text-sm"
          onClick={() => navigate("/me")}>
          {t("profile:editProfile")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1 bg-base-200 rounded-md p-1">
        <div className=" bg-base-300 flex flex-col items-center justify-center rounded-md p-2">
          <p className="text-sm text-base-content/50">{t("common:common.totalWins")}</p>
          <p className="text-base font-bold">{Number(status?.bet_win_times ?? 0).toLocaleString()}</p>
        </div>
        <div className=" bg-base-300 flex flex-col items-center justify-center rounded-md p-2">
          <p className="text-sm text-base-content/50">{t("common:common.totalBets")}</p>
          <p className="text-base font-bold">{Number(status?.bet_times ?? 0).toLocaleString()}</p>
        </div>
        <div className="col-span-2 bg-base-300 flex flex-col items-center justify-center rounded-md p-2">
          <p className="text-sm text-base-content/50">{t("common:common.totalWagered")}</p>
          <p className="text-base font-bold">
            {formatWithConversion((status?.bet_in_ori || 0), "USDT", {
              showSymbol: true,
              showCode: false
            }).formatted}
          </p>
        </div>
      </div>

      <div className={"flex flex-col gap-2 relative rounded-lg p-4 overflow-hidden bg-base-200"}>
        <div className="flex items-center gap-2">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
          <Pizza className="w-8 h-8 text-primary" />
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-base text-base-content">{t("profile:inviteAndGetRewarded")}</p>
            <p className="text-sm text-primary font-semibold truncate">
              {t("common:common.upToAmountCommission", {
                amount: formatWithConversion(1200, "USDT", { showSymbol: true, showCode: false }).formatted,
                commission: 50
              })}
            </p>
          </div>
        </div>

        <InnerShareLink />
      </div>

      <div className="flex flex-col gap-4" id={"NAVS"}>
        <div className="space-y-4">
          {profileNavGroups.map((group) => (
            <NavGroupSection key={group.titleKey} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
