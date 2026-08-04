import { Tabs } from "@/components/ui/Tabs";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { ArrowLeftRight, Calculator, Home, Star, User, Volume2 } from "lucide-react";
import React from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export const ReferralTabs = ({ value, onChange, className }: Props) => {
  const { t } = useTranslation('referral');
  const user = useBoundStore((state) => state.user);

  const tabs = [
    {
      value: "global",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
          <Home width={14} height={14} />
          <span className="text-xs sm:text-base whitespace-nowrap">{t("referral:tabs.global")}</span>
        </div>
      ),
    },
    {
      value: "ratesAndRules",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
          <Calculator width={14} height={14} />
          <span className="text-xs sm:text-base whitespace-nowrap">{t("referral:tabs.ratesAndRules")}</span>
        </div>
      ),
    },
    user && {
      value: "campaigns",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
          <Volume2 width={14} height={14} />
          <span className="text-xs sm:text-base whitespace-nowrap">{t("referral:tabs.campaigns")}</span>
        </div>
      ),
    },
    user && {
      value: "myReferrals",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
          <User width={14} height={14} />
          <span className="text-xs sm:text-base whitespace-nowrap">{t("referral:tabs.myReferrals")}</span>
        </div>
      ),
    },
    user && {
      value: "commissions",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
          <ArrowLeftRight width={14} height={14} />
          <span className="text-xs sm:text-base whitespace-nowrap">{t("referral:tabs.commissions")}</span>
        </div>
      ),
    },
    user && {
      value: "rewards",
      label: (
        <div className="flex items-center gap-2 justify-center rounded-field min-w-[48px] px-2 h-8 sm:h-12 py-1 font-semibold">
          <Star width={14} height={14} />
          <span className="text-xs sm:text-base whitespace-nowrap">{t("referral:tabs.rewards")}</span>
        </div>
      ),
    },
  ].filter(Boolean) as {
    value: string;
    label: React.ReactNode;
  }[];

  const handleTabClick = (tabValue: string) => {
    onChange(tabValue);
  };

  return <Tabs tabs={tabs} size="sm" value={value} onChange={handleTabClick} className={cn("bg-transparent", className)} layoutId="referrals-tabs" />;
};
