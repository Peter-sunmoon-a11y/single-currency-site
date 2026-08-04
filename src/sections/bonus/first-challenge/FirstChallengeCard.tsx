"use client";

import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useBonusSwitch } from "@/hooks/api/useAuth.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useFirstChallengeEligibility, useFirstChallengeTasks } from "@/query/firstChallenge";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { useBoundStore } from "@/store";
import clsx from "clsx";
import { ReactNode, useMemo } from "react";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import {
  CLAIMABLE_BONUS_ANCHOR_IDS,
  CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
} from "@/sections/bonus/shared/claimable-bonus-config";

export const FirstChallengeGuard = ({ children }: { children: ReactNode }) => {
  const { switchData } = useBonusSwitch();
  const { data: eligibility } = useFirstChallengeEligibility();

  const firstChallengeEnabled = switchData?.bonus_switch?.first_challenge !== 0;

  if (!firstChallengeEnabled) {
    return null;
  }

  if (!eligibility?.data?.eligible) {
    return null;
  }

  return <>{children}</>;
};

export function FirstChallengeCard() {
  const { t } = useTranslation("bonus");

  const { navigateCallback } = useNavigateGuard();

  const { data: tasksResponse } = useFirstChallengeTasks();

  const navigate = useAppNavigate();

  const openModal = useBoundStore((state) => state.openModal);

  const claimableCount = useMemo(() => {
    const tasks = tasksResponse?.data?.tasks ?? [];
    return tasks.filter((task: Record<string, any>) => task?.status === 2).length;
  }, [tasksResponse]);

  return (
    <FirstChallengeGuard>
      <div
        id={CLAIMABLE_BONUS_ANCHOR_IDS.firstChallenge}
        className={clsx(
          "relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2",
          CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
        )}
      >
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
        </div>

        <div className="flex items-center jusify-between gap-4">
          <div className="flex-1 flex items-center gap-1">
            <div className="text-sm text-base-content/50 font-normal">{t("bonus:claimable")}</div>
            <div className="flex-1 text-primary font-bold">
              {claimableCount}
            </div>
          </div>

          {/* 活动入口链接 */}
          <ConfirmBox
            className="btn-sm w-auto text-sm"
            onClick={() => navigateCallback(() =>
              void navigate({ to: "/first-challenge" }), true)}>
            {t("bonus:go")}
          </ConfirmBox>
        </div>
      </div>
    </FirstChallengeGuard>
  );
}

export default FirstChallengeCard;
