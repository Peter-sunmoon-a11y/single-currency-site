import Link from "next/link";
import { localizeHref } from "@/lib/navigation";
import { ReferralHeroSection } from "@/sections/referral/referral-hero-section.tsx";
import { ReferralSummaryCard } from "@/sections/referral/referral-summary-card";
import { ReferralGuard } from "@/sections/referral/referral-guard.tsx";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { useBoundStore } from "@/store";
import { useTranslation } from "@/lib/i18n/react-i18next";
import Iconify from "@/components/iconify";

type NavItem = {
  key: string;
  to: string;
  icon: string;
  translationKey: string;
  authRequired?: boolean;
  imageSrc?: string;
};

type NavGroup = {
  titleKey: string;
  items: NavItem[];
};

const referralNavGroups: NavGroup[] = [
  {
    titleKey: "referral:group.general",
    items: [
      { key: "global",        to: "/referral/global",          icon: "custom:home",       translationKey: "referral:liveGlobalCommissions" },
      { key: "ratesAndRules",   to: "/referral/rates-and-rules",  icon: "custom:calculator", translationKey: "referral:commissionCalculator" },
      { key: "rewardsSchedule", to: "/referral/rewards-schedule", icon: "custom:pizza",    translationKey: "referral:referralRewardsAreEasy" },
      { key: "faq",             to: "/referral/faq",              icon: "custom:question",   translationKey: "tabs.faq" },
    ],
  },
  {
    titleKey: "referral:group.myAccount",
    items: [
      { key: "campaigns",   to: "/referral/campaigns",     icon: "custom:speaker",      translationKey: "referral:myCampaigns",   authRequired: true },
      { key: "myReferrals", to: "/referral/my-referrals",  icon: "custom:person",       translationKey: "tabs.myReferrals", authRequired: true },
      { key: "commissions", to: "/referral/commissions",   icon: "custom:transactions", translationKey: "referral:myReferralCommissions", authRequired: true },
      { key: "rewards",     to: "/referral/rewards",       icon: "custom:dollar",      translationKey: "referral:myReferralRewards",     authRequired: true },
    ],
  },
];

const NavIconItem = ({ item }: { item: NavItem }) => {
  const { t } = useTranslation("referral");
  return (
    <Link href={localizeHref(item.to)} className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-lg bg-base-300 flex items-center justify-center text-base-content/70">
        {item.imageSrc
          ? <img src={item.imageSrc} alt="" className="w-6 h-6 object-contain" />
          : <Iconify icon={item.icon} width={24} height={24} />}
      </div>
      <span className="text-sm font-semibold text-base-content/70 text-center truncate max-w-full">
        {t(item.translationKey)}
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
      <div className="grid grid-cols-2 gap-4 bg-base-200 rounded-lg p-4">
        {group.items.map((item) => (
          <NavIconItem key={item.key} item={item} />
        ))}
      </div>
    </section>
  );
};

function ReferralIndexPage() {
  const user = useBoundStore((state) => state.user);

  const visibleGroups = referralNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.authRequired || !!user),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <ReferralGuard>
      {(referral_enable: boolean) => (
        <div className="p-4 flex flex-col gap-4">
          <ReferralHeroSection referralEnable={referral_enable} />
          <ReferralSummaryCard referralEnable={referral_enable} />

          <InnerDisplayContent show={referral_enable}>
            <div className="space-y-4">
              {visibleGroups.map((group) => (
                <NavGroupSection key={group.titleKey} group={group} />
              ))}
            </div>
          </InnerDisplayContent>
        </div>
      )}
    </ReferralGuard>
  );
}

export const beforeLoad = undefined;

export default ReferralIndexPage;
