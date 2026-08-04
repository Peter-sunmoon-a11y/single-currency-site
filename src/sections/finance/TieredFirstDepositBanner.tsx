"use client";

import { useTieredFirstDepositSummary } from "@/hooks/api/useAuth.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { normalizeTieredFirstDepositSummary } from "@/sections/bonus/tiered-first-deposit";
import { Alert } from "@/components/icons/Alert.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

export const TieredFirstDepositBanner = () => {
  const { t } = useTranslation("bonus");
  const { data } = useTieredFirstDepositSummary();
  const summary = normalizeTieredFirstDepositSummary(data?.data);
  const user = useBoundStore((state) => state.user);
  const openModal = useBoundStore((state) => state.openModal);

  if (!user || !summary?.visible || summary.state === "hidden") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => openModal("OPEN_TIERED_FIRST_DEPOSIT_INFO_MODAL")}
      className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-lg bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_8%,var(--color-base-100))_0%,var(--color-base-200)_100%)] p-2 shadow-[0_8px_20px_rgba(0,0,0,0.14)]"
    >
      <div className="flex items-center gap-2">
        <img src="/images/bonus_deposit_tiered/logo.png" alt=""
             className="relative h-9 w-9 object-contain animate-gift-shake" />

        <div>
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-bold text-base-content">
              {t("tieredFirstDeposit.deposit_prompt.title")}
            </div>

            <Alert className={"w-4 h-4 text-base-content/50"} />
          </div>
          <TextBaseContent text={t("tieredFirstDeposit.subtitle")} className={'text-left'} />
        </div>
      </div>
    </button>
  );
};
