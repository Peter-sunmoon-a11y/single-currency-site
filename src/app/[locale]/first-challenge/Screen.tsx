"use client";

import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { requireAuth } from "@/lib/auth-guards";
import { useTranslation } from "@/lib/i18n/react-i18next";
import {
  useFirstChallengeClaim, useFirstChallengeCollect,
  useFirstChallengeEligibility,
  useFirstChallengeMarkSeen,
  useFirstChallengeTasks
} from "@/query/firstChallenge";
import { Calendar, Lock } from "lucide-react";
import { InnerSlogan } from "@/standard/modals/DemoLazyInfoModal.tsx";
import clsx from "clsx";
import { Decimal } from "decimal.js";
import { InnerProgress } from "@/sections/dollars/components.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
import { formatDateTime } from "@/utils/formatDateTime";
import { TASK_ARROW_ACTIONS, TaskItem, TaskType } from "@/sections/first-challenge/components.tsx";
import { useEffect, useRef, useState } from "react";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal.tsx";
import { useBoundStore } from "@/store";

export default function FirstChallengeScreen() {
  const navigate = useAppNavigate();
  const markSeen = useFirstChallengeMarkSeen();

  const user = useBoundStore((state) => state.user);

  const markedSeenRef = useRef(false);

  const claimingTaskIdsRef = useRef<Set<string>>(new Set());

  const { t } = useTranslation("firstChallenge");
  const { data: tasks } = useFirstChallengeTasks();
  const { data: eligibility } = useFirstChallengeEligibility();
  const { mutate: claimMutation } = useFirstChallengeClaim();
  const { mutate: collectMutation, isPending } = useFirstChallengeCollect();
  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const [collectOpen, setCollectOpen] = useState(false);
  const [claimingTaskIds, setClaimingTaskIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (markedSeenRef.current) return;
    if (!user || !eligibility?.data?.eligible || (tasks?.data?.tasks ?? []).length === 0) return;

    markedSeenRef.current = true;
    markSeen.mutate();
  }, [eligibility, markSeen, tasks, user]);

  const onTask = async (task: Record<string, any>) => {
    const route = TASK_ARROW_ACTIONS[task.task_type as TaskType];

    if (route?.kind === "navigate") {
      void navigate({ to: route?.to, search: route?.search });
      return;
    }

    void navigate({ to: "/bonus" });
  };

  const onClaim = (task: Record<string, any>) => {
    if (claimingTaskIdsRef.current.has(task.id)) {
      return;
    }

    const nextClaimingTaskIds = new Set(claimingTaskIdsRef.current).add(task.id);
    claimingTaskIdsRef.current = nextClaimingTaskIds;
    setClaimingTaskIds(nextClaimingTaskIds);

    claimMutation(task.id, {
      onError: () => {
      },
      onSettled: () => {
        const nextClaiming = new Set(claimingTaskIdsRef.current);
        nextClaiming.delete(task.id);
        claimingTaskIdsRef.current = nextClaiming;
        setClaimingTaskIds(nextClaiming);
      }
    });
  };

  const progressPercent = ((eligibility?.data?.challenge?.pool_usdt ?? 0) / (eligibility?.data?.challenge?.total_reward_usdt ?? 1)) * 100;

  const isClaimable = Decimal(eligibility?.data?.challenge?.pool_usdt ?? 0)
    .gte(eligibility?.data?.branch_config?.min_collect_usdt ?? 0);

  const claimedReward = Decimal(tasks?.data?.summary?.claimed_usdt ?? tasks?.data?.challenge?.claimed_usdt ?? 0)
    .gte(tasks?.data?.summary?.visible_total_reward_usdt ?? tasks?.data?.challenge?.total_reward_usdt ?? 0);

  const isPoolEmpty = Decimal(tasks?.data?.summary?.pool_usdt ?? tasks?.data?.challenge?.pool_usdt ?? 0)
    .lte(0);

  const isClaimed = claimedReward && isPoolEmpty;

  const isCollecting = !isClaimable && !isClaimed;

  const bonusAmount = formatWithConversion(eligibility?.data?.challenge?.total_reward_usdt ?? 0, "USDT", {
    showCode: false,
    showSymbol: true
  }).formatted;

  return (
    <div className="p-4 flex flex-col gap-4">
      <InnerSlogan
        title={<div className="flex flex-col justify-center gap-1">
          <>
            <div className="w-full">
              <p className="whitespace-pre-line">{t("firstChallenge.title")}</p>
            </div>
            <p className="text-3xl text-primary">
              {bonusAmount}
            </p>
          </>
        </div>}
        picture="/images/bonus_first_challenge/entry-icon.webp"
      />

      <div className="flex flex-col">
        <div className={"flex flex-col gap-2"}>
          <div
            className={clsx("flex items-center justify-between text-base-content/60 text-base")}>
            <span className={"text-sm font-normal"}>{t("firstChallenge.progress_label")}</span>
            <div className={"flex items-center justify-end font-bold"}>
              {formatWithConversion(eligibility?.data?.challenge?.pool_usdt, "USDT", {
                showCode: false,
                showSymbol: true
              }).formatted}
              {" "}/{" "}
              {formatWithConversion(eligibility?.data?.branch_config?.min_collect_usdt, "USDT", {
                showCode: false,
                showSymbol: true
              }).formatted}
            </div>
          </div>

          <InnerProgress
            className={clsx("progress progress-primary w-full")}
            value={progressPercent}
            max={100}
          />
        </div>

        {isClaimable && (
          <ConfirmBox
            className={"mt-4"}
            loading={isPending}
            onClick={() => setCollectOpen(true)}>
            {t("firstChallenge.button.claim")}
          </ConfirmBox>
        )}

        {isClaimed && (
          <ConfirmBox
            className={"mt-4"}
            disabled>
            {t("firstChallenge.button.claimed")}
          </ConfirmBox>
        )}

        {isCollecting && (
          <ConfirmBox
            className={"mt-4"}
            disabled>
            <Lock className="w-4 h-4" />
            {t("firstChallenge.button.collecting")}
          </ConfirmBox>
        )}

        <div className={"mt-4 flex items-center gap-1 text-sm justify-center text-base-content/60"}>
          {t("bonus:bonus_ends_in")}:{" "}<CountdownTimer
          expireTime={eligibility?.data?.challenge?.expires_at ?? 0} />
        </div>

        <div
          className={"mt-4 text-center underline text-sm text-base-content/60"}
          onClick={() => void navigate({ to: "/first-challenge/history" })}>
          1. {t("common:common.history")}
        </div>
        <div
          className={"mt-2 text-center underline text-sm text-base-content/60"}
          onClick={() => void navigate({ to: "/first-challenge/qa" })}>
          2. {t("bonus:frequently_asked")}
        </div>
      </div>

      <div className="p-2 bg-base-100 gap-2 flex flex-col">
        <div className="flex items-center gap-1 font-bold">
          <Calendar size={16} className={""} />
          {
            eligibility?.data?.challenge?.expires_at
              ? formatDateTime(new Date().getTime(), "DD MMM YYYY")
              : t("firstChallenge.tabs.in_progress")
          }
        </div>
        {((tasks?.data?.tasks ?? []).map((task: Record<string, any>) => (
          <TaskItem
            key={task.id}
            task={task}
            onTask={onTask}
            onClaim={onClaim}
            loading={claimingTaskIds.has(task.id)}
          />
        )))}
      </div>

      <BonusClaimModal
        open={collectOpen}
        bonus={tasks?.data?.summary?.pool_usdt ?? tasks?.data?.challenge?.pool_usdt}
        loading={isPending}
        imageSrc="/images/bonus_store/coin.png"
        onClose={() => setCollectOpen(false)}
        onClick={(currency) => {
          collectMutation(currency, {
            onSuccess: (result) => {
              if (result?.code === 0) setCollectOpen(false);
            }
          });
        }}
      />
    </div>
  );
}

export const beforeLoad = requireAuth;
