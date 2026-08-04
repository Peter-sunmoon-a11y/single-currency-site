"use client";

import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useFirstChallengeEligibility } from "@/query/firstChallenge";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useBoundStore } from "@/store";
import clsx from "clsx";
import { useMemo } from "react";

type FirstChallengeEligibility = {
  isEligible: boolean;
  isForbidden: boolean;
  branchEnabled: boolean;
  hasSeen: boolean;
  currentAmount: number;
  targetAmount: number;
  claimableAmount: number;
  claimedAmount: number;
  endAt: number | null;
  durationDays: number;
  canCollect: boolean;
  titleAmount: number;
};

const getData = (value: any) => value?.data?.data ?? value?.data ?? value ?? {};

const toNumber = (value: any, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const toBoolean = (value: any, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    if (["1", "true", "yes"].includes(value.toLowerCase())) return true;
    if (["0", "false", "no"].includes(value.toLowerCase())) return false;
  }
  return fallback;
};

function normalizeEligibility(response: any): FirstChallengeEligibility {
  const data = getData(response);
  return {
    isEligible: toBoolean(data.is_eligible ?? data.eligible ?? data.available, true),
    isForbidden: toBoolean(data.is_forbidden ?? data.forbidden, false),
    branchEnabled: toBoolean(data.branch_enabled ?? data.enabled ?? true, true),
    hasSeen: toBoolean(data.is_seen ?? data.has_seen ?? data.seen, false),
    currentAmount: toNumber(data.current_amount ?? data.progress_amount ?? data.collected_amount ?? data.current_progress),
    targetAmount: toNumber(data.target_amount ?? data.goal_amount ?? data.max_amount ?? data.total_amount, 10),
    claimableAmount: toNumber(data.claimable_amount ?? data.available_amount ?? data.pending_claim_amount),
    claimedAmount: toNumber(data.claimed_amount ?? data.total_claimed_amount),
    endAt: (() => {
      const raw = toNumber(data.end_at ?? data.end_time ?? data.expire_at ?? data.expires_at, 0);
      if (!raw) return null;
      return raw > 1e12 ? raw : raw * 1000;
    })(),
    durationDays: toNumber(data.duration_days ?? data.days ?? data.event_days, 7),
    canCollect: toBoolean(
      data.can_collect ?? data.can_claim_total ?? data.is_collectable,
      toNumber(data.current_amount ?? data.progress_amount) >= toNumber(data.target_amount ?? 10)
    ),
    titleAmount: toNumber(data.title_amount ?? data.hero_amount ?? data.reward_amount ?? data.max_amount, 10),
  };
}

export function FirstChallengeEntryCard() {
  const { t } = useTranslation("bonus");
  const { navigateCallback } = useNavigateGuard();
  const navigate = useAppNavigate();
  const openModal = useBoundStore((state) => state.openModal);
  const eligibilityQuery = useFirstChallengeEligibility();
  const eligibility = useMemo(() => normalizeEligibility(eligibilityQuery.data), [eligibilityQuery.data]);

  if (!eligibilityQuery.isLoading && (!eligibility.branchEnabled || eligibility.isForbidden || !eligibility.isEligible)) {
    return null;
  }

  return (
    <div className={clsx("relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2")}>
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/images/bonus_first_challenge/entry-icon.webp"
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain"
            alt=""
          />
          <h2 className={clsx("text-base font-bold uppercase truncate")}>
            {t("firstChallenge.entry.title")}
          </h2>
          <Info onClick={() => openModal("OPEN_FIRST_CHALLENGE_INFO_MODAL")} />
        </div>

        {/* 活动入口链接 */}
        <button
          className="btn btn-primary btn-sm text-sm"
          onClick={() => navigateCallback(() => {
            void navigate({ to: "/first-challenge" });
          }, true)}
        >
          {t("bonus:go")}
        </button>
      </div>
    </div>
  );
}

export default FirstChallengeEntryCard;
