import Iconify from "@/components/iconify";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { useBoundStore } from "@/store";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth";
import { useDailyCheckInConfig } from "@/hooks/api/usePublic";
import { dailyCheckin } from "@/services/auth/bonus";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";

import { CheckInCardLoading } from "../bonus-components/check-in-card-loading";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import DepositToContinueCheckInModal from "@/sections/daily-check/DepositToContinueCheckInModal.tsx";

const isSameUtcDate = (left: Date, right: Date) => left.getUTCFullYear() === right.getUTCFullYear()
  && left.getUTCMonth() === right.getUTCMonth()
  && left.getUTCDate() === right.getUTCDate();

const getUtcDateKey = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

const formatCountdown = (totalSeconds: number) => {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const getLocalTimeForUtcMidnight = (now: Date = new Date()) => {
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(utcMidnight);
};

export const BALL_ICON_DIR = "/images/game_buddy_balls";
export const BALL_ICON_FILE_BY_VALUE: Partial<Record<number, string>> = {
  12: "ball-12.png",
  9: "ball-9.png",
  6: "ball-6.png",
  3: "ball-3.png",
  2: "ball-2.png",
  1: "ball-1.png"
};

function InnerCheckInStatus(
  {
    isClaimedCard,
    isTodayCard
  }: {
    isClaimedCard: boolean;
    isTodayCard: boolean;
  }) {
  if (isClaimedCard) {
    return <div className="bg-primary/30 w-[16px] h-[16px] absolute top-0 right-0 z-1 flex items-center justify-center">
      <Iconify icon="custom:check" strokeWidth={3} size={12} className="text-primary" />
    </div>;
  }

  if (!isClaimedCard && isTodayCard) {
    return <div className="bg-primary rounded-full absolute top-1 right-1 w-2 h-2 z-1" />;
  }

  return null;
}

function InnerCheckInDayLabel({ className, label }: { className: string; label: string }) {
  return <div className={`${className} text-[12px] w-full flex items-center justify-center capitalize`}>{label}</div>;
}

export function InnerBallIcon({ src, className }: { src: string | null, className?: string }) {
  if (!src) return null;
  return <img src={src} alt="" className={clsx(`h-8 object-contain transform`, className)} />;
}

const useUtcMidnightCountdown = (enabled: boolean, onExpire?: () => void) => {
  const getSecondsUntilUtcMidnight = () => {
    const now = new Date();
    const nextUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    return Math.max(0, Math.floor((nextUtcMidnight - now.getTime()) / 1000));
  };

  const [remaining, setRemaining] = useState(getSecondsUntilUtcMidnight);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!enabled) return;
    setRemaining(getSecondsUntilUtcMidnight());
    const id = setInterval(() => {
      const next = getSecondsUntilUtcMidnight();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(id);
        onExpireRef.current?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [enabled]);

  return { remaining, formatted: formatCountdown(remaining), expired: remaining <= 0 };
};

export function CheckInCard() {
  const navigate = useAppNavigate();
  const { t } = useTranslation("buddyBalls");
  const { data: buddyBallsData, refetch: refetchBuddyBalls, isLoading } = useUserBuddyBallsHome();

  const isAuthenticated = useBoundStore((state) => !!state.user);
  const isInitialized = useBoundStore((state) => state.isInitialized);
  const openModal = useBoundStore((state) => state.openModal);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const today = new Date();
  const lastCheckInAt = buddyBallsData?.data?.continuous_checkin_last_date_ts;
  const lastCheckInDate = lastCheckInAt ? new Date(lastCheckInAt * 1000) : null;
  const continuousCheckInDaysInPeriod = buddyBallsData?.data?.continuous_checkin_days_in_period || 0;
  const isTodayChecked = !!lastCheckInDate
    && isSameUtcDate(lastCheckInDate, today);

  const { expired: countdownExpired } = useUtcMidnightCountdown(
    isTodayChecked,
    () => {
      void refetchBuddyBalls();
    }
  );
  const isButtonDisabled = isCheckingIn || (isTodayChecked && !countdownExpired);

  const dailyResetLocalTime = getLocalTimeForUtcMidnight(today);

  const handleCheckIn = () => {
    if (isAuthenticated) {
      checkIn();
    } else {
      openModal("OPEN_AUTH_MODAL", { initialTab: "signin" });
    }
  };

  const checkIn = () => {
    setIsCheckingIn(true);
    dailyCheckin().then((req) => {
      if (req.code === 0) {
        toast.success(t("toast:check_in_success"));
        return refetchBuddyBalls();
      } else if (req.code === 51046) {
        toast.error(t("toast:check_in_already"));
      } else if (req.code === 51077) {
        setIsDepositModalOpen(true);
      } else {
        toast.error(t("toast:check_in_failed"));
      }
      return null;
    }).catch(() => {
      toast.error(t("toast:check_in_failed"));
    }).finally(() => {
      setIsCheckingIn(false);
    });
  };

  const isInitialLoading = !isInitialized || (isAuthenticated && isLoading && !buddyBallsData);

  if (isInitialLoading) return <CheckInCardLoading />;

  return (
    <>
      <div className="bg-base-200 gap-2 flex flex-col p-2 rounded-lg">
        <TextBaseContent text={<Trans
          i18nKey={"buddyBalls:day_streak"}
          values={{ value: continuousCheckInDaysInPeriod }}
          components={[<span className="text-primary" />]}
        />} />

        <CheckInIconsCarousel />

        <ConfirmBox
          loading={isCheckingIn}
          className="btn-soft capitalize"
          onClick={handleCheckIn}
          disabled={isButtonDisabled}>
          {
            (
              isTodayChecked && !countdownExpired)
              ? t("buddyBalls:daily_reset", { time: dailyResetLocalTime })
              : t("buddyBalls:check_in")
          }</ConfirmBox>

        <div className="flex gap-2">
          <button className="btn btn-primary btn-md btn-soft flex-1 capitalize"
                  onClick={() => void navigate({ to: "/buddy-balls" })}>
            <img src="/images/game_buddy_balls/ball-pool.png" alt="" className="h-6 w-6" />
            {t("gameDetail:play")}
          </button>
          <button className="btn btn-primary btn-md btn-soft flex-1 capitalize"
                  onClick={() => void navigate({ to: "/bonus/check" })}>{t("buddyBalls:get_more")}</button>
        </div>
      </div>

      <DepositToContinueCheckInModal
        open={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </>
  );
}

export const CheckInIconsCarousel = () => {
  const { t } = useTranslation("buddyBalls");
  const { data: buddyBallsData, refetch } = useUserBuddyBallsHome();
  const { data: dailyCheckInConfigData } = useDailyCheckInConfig();
  const isAuthenticated = useBoundStore((state) => !!state.user);
  const continuousCheckInDays = buddyBallsData?.data?.continuous_checkin_days_in_period || 0;
  const today = new Date();
  const lastCheckInAt = buddyBallsData?.data?.continuous_checkin_last_date_ts;
  const lastCheckInDate = lastCheckInAt ? new Date(lastCheckInAt * 1000) : null;
  const normalizedContinuousCheckInDays = isAuthenticated && continuousCheckInDays > 0
    ? ((continuousCheckInDays - 1) % 30) + 1
    : 0;
  const currentRewardDay = !isAuthenticated
    ? 1
    : lastCheckInDate
    && isSameUtcDate(lastCheckInDate, today)
      ? Math.max(normalizedContinuousCheckInDays, 1)
      : Math.max((normalizedContinuousCheckInDays % 30) + 1, 1);
  const dailyCheckInList = dailyCheckInConfigData?.data?.list ?? [];

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const getCurrentUtcDateKey = () => getUtcDateKey(new Date());

    let lastDateKey = getCurrentUtcDateKey();

    const refreshBuddyBalls = () => {
      refetch();
      lastDateKey = getCurrentUtcDateKey();
    };

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
      const delay = Math.max(nextMidnight.getTime() - now.getTime(), 1000);

      timeoutId = setTimeout(() => {
        refreshBuddyBalls();
        scheduleNextMidnight();
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const currentDateKey = getCurrentUtcDateKey();

      if (currentDateKey !== lastDateKey) {
        refreshBuddyBalls();
      }
    };

    scheduleNextMidnight();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  return (
    <div className="grid w-full grid-cols-6 gap-0.5">
      {
        Array.from({ length: 30 }).map((_, index) => {
          const day = index + 1;
          const isTodayCard = isAuthenticated && day === currentRewardDay;
          const isDefaultDayCard = !isAuthenticated && day === 1;
          const isActiveCard = isTodayCard || isDefaultDayCard;
          const isClaimedCard = day <= continuousCheckInDays;
          const cardClassName = isActiveCard && !isClaimedCard
            ? "bg-primary-content border-primary"
            : "bg-base-200 border-primary/20";
          const labelClassName = isActiveCard && !isClaimedCard
            ? "text-primary-content bg-primary"
            : "bg-base-100 text-base-content/60";
          const rewardConfig = dailyCheckInList[index % Math.max(dailyCheckInList.length, 1)] as {
            ball?: number
          } | undefined;

          const ball = rewardConfig?.ball ?? null;
          const ballIconFile = ball ? (BALL_ICON_FILE_BY_VALUE[ball] || `more-ball-bg.png`) : null;
          const ballIconSrc = ballIconFile ? `${BALL_ICON_DIR}/${ballIconFile}` : null;

          return (
            <div
              className={`${cardClassName} h-full border rounded-md flex flex-col items-center justify-between overflow-hidden relative`}>
              <InnerCheckInStatus
                isClaimedCard={isClaimedCard}
                isTodayCard={isTodayCard} />

              <InnerBallIcon src={ballIconSrc} />

              <InnerCheckInDayLabel className={labelClassName} label={isTodayCard ? t("chat:today") : `D${day}`} />
            </div>
          );
        })
      }
    </div>
  );
};
