import { ReactNode, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { useBonusSwitch, useClaimMondayBonusMutation, useGetMondayVipBonus } from "@/hooks/api/useAuth";
import { Decimal } from "decimal.js";
import { VIP_REQUIREMENTS } from "../shared/config";
import { VipButton } from "@/sections/bonus";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import clsx from "clsx";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import {
  CLAIMABLE_BONUS_ANCHOR_IDS,
  CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
} from "@/sections/bonus/shared/claimable-bonus-config";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal.tsx";

export const VipMonday = () => {
  return (
    <VipMondayGuard>
      {(props) => <VipMondayContent {...props} />}
    </VipMondayGuard>
  );
};

type VipMondayGuardValues = {
  mondayVipBonus: ReturnType<typeof useGetMondayVipBonus>["mondayVipBonus"];
  requiredVipLevel: number;
  isUnlocked: boolean;
  formattedCurrentWager: string;
  formattedMaxWager: string;
  showWagerProgress: boolean;
  showGoButton: boolean;
  showClaimOnMondayButton: boolean;
  showClaimButton: boolean;
  showWeekCountdown: boolean;
  showClaimCountdown: boolean;
  claimEndTime: number;
  weekEndTime: number;
};

const VipMondayGuard = ({
                          children
                        }: {
  children: (values: VipMondayGuardValues) => ReactNode;
}) => {
  const status = useBoundStore((state) => state.status);

  const { switchData } = useBonusSwitch();
  const { mondayVipBonus } = useGetMondayVipBonus();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  if (switchData?.bonus_switch?.monday_vip_bonus === 0) {
    return null;
  }

  const requiredVipLevel = VIP_REQUIREMENTS.vipMonday.requiredLevel;
  const isUnlocked = (status?.vip ?? 0) >= requiredVipLevel;

  const formattedCurrentWager = formatWithConversion(mondayVipBonus?.current_wager ?? 0, "USDT", {
    showSymbol: true,
    showCode: false
  }).formatted;

  const formattedMaxWager = formatWithConversion(mondayVipBonus?.max_wager ?? 0, "USDT", {
    showSymbol: true,
    showCode: false
  }).formatted;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const maxWager = new Decimal(mondayVipBonus?.max_wager ?? 0).toNumber();
  const currentWager = new Decimal(mondayVipBonus?.current_wager ?? 0).toNumber();
  const weekStartTime = mondayVipBonus?.week_start_time ?? 0;
  const weekEndTime = mondayVipBonus?.week_end_time ?? 0;
  const claimStartTime = mondayVipBonus?.claim_start_time ?? 0;
  const claimEndTime = mondayVipBonus?.claim_end_time ?? 0;

  const isVip2Plus = (status?.vip ?? 0) >= 2;
  const wagerReached = maxWager <= currentWager;
  const inWeekWindow = weekStartTime <= nowInSeconds && nowInSeconds <= weekEndTime;
  const inClaimWindow = claimStartTime <= nowInSeconds && nowInSeconds <= claimEndTime;

  const showWagerProgress = isVip2Plus && !wagerReached;
  const showGoButton = isVip2Plus && !wagerReached;
  const showClaimOnMondayButton = wagerReached && inWeekWindow && !inClaimWindow;
  const showClaimButton = wagerReached && inClaimWindow;
  const showWeekCountdown = isVip2Plus && inWeekWindow && !inClaimWindow;
  const showClaimCountdown = wagerReached && inClaimWindow;

  return children({
    mondayVipBonus,
    requiredVipLevel,
    isUnlocked,
    formattedCurrentWager,
    formattedMaxWager,
    showWagerProgress,
    showGoButton,
    showClaimOnMondayButton,
    showClaimButton,
    showWeekCountdown,
    showClaimCountdown,
    claimEndTime,
    weekEndTime
  });
};

const VipMondayContent = ({
                            mondayVipBonus,
                            requiredVipLevel,
                            isUnlocked,
                            formattedCurrentWager,
                            formattedMaxWager,
                            showWagerProgress,
                            showGoButton,
                            showClaimOnMondayButton,
                            showClaimButton,
                            showWeekCountdown,
                            showClaimCountdown,
                            claimEndTime,
                            weekEndTime
                          }: VipMondayGuardValues) => {
  const navigate = useAppNavigate();
  const openModal = useBoundStore((state) => state.openModal);

  const { t } = useTranslation(["bonus", "vipMonday"]);
  const { navigateCallback } = useNavigateGuard();
  const { refetch: refetchMondayVipBonus } = useGetMondayVipBonus();
  const { mutate: claimBonus, isPending } = useClaimMondayBonusMutation();

  const [collectOpen, setCollectOpen] = useState(false);

  return (
    <div
      id={CLAIMABLE_BONUS_ANCHOR_IDS.vipMonday}
      className={clsx(
        "relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2",
        CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
      )}
    >
      {showClaimCountdown && (<div className="absolute top-0 right-0 w-full h-4 flex items-center justify-end">
        <div
          className={"flex items-center gap-1 absolute top-0 right-0 bg-primary/15 text-primary text-sm leading-none"}>
          <CountdownTimer className={"font-normal"} expireTime={claimEndTime}
        />
        </div>
      </div>)}

      {showWeekCountdown && (<div className="absolute top-0 right-0 w-full h-4 flex items-center justify-end">
        <div
          className={"flex items-center gap-1 absolute top-0 right-0 bg-primary/15 text-primary text-sm leading-none"}>
          <CountdownTimer className={"font-normal"} expireTime={weekEndTime}
        />
        </div>
      </div>)}

      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <img
            src={"/images/bonus_monday/vip-monday.png"}
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain" />
          <h2 className={clsx("text-base font-bold uppercase truncate")}>
            {t("vipMonday:vip_monday")}
          </h2>
          {/* 活动信息提示 */}
          <Info
            onClick={(e) => {
              e.stopPropagation();
              openModal("OPEN_VIP_MONDAY_BONUS_MODAL");
            }} />
        </div>

        <div className="flex flex-col items-end justify-end self-stretch">
          {showGoButton && (
            <button
              className="btn btn-primary btn-sm text-sm"
              onClick={() => navigateCallback(() => {
                void navigate({ to: "/explore" });
              }, true)}
            >
              {t("bonus:go")}
            </button>
          )}

          {!isUnlocked && <VipButton requiredLevel={requiredVipLevel} />}

          {showClaimButton && (
            <button
              className="btn btn-primary btn-sm text-sm"
              onClick={() => setCollectOpen(true)}
            >
              {t("bonus:claim")}
            </button>
          )}
        </div>
      </div>

      {showWagerProgress && (
        <div className="text-sm text-base-content/60">
          <span className={""}>{t("bonus:progress")}{" "}</span>
          <span className="text-primary font-bold ">{formattedCurrentWager}</span>
          <span className="font-bold">/</span>
          <span className="font-bold">{formattedMaxWager}</span>
        </div>
      )}

      {showClaimOnMondayButton && (
        <button className="btn btn-primary btn-soft btn-sm text-sm" disabled>
          {t("vipMonday:claim_on_monday")}
        </button>
      )}

      <BonusClaimModal
        isBonus
        open={collectOpen}
        bonus={mondayVipBonus?.value ?? 0}
        loading={isPending}
        imageSrc="/images/bonus_store/coin.png"
        onClose={() => setCollectOpen(false)}
        onClick={(currency: string) => {
          claimBonus(
            { id: mondayVipBonus?.id, currency },
            {
              onSuccess: (response) => {
                if (response.code === 0) {
                  setCollectOpen(false);
                  void refetchMondayVipBonus();
                }
              }
            }
          );
        }}
      />
    </div>
  );
};
