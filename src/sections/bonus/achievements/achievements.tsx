import { useTranslation } from "@/lib/i18n/react-i18next";
import Iconify from "@/components/iconify";
import { BonusListHeader } from "@/sections/bonus";
import { BonusAchievementsList as B } from "@/sections/bonus";
import { useBoundStore } from "@/store";
import { useUserAchievements } from "@/hooks/api/useAuth";
import { useMemo } from "react";

export const Achievements = () => {
  const { t } = useTranslation();
  const isInitialized = useBoundStore((state) => state.isInitialized);
  const { data: achievementsData, isLoading: isAchievementsLoading } = useUserAchievements("asc");

  const isClaimable = useMemo(() => {
    if (!isInitialized || isAchievementsLoading) return false;
    if (!achievementsData?.data || !Array.isArray(achievementsData.data)) return false;
    return achievementsData.data.some((achievement: any) => {
      const steps = achievement?.achievementStep;
      if (!Array.isArray(steps)) return false;
      return steps.some((step: any) => step?.is_finish === true && step?.is_claim !== true);
    });
  }, [achievementsData?.data, isAchievementsLoading, isInitialized]);

  return (
    <BonusListHeader
      icon={<Iconify icon="custom:profile-achievements" className="shrink-0 w-5 h-5 text-primary" />}
      title={t("common.achievements")}
      claimable={isClaimable}
    >
      <B />
    </BonusListHeader>
  );
};