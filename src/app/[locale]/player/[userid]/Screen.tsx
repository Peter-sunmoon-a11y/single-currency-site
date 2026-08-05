import { GameImage } from "@/components/ui/GameImage";
import { NothingFound } from "@/components/ui/NothingFound";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTopWageredGames, useUserAchievements, useVipConfigList } from "@/hooks/api/useAuth";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { ACHIEVEMENT_CONFIG } from "@/sections/bonus/achievements/bonus-achievements-list";
import { ChartNoAxesColumn, ChevronRight, LockKeyhole, Medal, Trophy, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";

type TopGame = {
  inner_game_id?: string;
  game_provider?: string;
  game_name?: string;
  display_game_name?: string;
  image?: string;
  wagered_usdt?: string | number;
};

const normalizeUserId = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return decodeURIComponent(raw || "").trim();
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function PublicSectionCard({
  title,
  icon,
  actionLabel,
  onAction,
  children
}: {
  title: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg bg-base-200 p-2 pt-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base-content/70">{icon}</span>
          <h3 className="text-sm font-bold text-base-content">{title}</h3>
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="btn btn-primary btn-xs btn-soft"
          >
            {actionLabel}
            <ChevronRight className="h-3 w-3" />
          </button>
        ) : null}
      </div>
      <div>
        {children}
      </div>
    </section>
  );
}

function PublicProfileCard({
  userId,
  nickname,
  avatar,
  vipLabel
}: {
  userId?: number;
  nickname: string;
  avatar?: string;
  vipLabel: string;
}) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center gap-2 px-4">
      <div className="avatar">
        <div className="w-15 rounded-full bg-primary/15">
          {avatar ? (
            <img src={avatar} alt={nickname || "Public profile avatar"} />
          ) : (
            <UserRound
              size={30}
              aria-hidden="true"
              className="absolute inset-0 m-auto text-primary pointer-events-none"
            />
          )}
        </div>
      </div>
      <div className="rounded-sm bg-base-100/100 px-2 py-1 text-xs text-base-content -mt-4">
        {vipLabel}
      </div>
      <div className="text-center space-y-1">
        <p className="text-lg font-bold text-base-content">{nickname}</p>
        <p className="text-sm text-base-content/50">{t('profile:gameId')}: {userId}</p>
      </div>
    </div>
  );
}

function PublicStats({
  totalWins,
  totalBets,
  totalWagered,
  t
}: {
  totalWins: string;
  totalBets: string;
  totalWagered: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg bg-base-200">
      <div className="flex flex-col items-center justify-center rounded-md bg-base-300 p-2">
        <p className="text-xs text-base-content/50">{t("common:common.totalWins")}</p>
        <p className="text-base font-bold">{totalWins}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-md bg-base-300 p-2">
        <p className="text-xs text-base-content/50">{t("common:common.totalBets")}</p>
        <p className="text-base font-bold">{totalBets}</p>
      </div>
      <div className="col-span-2 flex flex-col items-center justify-center rounded-md bg-base-300 p-2">
        <p className="text-xs text-base-content/50">{t("common:common.totalWagered")}</p>
        <p className="text-base font-bold">{totalWagered}</p>
      </div>
    </div>
  );
}

function AchievementStrip({
  achievements
}: {
  achievements: any[];
}) {
  const visibleAchievements = achievements
    .map((achievement) => ({
      id: String(achievement?.id ?? ""),
      icon: ACHIEVEMENT_CONFIG[achievement?.key || ""]?.icon,
      completed: Array.isArray(achievement?.achievementStep)
        && achievement.achievementStep.length > 0
        && achievement.achievementStep.every((step: any) => step?.is_finish === true),
    }))
    .filter((item) => item.icon)
    .slice(0, 6);

  if (!visibleAchievements.length) {
    return <NothingFound className="static min-h-20" />;
  }

  return (
    <div className="flex gap-1 overflow-x-auto hide-scrollbar">
      {visibleAchievements.map((achievement) => (
        <div
          key={achievement.id}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-base-100"
        >
          <img
            src={achievement.icon}
            alt=""
            className={`h-8 w-8 object-contain ${achievement.completed ? "" : "grayscale"}`}
          />
        </div>
      ))}
    </div>
  );
}

function PreviewUnavailable({
  userId
}: {
  userId: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <section className="rounded-2xl bg-base-200 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-base-300">
            <LockKeyhole className="h-6 w-6 text-base-content/50" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">User ID: {userId || "unknown"}</p>
            <p className="text-sm text-base-content/50">Public profile route is ready.</p>
          </div>
        </div>
      </section>

      <section className="relative min-h-[40vh] rounded-2xl bg-base-200 p-4">
        <NothingFound
          className="static min-h-[36vh]"
          icon={<Trophy className="h-6 w-6" />}
          text="This profile needs a dedicated public API. For now, only the signed-in owner's preview is available."
        />
      </section>
    </div>
  );
}

function TopGamesList({
  games,
  formatWithConversion
}: {
  games: TopGame[];
  formatWithConversion: ReturnType<typeof useDisplayCurrencyFormatter>["formatWithConversion"];
}) {
  if (!games.length) {
    return <NothingFound className="static min-h-32" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {games.map((game, index) => {
        const title = game.display_game_name || game.game_name || `Game ${index + 1}`;
        const wageredUsdt = toNumber(game.wagered_usdt);
        const formattedAmount = wageredUsdt > 0
          ? formatWithConversion(wageredUsdt, "USDT", { showCode: true, showSymbol: false }).formatted
          : "";
        return (
          <article
            key={`${game.game_provider || "unknown"}:${game.inner_game_id || index}`}
            className="flex items-center gap-2 bg-base-100 p-2 rounded-lg"
          >
            <div className="w-20 shrink-0">
              <GameImage
                data={game as Record<string, any>}
                game={{
                  inner_game_id: game.inner_game_id,
                  game_provider: game.game_provider,
                  game_name: title,
                  image: game.image
                }}
                hideLock
                enabledBanGameList
              />
            </div>
            <div className={'w-full'}>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-base-content font-bold">{title}</p>
              </div>
              <div className="shrink-0 text-right mt-4">
                <p className="text-xs text-base-content/60">Wagered</p>
                <p className="text-sm text-base-content italic">{formattedAmount}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function RouteComponent() {
  const { t } = useTranslation(["common", "profile", "vip"]);
  const navigate = useAppNavigate();
  const params = useParams<{ userid: string }>();
  const requestedUserId = normalizeUserId(params?.userid);
  const { user, status, isInitialized, isLoading } = useAuth();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const isOwnerPreview = useMemo(() => {
    if (!user?.id || !requestedUserId) return false;
    return String(user.id) === requestedUserId;
  }, [requestedUserId, user?.id]);

  const achievementsQuery = useUserAchievements("asc");
  const topGamesQuery = useTopWageredGames();
  const vipConfigQuery = useVipConfigList();

  const topGames = useMemo<TopGame[]>(() => {
    const source = topGamesQuery.data?.data;
    return Array.isArray(source) ? (source.slice(0, 3) as TopGame[]) : [];
  }, [topGamesQuery.data?.data]);

  const achievements = useMemo(() => {
    const source = achievementsQuery.data?.data;
    return Array.isArray(source) ? source : [];
  }, [achievementsQuery.data?.data]);

  const vipLevel = status?.vip ?? 0;
  const vipConfigList = Array.isArray(vipConfigQuery.data?.data) ? vipConfigQuery.data.data : [];
  const currentVipConfig = vipConfigList.find((item: any) => Number(item?.vip) === Number(vipLevel));
  const formattedWagered = formatWithConversion(status?.bet_in_ori || 0, "USDT", {
    showSymbol: true,
    showCode: false
  }).formatted;
  const displayName = user?.nickname || `Player ${user?.id ?? ""}`.trim();
  const medalKey = String(currentVipConfig?.medal || "").toLowerCase();
  const medalLabel = medalKey ? t(`vip:${medalKey}`, { defaultValue: "" }) : "";
  const medalBaseLevelMap: Record<string, number> = {
    bronze: 1,
    silver: 21,
    gold: 41,
    ruby: 61,
    sapphire: 81,
    platinum: 101
  };
  const medalBaseLevel = medalBaseLevelMap[medalKey] ?? 1;
  const tierIndex = Math.max(1, vipLevel - medalBaseLevel + 1);
  const vipLabel = medalLabel
    ? `${medalLabel} ${tierIndex}`
    : (currentVipConfig ? `VIP ${currentVipConfig.vip}` : `VIP ${vipLevel}`);

  if (!isInitialized || isLoading) {
    return <div className="min-h-dvh bg-base-300" />;
  }

  if (!isOwnerPreview) {
    return <PreviewUnavailable userId={requestedUserId} />;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
        <PublicProfileCard
          userId={user?.id}
          nickname={displayName}
          avatar={user?.avatar}
          vipLabel={vipLabel}
        />

        <PublicSectionCard
          title={`${t("common:common.achievements")}`}
          icon={<Medal className="h-4 w-4" />}
          actionLabel="Details"
          onAction={() => void navigate({ to: "/player/$userid/achievements", params: { userid: requestedUserId } })}
        >
          <AchievementStrip achievements={achievements} />
        </PublicSectionCard>

        <PublicSectionCard
          title="Stats"
          icon={<ChartNoAxesColumn className="h-4 w-4" />}
          actionLabel="Details"
          onAction={() => void navigate({ to: "/player/$userid/stats", params: { userid: requestedUserId } })}
        >
          <PublicStats
            totalWins={toNumber(status?.bet_win_times).toLocaleString()}
            totalBets={toNumber(status?.bet_times).toLocaleString()}
            totalWagered={formattedWagered}
            t={t}
          />
        </PublicSectionCard>

        <PublicSectionCard
          title={t("common:common.top3Games")}
          icon={<Trophy className="h-4 w-4" />}
        >
          <TopGamesList games={topGames} formatWithConversion={formatWithConversion} />
        </PublicSectionCard>
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
