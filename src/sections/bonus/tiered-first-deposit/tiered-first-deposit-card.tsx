"use client";

import { useClaimTieredFirstDepositMutation, useTieredFirstDepositSummary } from "@/hooks/api/useAuth.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useBoundStore } from "@/store";
import { Info } from "@/sections/bonus/components/Info.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import clsx from "clsx";
import { normalizeTieredFirstDepositSummary } from "@/sections/bonus";

export function TieredFirstDepositCard() {
  const { t } = useTranslation("bonus");
  const user = useBoundStore((state) => state.user);
  const openModal = useBoundStore((state) => state.openModal);
  const navigate = useAppNavigate();
  const { data } = useTieredFirstDepositSummary();
  const { mutate: claimTieredFirstDeposit, isPending } = useClaimTieredFirstDepositMutation();

  const summary = normalizeTieredFirstDepositSummary(data?.data);

  if (!user || !summary?.visible || summary.state === "hidden") {
    return null;
  }

  const handleAction = () => {
    if (summary.claimable) {
      claimTieredFirstDeposit();
      return;
    }

    void navigate({ to: "/finance", search: { tab: "deposit" } });
  };

  return (
    <div className="relative bg-base-100 rounded-lg p-4 overflow-hidden">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2 truncate">
          <img
            src="/images/bonus_deposit_tiered/logo.png"
            loading="lazy"
            decoding="async"
            className="h-8 w-8 object-contain"
            alt=""
          />
          <h2 className={clsx("truncate text-base font-bold uppercase")}>
            {t("tieredFirstDeposit.deposit_prompt.title")}
          </h2>
          <Info onClick={() => openModal("OPEN_TIERED_FIRST_DEPOSIT_INFO_MODAL")} />
        </div>

        {/* 活动入口链接 */}
        <ConfirmBox
          loading={isPending}
          className="btn-sm w-fit text-sm"
          onClick={handleAction}
          disabled={isPending}
        >
          {summary.claimable ? t("tieredFirstDeposit.claim") : t("tieredFirstDeposit.entry.go")}
        </ConfirmBox>
      </div>
    </div>
  );
}
