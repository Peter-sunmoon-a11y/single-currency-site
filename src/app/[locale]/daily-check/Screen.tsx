import Iconify from "@/components/iconify";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { AUTH_QUERY_KEYS, useUserBuddyBallsHome } from "@/hooks/api/useAuth.ts";
import { useDailyCheckInConfig } from "@/hooks/api/usePublic.ts";
import { buildHref } from "@/lib/navigation.ts";
import { BALL_ICON_DIR, BALL_ICON_FILE_BY_VALUE, InnerBallIcon } from "@/sections/bonus/check_in/check-in-card.tsx";
import { dailyCheckin } from "@/services/auth/bonus.ts";
import { userBuddyBallsHome } from "@/services/auth/miniGames.ts";
import { queryClient } from "@/integrations/tanstack-query/root-provider.tsx";
import type { ApiResponse } from "@/types/auth.ts";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import { getPathInROIBEST } from "@/utils/helper.ts";
import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next.tsx";
import { toast } from "sonner";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { InnerShareLink } from "@/sections/bonus/buddy-ball/share.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate.ts";
import DepositToContinueCheckInModal from "@/sections/daily-check/DepositToContinueCheckInModal.tsx";

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
type CheckInDateItem = { sign_date?: number; sign_date_date?: string; ball?: number };
type RewardMapEntry = { rewardDay: number | null; ball: number | null };

type BeforeLoadArgs = {
  context: {
    auth: {
      isAuthenticated: boolean;
      isLoading: boolean;
    };
  };
};

const redirectToBonus = () => {
  const error = new Error("APP_CLIENT_REDIRECT") as Error & { href?: string };
  error.href = String(buildHref({ to: "/bonus" }));
  throw error;
};

export const beforeLoad = async ({ context }: BeforeLoadArgs) => {
  const { isAuthenticated, isLoading } = context.auth;

  if (isLoading || !isAuthenticated) {
    return;
  }

  const cachedBuddyBallsHome = queryClient.getQueryData<ApiResponse<any>>(AUTH_QUERY_KEYS.userBuddyBallsHome);
  const buddyBallsHome = cachedBuddyBallsHome ?? await queryClient.fetchQuery<ApiResponse<any>>({
    queryKey: AUTH_QUERY_KEYS.userBuddyBallsHome,
    queryFn: () => userBuddyBallsHome()
  });

  if (buddyBallsHome?.data?.daily_check_in_disabled) {
    redirectToBonus();
  }
};

const createUtcDate = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day));

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

const useUtcMidnightCountdown = (enabled: boolean, onExpire?: () => void) => {
  const getSecondsUntilUtcMidnight = () => {
    const now = new Date();
    const nextUtcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    return Math.max(0, Math.floor((nextUtcMidnight - now.getTime()) / 1000));
  };

  const [remaining, setRemaining] = useState(getSecondsUntilUtcMidnight);

  useEffect(() => {
    if (!enabled) return;
    setRemaining(getSecondsUntilUtcMidnight());
    const id = window.setInterval(() => {
      const next = getSecondsUntilUtcMidnight();
      setRemaining(next);
      if (next <= 0) {
        window.clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [enabled, onExpire]);

  return {
    remaining,
    formatted: formatCountdown(remaining),
    expired: remaining <= 0
  };
};

// 统一把本地日期转成 YYYY-MM-DD，方便做按天维度的比较和 Map 索引
const getDateKey = (date: Date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;

// 把 YYYY-MM-DD 还原成本地 Date，后续用于计算相邻日期差值
const parseDateKeyToDate = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return createUtcDate(year, month - 1, day);
};

// 优先使用后端已返回的日期字符串；没有时再用秒级时间戳兜底生成日期 key
const getCheckInDateKey = (item: CheckInDateItem) => item.sign_date_date || (item.sign_date ? getDateKey(new Date(item.sign_date * 1000)) : "");

// 去重并排序，得到完整签到历史的日期序列
const getSortedCheckInDateKeys = (checkInDates: CheckInDateItem[]) => [...new Set(
  checkInDates
    .map((item) => getCheckInDateKey(item))
    .filter(Boolean)
)].sort();

// 按 rewardDay 从配置列表里取出对应奖励；超出长度时按周期循环
const getRewardConfigForDay = (dailyCheckInList: {
  day: number;
  ball: number
}[], rewardDay: number) => dailyCheckInList[(rewardDay - 1) % dailyCheckInList.length] as {
  day: number;
  ball: number
} | undefined;

const getRewardDayFromOffset = (anchorRewardDay: number, offsetDays: number, cycleLength: number) => {
  const zeroBasedRewardDay = ((anchorRewardDay - 1 + offsetDays) % cycleLength + cycleLength) % cycleLength;
  return zeroBasedRewardDay + 1;
};

// 新用户还没有任何签到历史时，从“今天”开始构造一个纯前瞻性的奖励映射
const buildNewUserRewardMap = (
  dailyCheckInList: { day: number; ball: number }[],
  today: Date,
  monthStartDate: Date,
  visibleCalendarEndDate: Date
) => {
  const rewardMap = new Map<string, RewardMapEntry>();
  const seedDate = createUtcDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const currentSystemMonthStartDate = createUtcDate(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const nextSystemMonthStartDate = createUtcDate(today.getUTCFullYear(), today.getUTCMonth() + 1, 1);

  if (monthStartDate.getTime() !== currentSystemMonthStartDate.getTime() && monthStartDate.getTime() !== nextSystemMonthStartDate.getTime()) {
    return rewardMap;
  }

  let rewardDay = 1;
  let cursorDate = monthStartDate.getTime() === currentSystemMonthStartDate.getTime()
    ? seedDate
    : monthStartDate;

  if (cursorDate.getTime() > visibleCalendarEndDate.getTime()) {
    return rewardMap;
  }

  if (monthStartDate.getTime() === nextSystemMonthStartDate.getTime()) {
    const dayOffset = Math.floor((monthStartDate.getTime() - seedDate.getTime()) / (24 * 60 * 60 * 1000));
    rewardDay = (dayOffset % dailyCheckInList.length) + 1;
  }

  while (cursorDate.getTime() <= visibleCalendarEndDate.getTime()) {
    const cursorDateKey = getDateKey(cursorDate);
    const rewardConfig = getRewardConfigForDay(dailyCheckInList, rewardDay);

    rewardMap.set(cursorDateKey, {
      rewardDay,
      ball: rewardConfig?.ball ?? null
    });

    rewardDay = rewardDay >= dailyCheckInList.length ? 1 : rewardDay + 1;
    cursorDate = createUtcDate(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth(), cursorDate.getUTCDate() + 1);
  }

  return rewardMap;
};

function RouteComponent() {
  const navigate = useAppNavigate();
  const { t } = useTranslation(["bonus", "buddyBalls", "popup"]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [depositRequire, setDepositRequire] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return createUtcDate(now.getUTCFullYear(), now.getUTCMonth(), 1);
  });
  const { data: buddyBallsData, refetch: refetchBuddyBalls, isLoading: isBuddyBallsLoading } = useUserBuddyBallsHome();
  const { data: dailyCheckInConfigData } = useDailyCheckInConfig();

  // 当前时间与接口原始数据
  const today = new Date();
  const dailyResetLocalTime = getLocalTimeForUtcMidnight(today);
  const buddyBalls = buddyBallsData?.data;
  const dailyCheckInList = dailyCheckInConfigData?.data?.list ?? [];
  const historyCheckInDates = buddyBalls?.checkin_dates ?? [];
  const continuousCheckInDaysInPeriod = buddyBalls?.continuous_checkin_days_in_period || 0;
  const currentPeriodStartTs = buddyBalls?.buddy_balls_first_checkin_date_ts || 0;
  const currentPeriodLastCheckInTs = buddyBalls?.continuous_checkin_last_date_ts || 0;
  const firstEverCheckInTs = buddyBalls?.first_checkin?.sign_date || 0;

  // 先把历史签到日期整理成去重且有序的 key 集合，后面所有奖励推导都基于它
  const sortedHistoryDateKeys = useMemo(() => getSortedCheckInDateKeys(historyCheckInDates), [historyCheckInDates]);
  const checkedDateKeys = useMemo<Set<string>>(() => new Set(sortedHistoryDateKeys), [sortedHistoryDateKeys]);

  // 找到最早可用签到日期，决定日历最早能回看哪个月份
  const fallbackEarliestHistoryDateKey = useMemo(() => (historyCheckInDates.length > 0
    ? sortedHistoryDateKeys[0]
    : null), [historyCheckInDates.length, sortedHistoryDateKeys]);
  const earliestHistoryCheckInTs = useMemo(() => firstEverCheckInTs
    || currentPeriodStartTs
    || (historyCheckInDates.length > 0
      ? Math.min(...historyCheckInDates.map((item: { sign_date: number }) => item.sign_date * 1000)) / 1000
      : 0), [currentPeriodStartTs, firstEverCheckInTs, historyCheckInDates]);
  const firstCheckInDate = useMemo(() => {
    if (earliestHistoryCheckInTs) {
      return new Date(earliestHistoryCheckInTs * 1000);
    }

    if (fallbackEarliestHistoryDateKey) {
      return parseDateKeyToDate(fallbackEarliestHistoryDateKey);
    }

    return null;
  }, [earliestHistoryCheckInTs, fallbackEarliestHistoryDateKey]);

  // 判断今天是否已经签到，并据此控制按钮状态和当天样式
  const todayDateKey = getDateKey(today);
  const lastCurrentPeriodCheckInDate = useMemo(() => currentPeriodLastCheckInTs
    ? new Date(currentPeriodLastCheckInTs * 1000)
    : null, [currentPeriodLastCheckInTs]);
  const isTodayCheckedDay = checkedDateKeys.has(todayDateKey)
    || (!!lastCurrentPeriodCheckInDate && getDateKey(lastCurrentPeriodCheckInDate) === todayDateKey);

  const { expired: isUtcResetExpired } = useUtcMidnightCountdown(
    isTodayCheckedDay,
    () => {
      void refetchBuddyBalls();
    }
  );
  const previousMonth = createUtcDate(today.getUTCFullYear(), today.getUTCMonth() - 1, 1);
  const earliestDataMonth = firstCheckInDate
    ? createUtcDate(firstCheckInDate.getUTCFullYear(), firstCheckInDate.getUTCMonth(), 1)
    : createUtcDate(today.getUTCFullYear(), today.getUTCMonth(), 1);
  const minMonth = earliestDataMonth.getTime() > previousMonth.getTime()
    ? earliestDataMonth
    : previousMonth;
  const maxMonth = createUtcDate(today.getUTCFullYear(), today.getUTCMonth() + 1, 1);

  // 当前日历页的基础信息：天数、起始星期、月份前缀
  const currentMonthDays = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0).getUTCDate();
  const currentMonthStartDay = currentMonth.getUTCDay();
  const currentMonthDatePrefix = `${currentMonth.getUTCFullYear()}-${String(currentMonth.getUTCMonth() + 1).padStart(2, "0")}-`;
  const firstCurrentMonthCheckInDateKey = useMemo(() => {
    const currentMonthKeys: string[] = Array.from(checkedDateKeys)
      .filter((dateKey) => dateKey.startsWith(currentMonthDatePrefix))
      .sort();

    return currentMonthKeys[0] ?? null;
  }, [checkedDateKeys, currentMonthDatePrefix]);
  const lastCheckInBeforeCurrentMonthDateKey = useMemo(() => {
    const monthStartDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1);

    for (let index = sortedHistoryDateKeys.length - 1; index >= 0; index -= 1) {
      const dateKey = sortedHistoryDateKeys[index];
      const historyDate = parseDateKeyToDate(dateKey);

      if (historyDate.getTime() < monthStartDate.getTime()) {
        return dateKey;
      }
    }

    return null;
  }, [currentMonth, sortedHistoryDateKeys]);
  const currentMonthRewardStartDate = useMemo(() => firstCurrentMonthCheckInDateKey
    ? parseDateKeyToDate(firstCurrentMonthCheckInDateKey)
    : null, [firstCurrentMonthCheckInDateKey]);
  const displayedMonthBackfillStartDate = useMemo(() => {
    const monthStartDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1);
    const currentSystemMonthStartDate = createUtcDate(today.getUTCFullYear(), today.getUTCMonth(), 1);

    if (sortedHistoryDateKeys.length === 0) {
      return null;
    }

    if (currentMonth.getTime() > currentSystemMonthStartDate.getTime()) {
      return null;
    }

    if (lastCheckInBeforeCurrentMonthDateKey) {
      const lastCheckInBeforeCurrentMonthDate = parseDateKeyToDate(lastCheckInBeforeCurrentMonthDateKey);
      return createUtcDate(
        lastCheckInBeforeCurrentMonthDate.getUTCFullYear(),
        lastCheckInBeforeCurrentMonthDate.getUTCMonth(),
        lastCheckInBeforeCurrentMonthDate.getUTCDate() + 1
      );
    }

    return currentMonthRewardStartDate ?? monthStartDate;
  }, [currentMonth, currentMonthRewardStartDate, lastCheckInBeforeCurrentMonthDateKey, sortedHistoryDateKeys.length, today]);
  const visibleCalendarEndDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), currentMonthDays);
  const actualCheckInMap = useMemo(() => {
    const nextActualCheckInMap = new Map<string, { ball: number | null }>();

    historyCheckInDates.forEach((item: CheckInDateItem) => {
      const dateKey = getCheckInDateKey(item);

      if (!dateKey) return;

      nextActualCheckInMap.set(dateKey, {
        ball: typeof item.ball === "number" ? item.ball : null
      });
    });

    return nextActualCheckInMap;
  }, [historyCheckInDates]);
  const currentPeriodStartDate = useMemo(() => {
    if (currentPeriodStartTs) {
      return new Date(currentPeriodStartTs * 1000);
    }

    if (!lastCurrentPeriodCheckInDate || continuousCheckInDaysInPeriod <= 0) {
      return null;
    }

    return createUtcDate(
      lastCurrentPeriodCheckInDate.getUTCFullYear(),
      lastCurrentPeriodCheckInDate.getUTCMonth(),
      lastCurrentPeriodCheckInDate.getUTCDate() - continuousCheckInDaysInPeriod + 1
    );
  }, [continuousCheckInDaysInPeriod, currentPeriodStartTs, lastCurrentPeriodCheckInDate]);

  // 生成“日期 -> 奖励”的映射：已签到日优先显示真实发奖值；其余日期仅围绕当前连续签到周期做推算
  const rewardMap = useMemo(() => {
    const nextRewardMap = new Map<string, RewardMapEntry>();
    const monthStartDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1);

    if (dailyCheckInList.length === 0) {
      return nextRewardMap;
    }

    if (actualCheckInMap.size === 0) {
      return buildNewUserRewardMap(dailyCheckInList, today, monthStartDate, visibleCalendarEndDate);
    }

    actualCheckInMap.forEach((value, key) => {
      const currentDate = parseDateKeyToDate(key);

      if (currentDate.getTime() < monthStartDate.getTime() || currentDate.getTime() > visibleCalendarEndDate.getTime()) {
        return;
      }

      nextRewardMap.set(key, {
        rewardDay: null,
        ball: value.ball
      });
    });

    if (!lastCurrentPeriodCheckInDate || continuousCheckInDaysInPeriod <= 0) {
      return nextRewardMap;
    }

    const cycleLength = dailyCheckInList.length;
    const anchorDate = createUtcDate(
      lastCurrentPeriodCheckInDate.getUTCFullYear(),
      lastCurrentPeriodCheckInDate.getUTCMonth(),
      lastCurrentPeriodCheckInDate.getUTCDate()
    );
    const anchorRewardDay = getRewardDayFromOffset(1, continuousCheckInDaysInPeriod - 1, cycleLength);
    const projectionStartDate = currentPeriodStartDate
      ? createUtcDate(
        currentPeriodStartDate.getUTCFullYear(),
        currentPeriodStartDate.getUTCMonth(),
        currentPeriodStartDate.getUTCDate()
      )
      : anchorDate;
    const cursorStartDate = projectionStartDate.getTime() > monthStartDate.getTime() ? projectionStartDate : monthStartDate;

    if (cursorStartDate.getTime() > visibleCalendarEndDate.getTime()) {
      return nextRewardMap;
    }

    let cursorDate = cursorStartDate;

    while (cursorDate.getTime() <= visibleCalendarEndDate.getTime()) {
      const dateKey = getDateKey(cursorDate);
      const offsetDays = Math.round((cursorDate.getTime() - anchorDate.getTime()) / (24 * 60 * 60 * 1000));
      const rewardDay = getRewardDayFromOffset(anchorRewardDay, offsetDays, cycleLength);
      const rewardConfig = getRewardConfigForDay(dailyCheckInList, rewardDay);

      if (!nextRewardMap.has(dateKey)) {
        nextRewardMap.set(dateKey, {
          rewardDay,
          ball: rewardConfig?.ball ?? null
        });
      }

      cursorDate = createUtcDate(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth(), cursorDate.getUTCDate() + 1);
    }

    return nextRewardMap;
  }, [
    actualCheckInMap,
    continuousCheckInDaysInPeriod,
    currentMonth,
    currentPeriodStartDate,
    dailyCheckInList,
    lastCurrentPeriodCheckInDate,
    today,
    visibleCalendarEndDate
  ]);

  // 把当前月转换成可直接渲染的格子数据，空位用于补齐周视图前导空白
  const calendarCells = useMemo(() => [
    ...Array.from({ length: currentMonthStartDay }, () => null),
    ...Array.from({ length: currentMonthDays }).map((_, index) => {
      const dayNumber = index + 1;
      const cellDate = createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), dayNumber);
      const dateKey = getDateKey(cellDate);
      const reward = rewardMap.get(dateKey);

      return {
        day: cellDate.getUTCDate(),
        dateKey,
        ball: reward?.ball ?? null,
        rewardDay: reward?.rewardDay ?? null,
        isCurrentMonth: true
      };
    })
  ], [currentMonth, currentMonthDays, currentMonthStartDay, rewardMap]);

  // 控制月份切换按钮是否可点：最多看下个月，最早看有数据的月份或上个月
  const isCurrentSystemMonth = currentMonth.getUTCFullYear() === today.getUTCFullYear() && currentMonth.getUTCMonth() === today.getUTCMonth();
  const canGoToPreviousMonth = currentMonth.getTime() > minMonth.getTime();
  const canGoToNextMonth = currentMonth.getTime() < maxMonth.getTime();

  const { navigateCallback } = useNavigateGuard();

  const handle = () => {
    navigateCallback(() => {
      setIsCheckingIn(true);
      dailyCheckin().then((req) => {
        if (req.code === 0) {
          toast.success(t("toast:check_in_success"));
          return refetchBuddyBalls();
        } else if (req.code === 51046) {
          toast.error(t("toast:check_in_already"));
        } else if (req.code === 51078) {
          setDepositRequire(true);
        } else {
          toast.error(t("toast:check_in_failed"));
        }
      }).catch(() => {
        toast.error(t("toast:check_in_failed"));
      }).finally(() => {
        setIsCheckingIn(false);
      });
    }, true);
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const getLocalDateKey = () => getDateKey(new Date());

    let lastDateKey = getLocalDateKey();

    const refreshDailyQueries = () => {
      refetchBuddyBalls();
      lastDateKey = getLocalDateKey();
    };

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
      const delay = Math.max(nextMidnight.getTime() - now.getTime(), 1000);

      timeoutId = setTimeout(() => {
        refreshDailyQueries();
        scheduleNextMidnight();
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const currentDateKey = getLocalDateKey();

      if (currentDateKey !== lastDateKey) {
        refreshDailyQueries();
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
  }, [refetchBuddyBalls]);

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        {/*背景图背景色背景文字*/}
        <InnerSlogan
          // 根据设计稿自行修改文字
          title={t("buddyBalls:daily_check_in")}
          // 根据设计稿自行修改图片
          picture="/images/game_buddy_balls/daily-check-in.png"
        />

        <div className="flex items-center justify-between bg-base-200 px-4 py-2 rounded-lg">
          <TextBaseContent text={<Trans
            i18nKey={"buddyBalls:day_streak"}
            values={{ value: continuousCheckInDaysInPeriod }}
            components={[<span className="text-primary" />]}
          />} className={"!text-sm !text-base-content"} />

          <div className="flex items-center gap-1">
            <div className="text-sm text-base-content">{t("bonus:available")}:</div>
            <img src={`${getPathInROIBEST()}/images/game_buddy_balls/ball.png`} alt=""
                 className="w-5 h-5 object-contain" />
            <div className="text-sm text-primary">
              x{buddyBallsData?.data?.balls || 0}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center ">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm btn-primary btn-soft btn-square`}
              onClick={() => canGoToPreviousMonth && setCurrentMonth(createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() - 1, 1))}
              disabled={!canGoToPreviousMonth}
            >
              <Iconify icon="custom:date_left" className="w-4 h-4" />
            </button>
            <div
              className="text-base font-bold text-base-content">{`${currentMonth.getUTCFullYear()} ${String(currentMonth.getUTCMonth() + 1).padStart(2, "0")}`}</div>
            <button
              type="button"
              className={`btn btn-sm btn-primary btn-soft btn-square`}
              onClick={() => canGoToNextMonth && setCurrentMonth(createUtcDate(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 1))}
              disabled={!canGoToNextMonth}
            >
              <Iconify icon="custom:date_right" className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 w-full">
            {weekDays.map((day) => (
              <TextBaseContent key={day} className="text-center" text={day} />
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 w-full">
            {
              calendarCells.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} className="h-10" />;
                }

                const isToday = cell.isCurrentMonth && isCurrentSystemMonth && cell.day === today.getUTCDate();
                const isCurrentCellTodayCheckedDay = isToday && isTodayCheckedDay;
                const isCheckedDay = checkedDateKeys.has(cell.dateKey);
                const missedStartDate = displayedMonthBackfillStartDate ?? firstCheckInDate;
                const isMissedDay = !!missedStartDate
                  && cell.isCurrentMonth
                  && cell.dateKey >= getDateKey(missedStartDate)
                  && cell.dateKey < todayDateKey
                  && !isCheckedDay;

                const ballIconFile = cell.ball ? (BALL_ICON_FILE_BY_VALUE[cell.ball] || "more-ball-bg.png") : null;
                const ballIconSrc = ballIconFile ? `${BALL_ICON_DIR}/${ballIconFile}` : null;

                return (
                  <div
                    key={`${cell.isCurrentMonth ? "current" : "adjacent"}-${index}-${cell.day}`}
                    className={`
                    ${(isToday && !isCurrentCellTodayCheckedDay) ?
                      "bg-primary-content border-primary" :
                      "bg-base-200 border-primary/20"}
                    h-[64px] border rounded-md flex flex-col items-center justify-end overflow-hidden relative
                  `}
                  >
                    {(isCheckedDay || isCurrentCellTodayCheckedDay) &&
                      (
                        <div
                          className="bg-primary/30 w-[16px] h-[16px] absolute top-0 right-0 z-1 flex items-center justify-center">
                          <Iconify icon="custom:check" strokeWidth={3} size={12} className="text-primary" />
                        </div>
                      )
                    }

                    {
                      (isToday && !isTodayCheckedDay) && (
                        <div className="bg-primary rounded-full absolute top-1 right-1 w-2 h-2 z-1" />
                      )
                    }

                    {
                      isMissedDay ? (<>
                        <div
                          className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,color-mix(in_oklch,var(--color-warning),transparent_55%)_5px,color-mix(in_oklch,var(--color-warning),transparent_55%)_7px)] pointer-events-none z-1" />
                        <div
                          className="text-[12px] font-semibold absolute top-0 left-1 z-1 text-warning leading-none">{String(cell.day).padStart(2, "0")}</div>
                      </>) : (
                        <div
                          className={`text-[12px] font-semibold absolute top-0 left-1 z-1 text-primary leading-none`}>{String(cell.day).padStart(2, "0")}</div>
                      )
                    }

                    <div className="flex-1 h-full w-full relative flex items-center justify-center">
                      <InnerBallIcon src={ballIconSrc} />
                    </div>

                    <div className={`
                    ${isToday ? `text-primary-content ${(!isToday && cell.dateKey < todayDateKey) ? "bg-primary/50" : "bg-primary"}` : "bg-base-100 text-base-content/50"} 
                    text-[12px] font-bold w-full flex items-center justify-center capitalize
                  `}>
                      {isToday ? `+${cell?.ball ?? 0}` : `${cell.ball ? `+${cell?.ball ?? 0}` : ""}`}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <ConfirmBox
            className="capitalize flex-1"
            onClick={handle}
            loading={isCheckingIn}
            disabled={isBuddyBallsLoading || isCheckingIn || (isTodayCheckedDay && !isUtcResetExpired)}>
            {(isTodayCheckedDay && !isUtcResetExpired)
              ? `${t("buddyBalls:daily_reset", { time: dailyResetLocalTime })}`
              : t("buddyBalls:check_in_today")}
          </ConfirmBox>
          <button
            className="btn btn-primary btn-soft capitalize flex-1"
            onClick={() => void navigate({ to: "/buddy-balls" })}>
            <img src="/images/game_buddy_balls/ball-pool.png" alt="" className="h-6 w-6" />
            {t("gameDetail:play")}
          </button>
        </div>

        <div>
          <div className="divider divider-start text-sm font-bold text-primary italic">
            {t("popup:buddy_ball_modal.get_more_buddy_balls")}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-base-200 rounded-md px-3 py-2">
              <TextBaseContent text={t("popup:buddy_ball_modal.refer_a_friend")} />
              <div className="flex items-center gap-1 shrink-0">
                <img src={`${getPathInROIBEST()}/images/game_buddy_balls/ball.png`} className="w-5 h-5" />
                <span className="text-sm font-bold text-primary">x1</span>
              </div>
            </div>
            <div className="flex items-center justify-between bg-base-200 rounded-md px-3 py-2">
              <TextBaseContent text={t("popup:buddy_ball_modal.referral_first_deposit")} />
              <div className="flex items-center gap-1 shrink-0">
                <img src={`${getPathInROIBEST()}/images/game_buddy_balls/ball.png`} className="w-5 h-5" />
                <span className="text-sm font-bold text-primary">x5</span>
              </div>
            </div>
          </div>
        </div>
        <InnerShareLink />
      </div>

      <DepositToContinueCheckInModal
        open={depositRequire}
        onClose={() => setDepositRequire(false)}
      />
    </>
  );
}

export default RouteComponent;
