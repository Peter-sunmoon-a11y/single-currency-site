import { NothingFound } from "@/components/ui/NothingFound";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAchievements } from "@/hooks/api/useAuth";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { ACHIEVEMENT_CONFIG } from "@/sections/bonus/achievements/bonus-achievements-list";
import { Medal } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import dayjs from "dayjs";

const normalizeUserId = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return decodeURIComponent(raw || "").trim();
};

type AchievementCard = {
  id: string;
  key: string;
  name: string;
  icon: string;
  completedAt: number;
};

const formatLocalizedDate = (timestamp: number) => {
  if (!timestamp) return "--";

  return dayjs(timestamp * 1000).format("DD MMM [']YY");
};

function PublicAchievementCard({
                                 item
                               }: {
  item: AchievementCard;
}) {
  return (
    <article className="flex flex-col gap-2 justify-center items-center rounded-lg bg-base-100 p-2 text-center">
      <img src={item.icon} alt={item.name} className="h-8 w-8 object-contain" />
      <p className="text-sm font-bold text-base-content">{item.name}</p>
      <p className="text-xs text-base-content/60">
        {formatLocalizedDate(item.completedAt)}
      </p>
    </article>
  );
}

function RouteComponent() {
  const { t } = useTranslation(["common", "achievement"]);
  const params = useParams<{ userid: string }>();
  const requestedUserId = normalizeUserId(params?.userid);
  const { user, isInitialized, isLoading } = useAuth();
  const achievementsQuery = useUserAchievements("asc");

  const isOwnerPreview = useMemo(() => {
    if (!user?.id || !requestedUserId) return false;
    return String(user.id) === requestedUserId;
  }, [requestedUserId, user?.id]);

  const achievements = useMemo<AchievementCard[]>(() => {
    const source = achievementsQuery.data?.data;
    if (!Array.isArray(source)) return [];

    return source
      .map((achievement: any) => {
        const steps = Array.isArray(achievement?.achievementStep) ? achievement.achievementStep : [];
        const isCompleted = steps.length > 0 && steps.every((step: any) => step?.is_finish === true);
        if (!isCompleted) return null;

        const completedAt = steps.reduce((max: number, step: any) => {
          const timestamp = Number(step?.updated_at ?? 0);
          return timestamp > max ? timestamp : max;
        }, 0);

        const key = String(achievement?.key || "");
        return {
          id: String(achievement?.id ?? achievement?.achievement_id ?? key),
          key,
          name: t(`achievement:${key}.name`, { defaultValue: achievement?.name || key }),
          icon: ACHIEVEMENT_CONFIG[key]?.icon || achievement?.icon_url || "",
          completedAt
        };
      })
      .filter((item): item is AchievementCard => Boolean(item?.icon))
      .sort((a, b) => b.completedAt - a.completedAt);
  }, [achievementsQuery.data?.data, t]);

  if (!isInitialized || isLoading) {
    return <div className="min-h-dvh bg-base-300" />;
  }

  if (!isOwnerPreview) {
    return <NothingFound className="static min-h-dvh"
                         text="This public achievement page is only available for the signed-in owner preview." />;
  }

  return (
    <div className="relative p-4 h-full">
      {achievements.length === 0 ? (
        <NothingFound
          icon={<Medal className="h-6 w-6" />}
          text={t("common:common.noData")}
        />
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {achievements.map((achievement) => (
            <PublicAchievementCard key={achievement.id} item={achievement} />
          ))}
        </div>
      )}
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
