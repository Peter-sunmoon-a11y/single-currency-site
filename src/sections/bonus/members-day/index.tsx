import { ReactNode, useState } from "react";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal";
import { useBonusSwitch, useClaimMembersDayMutation, useMembersDayStatus } from "@/hooks/api/useAuth";
import { useMembersDayConfig } from "@/hooks/api/usePublic";
import {
  CLAIMABLE_BONUS_ANCHOR_IDS,
  CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
} from "@/sections/bonus/shared/claimable-bonus-config";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import Iconify from "@/components/iconify";
import { MysteryBox } from "@/sections/bonus/mystery-box/mystery-box.tsx";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const MembersDay = () => {
  const { data: configResponse } = useMembersDayConfig();

  const shouldShowMembersDay = configResponse?.data?.enabled ?? false;

  return (
    shouldShowMembersDay
      ? <MembersDayGuard>{(props) => <MembersDayContent {...props} />}</MembersDayGuard>
      : <MysteryBox />
  );
};

type MembersDayGuardValues = {
  requiredVipLevel: number;
  isUnlocked: boolean;
  claimableAmountUsdt: number;
  claimedThisMonth: boolean;
  claimEndTime: number;
  showClaimCountdown: boolean;
  isFreeSpinBonus: boolean;
  hasMembersDay: boolean;
};

const MembersDayGuard = ({
                           children
                         }: {
  children: (values: MembersDayGuardValues) => ReactNode;
}) => {
  const { switchData } = useBonusSwitch();
  const { data: configResponse } = useMembersDayConfig();
  const { data: statusResponse } = useMembersDayStatus();

  const status = useBoundStore((state) => state.status);
  const config = configResponse?.data ?? {};
  const enabledByConfig = configResponse?.data?.enabled ?? false;
  const membersDayStatus = statusResponse?.data ?? {};

  if (switchData?.bonus_switch?.members_day === 0 || !enabledByConfig) {
    return null;
  }

  const requiredVipLevel = toNumber(config?.min_vip ?? 0);
  const isUnlocked = (status?.vip ?? 0) >= requiredVipLevel;
  const claimableAmountUsdt = toNumber(membersDayStatus?.value ?? 0);
  const claimedThisMonth = Boolean(membersDayStatus?.claimed_this_month);
  const claimEndTime = toNumber(membersDayStatus?.claim_end_time);
  const hasMembersDay = membersDayStatus?.has_members_day;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const showClaimCountdown = claimEndTime > nowInSeconds;
  const isFreeSpinBonus = membersDayStatus?.is_free_spin;

  return children({
    isUnlocked,
    claimEndTime,
    hasMembersDay,
    isFreeSpinBonus,
    claimedThisMonth,
    requiredVipLevel,
    showClaimCountdown,
    claimableAmountUsdt
  });
};

const MembersDayContent = (
  {
    requiredVipLevel,
    isUnlocked,
    claimableAmountUsdt,
    claimedThisMonth,
    claimEndTime,
    showClaimCountdown,
    isFreeSpinBonus,
    hasMembersDay
  }: MembersDayGuardValues) => {
  const openModal = useBoundStore((state) => state.openModal);
  const user = useBoundStore((state) => state.user);
  const { t } = useTranslation(["bonus", "vipMonday"]);
  const { mutate: claimMembersDay, isPending: isClaiming } = useClaimMembersDayMutation();

  const [bonusModalOpen, setBonusModalOpen] = useState(false);

  const handleAction = () => {
    if (!user || !isUnlocked || claimedThisMonth) return;

    // 2种奖励: 2-FreeSpin奖励
    if (isFreeSpinBonus) {
      claimMembersDay(
        { currency: user?.currency ?? "USDT" },
        {
          onSettled: () => setBonusModalOpen(false)
        }
      );
    } else {
      // 2种奖励: 1-代币奖励
      setBonusModalOpen(true);
      return;
    }
  };

  const renderActionButton = (): ReactNode => {
    if (!isUnlocked) {
      return (
        <ConfirmBox disabled className="btn-sm w-fit text-sm">
          <Iconify icon="custom:lock" size={14} />
          {requiredVipLevel}
        </ConfirmBox>
      );
    }

    if (claimedThisMonth) {
      return <ConfirmBox className="btn-sm w-fit text-sm" disabled>{t("bonus:claimed")}</ConfirmBox>;
    }

    if (hasMembersDay) {
      return (
        <ConfirmBox onClick={handleAction} loading={isClaiming} className="btn-sm w-fit text-sm">
          {t("bonus:claim")}
        </ConfirmBox>
      );
    }

    return null
  };

  return (
    <>
      <div
        id={CLAIMABLE_BONUS_ANCHOR_IDS.membersDay}
        className={clsx(
          "relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2",
          CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
        )}
      >
        {showClaimCountdown && (
          <div className="absolute top-0 right-0 w-full h-4 flex items-center justify-end">
            <div
              className="flex items-center gap-1 absolute top-0 right-0 bg-primary/15 text-primary text-sm leading-none">
              <CountdownTimer className="font-normal" expireTime={claimEndTime} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/images/bonus_monday/members-day.png"
              loading="lazy"
              decoding="async"
              className="w-8 h-8 object-contain"
              alt=""
            />
            <h2 className={clsx("text-base font-bold uppercase truncate")}>
              {t("vipMonday:members_day")}
            </h2>
            <Info onClick={() => openModal("OPEN_MEMBERS_DAY_HELP_MODAL")} />
          </div>
          {renderActionButton()}
        </div>

      </div>

      {/*2种奖励: 1-代币奖励*/}
      <BonusClaimModal
        open={bonusModalOpen}
        bonus={String(claimableAmountUsdt)}
        loading={isClaiming}
        onClose={() => setBonusModalOpen(false)}
        onClick={(currency) => {
          if (!currency) return;

          claimMembersDay(
            { currency },
            {
              onSettled: () => setBonusModalOpen(false)
            }
          );
        }}
      />
    </>
  );
};
