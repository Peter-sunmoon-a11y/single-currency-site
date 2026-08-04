import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { HistoryIcon } from "lucide-react";
import {
  getPrizeImageUrl,
  InnerBonusItem,
  InnerPrizeDisplay,
  SPIN_CURRENCY,
  SPIN_BUFFER
} from "@/sections/lucky-spin/components.tsx";
import { userLuckySpinLottery } from "@/services/auth/miniGames";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { InnerToastCustom } from "@/sections/dollars/components.tsx";
import { useBoundStore } from "@/store";
import clsx from "clsx";
import { useUserLuckySpinHome } from "@/hooks/api/useAuth.ts";
import { useEarliestPendingRecord } from "@/query/free-spins.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";

const SpinWheel = (
  {
    prizes,
    loading = true,
    spinType,
    mockSpin = false,
    showSpin,
    extraNode,
    onSpinResult,
    onSpinningChange,
    unavailable
  }: any) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation();

  const stepTimersRef = useRef<NodeJS.Timeout[]>([]);
  const finishTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { refetch: refetchLuckySpin } = useUserLuckySpinHome();
  const { refetch: refetchPendingSpin } = useEarliestPendingRecord("home");
  const openModal = useBoundStore((state) => state.openModal);

  const [spinning, setSpinning] = useState(false);
  const [changingType, setChangingType] = useState(false);
  const [winRecords, setWinRecords] = useState<any[]>([]);
  const [activePrizeIndex, setActivePrizeIndex] = useState<number | null>(null);
  const count = prizes.length;

  useEffect(() => {
    onSpinningChange?.(spinning);
  }, [onSpinningChange, spinning]);

  useEffect(() => {
    setChangingType(true);
    setActivePrizeIndex(null);
    const timer = setTimeout(() => {
      setChangingType(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [spinType]);

  useEffect(() => {
    if (count === 0) return;
    setActivePrizeIndex((prev) => {
      if (prev === null) return null;
      return Math.min(prev, count - 1);
    });
  }, [count]);

  useEffect(() => {
    return () => {
      stepTimersRef.current.forEach((timer) => clearTimeout(timer));
      stepTimersRef.current = [];
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  const showBaseToast = useCallback((params: {
    icon: string;
    title: string;
    subTitle: ReactNode;
  }) => {
    toast.custom(
      (tst) => (
        <InnerToastCustom
          closeBtn
          tst={tst}
          icon={params.icon}
          title={params.title}
          subTitle={params.subTitle}
          onConfirm={() => console.info("onClose")}
        />
      ),
      { duration: 6_000, position: "top-right" }
    );
  }, []);

  const showErrorToast = useCallback((i18nKey: string) => {
    showBaseToast({
      icon: "/images/common/error.png",
      title: t("transaction:transactionStatus.failed"),
      subTitle: <Trans i18nKey={i18nKey} />
    });
  }, [showBaseToast, t]);

  const runSpinAnimation = useCallback((targetIndex: number, winData?: Record<string, any>) => {
    const startIndex = activePrizeIndex ?? 0;
    const totalSteps = count * 4 + ((targetIndex - startIndex + count) % count);
    const slowZone = Math.min(8, Math.max(4, count));

    setSpinning(true);

    let elapsed = 0;
    for (let step = 1; step <= totalSteps; step++) {
      const remainingSteps = totalSteps - step;
      const isSlowPhase = remainingSteps < slowZone;
      const stepDelay = isSlowPhase ? 120 + (slowZone - remainingSteps - 1) * 45 : 55;
      elapsed += stepDelay;

      const timer = setTimeout(() => {
        setActivePrizeIndex((startIndex + step) % count);
      }, elapsed);

      stepTimersRef.current.push(timer);
    }

    finishTimerRef.current = setTimeout(() => {
      setSpinning(false);
      setActivePrizeIndex(targetIndex);
      onSpinResult?.(prizes[targetIndex]);
      finishTimerRef.current = null;
      stepTimersRef.current = [];

      // free spin 有自己独特的弹窗,不需要再走一次抽奖弹窗,比较冗余
      if (winData && winData?.extra_data?.prize_type !== "free_spin") {
        openModal("OPEN_WHEEL_FORTUNE_WIN_MODAL", { ...winData });
        setWinRecords(prev => [winData, ...prev]);
      }

      if (winData?.extra_data?.prize_type === "free_spin") {
        void refetchPendingSpin();
      }
    }, elapsed + SPIN_BUFFER);
  }, [activePrizeIndex, count, onSpinResult, openModal, prizes, refetchPendingSpin]);

  const handle = useCallback(async () => {
    try {
      if (spinning || count < 2) return;

      stepTimersRef.current.forEach((timer) => clearTimeout(timer));
      stepTimersRef.current = [];
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);

      if (mockSpin) {
        const targetIndex = Math.floor(Math.random() * count);
        const targetPrize = prizes[targetIndex];
        const mockWinData = {
          record_id: `mock-${spinType}-${Date.now()}`,
          type: spinType,
          extra_data: {
            prize_type: targetPrize?.prize_type,
            prize_name: targetPrize?.prize_name,
            prize_value: targetPrize?.prize_value,
            prize_currency: targetPrize?.prize_currency,
            prize_icon: targetPrize?.prize_icon
          }
        };

        runSpinAnimation(targetIndex, mockWinData);
        return;
      }

      const response = await userLuckySpinLottery(spinType);

      if (response?.code === 0 || response?.code === 200) {
        void refetchLuckySpin();
      } else {
        showErrorToast("");
        return;
      }

      const foundIndex = response?.data?.record_id ? prizes.findIndex((p: {
        prize_type: string;
        prize_name: string;
      }) => (
        p?.prize_type === response?.data?.extra_data?.prize_type &&
        p?.prize_name === response?.data?.extra_data?.prize_name
      )) : -1;
      const targetIndex = foundIndex !== -1 ? foundIndex : Math.floor(Math.random() * count);

      runSpinAnimation(targetIndex, response?.data);
    } catch (_error) {
      showErrorToast("");
    }
  }, [count, mockSpin, prizes, refetchLuckySpin, runSpinAnimation, showErrorToast, spinType, spinning]);

  return (
    <div className="flex h-full flex-col items-center gap-4">
      <SmallLoading
        content={<div
          className={clsx(
            "w-full relative overflow-hidden transition-all duration-300 ease-in-out",
            changingType && "scale-95 opacity-80"
          )}
        >
          <img
            className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            src="/images/game_lucky_spin/coins.png"
            alt=""
          />

          <div className="relative z-2 flex flex-col gap-1">
            <div className="grid grid-cols-3 gap-1">
              {prizes.map((prize: Record<string, any>, index: number) => (
                <GridPrizeCard
                  key={`${prize.id ?? prize.record_id ?? prize.prize_name ?? prize.label}-${index}`}
                  prize={prize}
                  active={activePrizeIndex !== null && activePrizeIndex === index}
                  spinType={spinType}
                  showRewardBg={!spinning}
                />
              ))}
            </div>

            {showSpin
              ? (<ConfirmBox
                loading={spinning}
                onClick={() => {
                  if (unavailable) {
                    toast.info(unavailable);
                    return;
                  }
                  void handle();
                }}
                className={`${bg_colors[spinType]} border-none text-base-content`}
              >
                {mockSpin ? "Mock Spin" : unavailable || t("luckySpin:spin_now")}
              </ConfirmBox>)
              : (extraNode)
            }
          </div>
        </div>}
        loading={loading}
        className={"min-h-[309px] w-full animate-pulse !rounded-xl"}
      />

      <div className="relative z-4 w-full">
        <div className="h-12 hide-scrollbar overflow-x-auto overflow-y-hidden">
          <div className="flex min-w-max items-center gap-1">
            <InnerBonusItem
              icon={<HistoryIcon size={20} />}
              value={t("explore:recents")}
              onClick={() => void navigate({ to: "/lucky-spin/me" })}
            />
            {winRecords.map((data: Record<string, any>) => (
              <InnerBonusItem
                key={data?.record_id}
                extra={
                  <>
                    <img src={getPrizeImageUrl(data?.extra_data)} alt="" className="h-5 w-5" />
                    <InnerPrizeDisplay data={data?.extra_data} className="!font-semibold !text-base-content/50" />
                  </>
                }
                onClick={() => {
                  if (data?.extra_data?.prize_type === "free_spin") {
                    void navigate({ to: "/bonus", search: { view: undefined, tab: undefined } });
                  }
                  if (data?.extra_data?.prize_type === "buddy_balls") {
                    void navigate({ to: "/buddy-balls" });
                  }
                  if (data?.extra_data?.prize_type === "rakeback_booster") {
                    void navigate({ to: "/bonus", search: { view: undefined, tab: undefined } });
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;

export const bg_colors: Record<string, string> = {
  "normal": "bg-[#299c58]",
  "mega": "bg-[#df5ab4]"
};

const RewardResultBg = ({ active, show }: { active: boolean; show: boolean }) => {
  if (!active || !show) return null;

  return (
    <>
      <img
        src="/images/game_lucky_spin/coins.png"
        alt=""
        className="pointer-events-none absolute inset-0 z-0 w-full object-cover"
      />
      <img
        src="/images/game_lucky_spin/board.png"
        alt=""
        className="pointer-events-none absolute inset-x-0 bottom-1.5 z-0 w-full object-cover"
      />
    </>
  );
};

const GridPrizeCard = (
  {
    prize,
    active,
    spinType,
    showRewardBg
  }: {
    prize: Record<string, any>;
    active: boolean;
    spinType: string;
    showRewardBg: boolean;
  }) => {
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        "relative overflow-hidden flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-center transition-all duration-200",
        active
          ? bg_colors[spinType]
          : "bg-base-200/90"
      )}
    >
      <RewardResultBg active={active} show={showRewardBg} />
      {prize?.isSettlementCurrencyMatch && (
        <span className="italic absolute right-0 top-0 z-15 bg-info px-1 py-0.5 text-[10px] uppercase leading-none">
          {t("luckySpin:yourCurrency")}
        </span>
      )}
      <img
        src={prize.imageUrl}
        alt=""
        className={clsx(
          "relative z-10 object-contain",
          SPIN_CURRENCY.has(prize?.prize_type) ? "h-10 w-10" : "h-8.5 w-8.5",
          { "scale-[1.12]": active }
        )}
      />
      <p
        className={clsx("relative z-10 line-clamp-2 text-xs", active ? "text-base-content font-bold" : "text-base-content/40")}>
        {prize.label}
      </p>
    </div>
  );
};
