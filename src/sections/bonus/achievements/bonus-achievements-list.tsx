import { useBoundStore } from "@/store";
import { useBonusSwitch, useUserAchievements } from "@/hooks/api/useAuth";
import { cn } from "@/utils/cn";
import { PropsWithChildren, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { AchievementStep } from "@/types/bonus";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { Pizza } from "lucide-react";

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  btnText: string;
  link?: string;
  modal?: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  inProgress: boolean;
  hasClaimableReward: boolean;
  steps: AchievementStep[];
}

// 成就图标和背景配置
export const ACHIEVEMENT_CONFIG: Record<string, {
  icon: string;
  btnText: string;
  link?: string;
  modal?: string
}> = {
  achievement_verify_email: {
    icon: "/images/achievement/email.png",
    btnText: "bonus:go",
    link: "/security"
  },
  achievement_verify_phone: {
    icon: "/images/achievement/phone.png",
    btnText: "bonus:go",
    link: "/security"
  },
  achievement_super_spreader: {
    icon: "/images/achievement/super-spreader.png",
    btnText: "bonus:tell_a_friend",
    link: "/referral"
  },
  achievement_champion: {
    icon: "/images/achievement/champion.png",
    btnText: "bonus:play_now",
    link: "/casino"
  },
  achievement_conquistador: {
    icon: "/images/achievement/conquistador.png",
    btnText: "bonus:play_now",
    link: "/casino"
  },
  achievement_game_explorer: {
    icon: "/images/achievement/game-explorer.png",
    btnText: "bonus:play_now",
    link: "/explore?category=all"
  },
  achievement_card_shark: {
    icon: "/images/achievement/card-shark.png",
    btnText: "bonus:play_now",
    link: "/explore?category=poker"
  },
  achievement_slot_master: {
    icon: "/images/achievement/slot-master.png",
    btnText: "bonus:play_now",
    link: "/explore?type=slots"
  },
  achievement_the_challenger: {
    icon: "/images/achievement/the-challenger.png",
    btnText: "bonus:play_now",
    link: "/explore?category=all"
  },
  achievement_dynamo: {
    icon: "/images/achievement/dynamo.png",
    btnText: "bonus:deposit_now",
    link: "/finance?tab=deposit"
  },
  achievement_change_avatar: {
    icon: "/images/achievement/face-of-fortune.png",
    btnText: "bonus:change_avatar_now",
    link: "/me"
  },
  achievement_set_username: {
    icon: "/images/achievement/name-of-fame.png",
    btnText: "bonus:set_username_now",
    link: "/me"
  },
  achievement_guiding_star: {
    icon: "/images/achievement/guiding-star.png",
    btnText: "bonus:add_to_home_screen",
    link: "/casino"
  },
  achievement_highroller: {
    icon: "/images/achievement/highroller.png",
    btnText: "bonus:play_now",
    link: "/explore?category=all"
  },
  achievement_inferno: {
    icon: "/images/achievement/inferno.png",
    btnText: "bonus:play_now",
    link: "/explore?category=all"
  },
  achievement_money_maverick: {
    icon: "/images/achievement/money-maverick.png",
    btnText: "bonus:deposit_now",
    link: "/finance?tab=deposit"
  },
  achievement_money_master: {
    icon: "/images/achievement/money-master.png",
    btnText: "bonus:withdraw_now",
    link: "/finance?tab=withdraw"
  },
  achievement_crypto_bro: {
    icon: "/images/achievement/crypto-bro.png",
    btnText: "bonus:deposit_now",
    link: "/finance?tab=deposit"
  },
  achievement_crypto_baron: {
    icon: "/images/achievement/crypto-baron.png",
    btnText: "bonus:withdraw_now",
    link: "/finance?tab=withdraw"
  },
  achievement_chain_shifter: {
    icon: "/images/achievement/chain-shifter.png",
    btnText: "bonus:swap_now",
    link: "/finance?tab=swap"
  },
  achievement_first_swap_non_buck: {
    icon: "/images/achievement/chain-shifter.png",
    btnText: "bonus:swap_now",
    link: "/finance?tab=swap"
  },
  achievement_first_swap_buck: {
    icon: "/images/achievement/chain-shifter.png",
    btnText: "bonus:swap_now",
    link: "/finance?tab=swap"
  }
};

// 内部私有组件：成就列表加载骨架屏
const AchievementsLoadingSkeleton = () => {
  return (
    <div className={cn("grid grid-cols-3 gap-1")}>
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="skeleton h-24 rounded-lg bg-base-200" />
      ))}
    </div>
  );
};

export const BonusAchievementsList = () => {
  const navigate = useAppNavigate();
  const { t } = useTranslation("achievement");

  const isInitialized = useBoundStore((state) => state.isInitialized);
  const { data: achievementsData, isLoading: isDataLoading } = useUserAchievements("asc");
  const isLoading = !isInitialized || isDataLoading;

  const achievements: Achievement[] = useMemo(() => {
    if (!achievementsData?.data || !Array.isArray(achievementsData.data)) {
      return [];
    }

    return achievementsData.data.map((achievement: any) => {
      const achievementSteps = achievement.achievementStep || [];
      const sortedSteps = [...achievementSteps].sort((a: any, b: any) => a.step - b.step);
      const completedSteps = sortedSteps.filter((s: any) => s.is_finish === true);
      const hasClaimableReward = sortedSteps.some((s: any) => s.is_finish === true && s.is_claim !== true);
      const progress = completedSteps.length;
      const maxProgress = sortedSteps.length;
      const completed = progress === maxProgress && maxProgress > 0;

      const achievementKey = achievement.key || "";
      const translationKey = `bonus:${achievementKey}`;
      const achievementTranslation = t(translationKey, { returnObjects: true });
      const shortDescriptionKey = `bonus:${achievementKey}.description`;

      let translatedName = achievement.name;
      if (typeof achievementTranslation === "object" && achievementTranslation && "name" in achievementTranslation) {
        translatedName = (achievementTranslation as any).name || achievement.name;
      }

      let shortDescription = t(shortDescriptionKey, { defaultValue: null });
      if (!shortDescription || shortDescription === shortDescriptionKey) {
        shortDescription = achievement.description || achievement.note || "";
      }

      const config = ACHIEVEMENT_CONFIG[achievement.key];

      return {
        id: achievement.id.toString(),
        key: achievement?.key || "",
        name: translatedName,
        description: shortDescription,
        icon: config.icon,
        btnText: config.btnText,
        link: config.link,
        modal: config.modal,
        progress,
        maxProgress,
        completed,
        inProgress: progress < maxProgress,
        hasClaimableReward,
        steps: sortedSteps
      };
    });
  }, [achievementsData, t]);

  const achievementCards = (data: Achievement[]) => {
    return data.map((achievement) => {
      return (
        <InnerGuardAchievementContainer
          key={achievement.id}
          item={achievement}
        >
          {(
            <div
              className="relative rounded-lg bg-base-100"
              onClick={() => void navigate({ to: "/achievement/$id", params: { id: achievement.id } })}
            >
              {achievement.completed && (
                <span className="absolute top-1 right-1 text-success text-sm leading-none">✓</span>
              )}
              {achievement.inProgress && (
                <span className="w-2.5 h-2.5 loading loading-bars loading-xs text-primary absolute top-1 right-1" />
              )}
              {achievement.hasClaimableReward && (
                <span className="absolute bottom-1 right-1 text-primary animate-bounce">
                  <Pizza size={18} />
                </span>
              )}
              <div className="p-2 flex flex-col gap-2 items-center">
                <img
                  src={achievement.icon}
                  alt={achievement.name}
                  className="w-8 h-8"
                />

                <h3 className="text-xs text-center text-base-content/50 leading-tight">
                  {achievement.name}
                </h3>

                <div className="text-xs font-extrabold text-base-content/60">
                  {achievement.progress}/{achievement.maxProgress}
                </div>
              </div>
            </div>
          )}
        </InnerGuardAchievementContainer>
      );
    });
  };

  return (
    <>
      {isLoading && <AchievementsLoadingSkeleton />}

      {!isLoading && (
        <div className={cn("grid grid-cols-3 gap-1")}>
          {achievementCards(achievements)}
        </div>
      )}

      {/* No Results */}
      {!isLoading && achievements.length === 0 && (
        <NothingFound className="static bg-base-200 h-[88px] rounded-lg" text={t("achievement:no_achievements_available")} />
      )}
    </>
  );
};

export const InnerGuardAchievementContainer = (
  {
    item,
    children,
    additional
  }: PropsWithChildren<{
    item: Record<string, any>
    additional?: boolean
  }>
) => {
  const { switchData } = useBonusSwitch();

  const is_achievement_verify_email = useMemo(() => switchData?.bonus_switch?.achievement_verify_email === 0 && (item?.id === 1 || item?.achievement_id === 1), [item, switchData]);
  const is_achievement_verify_phone = useMemo(() => switchData?.bonus_switch?.achievement_verify_phone === 0 && (item?.id === 2 || item?.achievement_id === 2), [item, switchData]);
  const is_achievement_add_desktop_app = useMemo(() => switchData?.bonus_switch?.achievement_add_desktop_app === 0 && (item?.id === 3 || item?.achievement_id === 3), [item, switchData]);
  const is_achievement_super_spreader = useMemo(() => switchData?.bonus_switch?.achievement_super_spreader === 0 && (item?.id === 4 || item?.achievement_id === 4), [item, switchData]);
  const is_achievement_conquistador = useMemo(() => switchData?.bonus_switch?.achievement_conquistador === 0 && (item?.id === 5 || item?.achievement_id === 5), [item, switchData]);
  const is_achievement_game_explorer = useMemo(() => switchData?.bonus_switch?.achievement_game_explorer === 0 && (item?.id === 6 || item?.achievement_id === 6), [item, switchData]);
  const is_achievement_slot_master = useMemo(() => switchData?.bonus_switch?.achievement_slot_master === 0 && (item?.id === 8 || item?.achievement_id === 8), [item, switchData]);
  const is_achievement_change_avatar = useMemo(() => switchData?.bonus_switch?.achievement_change_avatar === 0 && (item?.id === 9 || item?.achievement_id === 9), [item, switchData]);
  const is_achievement_set_username = useMemo(() => switchData?.bonus_switch?.achievement_set_username === 0 && (item?.id === 10 || item?.achievement_id === 10), [item, switchData]);
  const is_achievement_first_swap_non_buck = useMemo(() => switchData?.bonus_switch?.achievement_first_swap_non_buck === 0 && (item?.id === 11 || item?.achievement_id === 11), [item, switchData]);
  const is_achievement_first_swap_buck = useMemo(() => switchData?.bonus_switch?.achievement_first_swap_buck === 0 && (item?.id === 12 || item?.achievement_id === 12), [item, switchData]);

  return (
    additional ||
    is_achievement_slot_master ||
    is_achievement_verify_email ||
    is_achievement_verify_phone ||
    is_achievement_conquistador ||
    is_achievement_set_username ||
    is_achievement_change_avatar ||
    is_achievement_game_explorer ||
    is_achievement_super_spreader ||
    is_achievement_add_desktop_app ||
    is_achievement_first_swap_buck ||
    is_achievement_first_swap_non_buck
      ? null : children);
};
