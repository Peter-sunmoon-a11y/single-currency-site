import { useTranslation } from "@/lib/i18n/react-i18next";
import Iconify from "@/components/iconify";
import { BonusListHeader, BuddyBallCard } from "@/sections/bonus";
import { BountyCard } from "@/sections/bonus/bounty/BountyCard.tsx";
import { FirstChallengeCard } from "@/sections/bonus/first-challenge/FirstChallengeCard.tsx";
import { LuckySpinCard } from "@/sections/bonus/lucky-spin/lucky-spin-card.tsx";
import { BonusRakeback } from "@/sections/bonus/rakeback/bonus-rakeback.tsx";
import { TieredFirstDepositCard } from "@/sections/bonus/tiered-first-deposit";
import { BonusTournament } from "@/sections/bonus/tournament/bonus-tournament.tsx";

export const GeneralBonus = () => {
  const { t } = useTranslation();

  return (
    <BonusListHeader
      icon={<Iconify icon="custom:bonus" className="shrink-0 w-5 h-5 text-primary" />}
      title={t("bonus:general_bonus")}
      childrenClassName="grid grid-cols-1 gap-2"
    >
      <TieredFirstDepositCard />
      <FirstChallengeCard />
      <BuddyBallCard />
      <LuckySpinCard />
      <BountyCard />
      <BonusRakeback />
      <BonusTournament />
    </BonusListHeader>
  );
};
