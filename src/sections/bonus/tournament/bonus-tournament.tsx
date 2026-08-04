import { ReactNode } from "react";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { Info } from "@/sections/bonus/components/Info.tsx";
import clsx from "clsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { useIsLeagueEnabled } from "@/hooks/api/usePublic.ts";
import {
  CLAIMABLE_BONUS_ANCHOR_IDS,
  CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
} from "@/sections/bonus/shared/claimable-bonus-config";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";

export const BonusTournament = () => {
  return (
    <BonusTournamentGuard>
      {(props) => <BonusTournamentContent {...props} />}
    </BonusTournamentGuard>
  );
};

type BonusTournamentGuardValues = {
  claimableAmount: number;
  currency: string;
  isClaimable: boolean;
};

const BonusTournamentGuard = ({
  children
}: {
  children: (values: BonusTournamentGuardValues) => ReactNode;
}) => {
  const { isLeagueEnabled } = useIsLeagueEnabled();
  const { data: claimData } = useClaimBonus("tournament");

  if (!isLeagueEnabled) {
    return null;
  }

  const tournamentData = claimData?.data?.data;
  const claimableAmount = parseFloat(tournamentData?.value || "0") || 0;
  const currency = tournamentData?.currency || "USDT";
  const isClaimable = claimableAmount > 0;

  return children({ claimableAmount, currency, isClaimable });
};

export function BonusTournamentContent({
  claimableAmount,
  currency,
  isClaimable
}: BonusTournamentGuardValues) {
  const user = useBoundStore((state) => state.user);

  const { t } = useTranslation(["bonus", "tournament"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  const { openModal } = useBoundStore();
  const { navigateCallback } = useNavigateGuard();

  const handle = () => {
    claimBonus(
      { item: "tournament" },
      {
        onSuccess: (response) => {
          if (response.code === 0) {
            if (Number(response?.data?.don_record_id) > 0) {
              openModal("OPEN_DOUBLE_OR_NOTHING_MODAL", {
                don_record_id: response?.data?.don_record_id,
                amount: response?.data?.amount
              });
            }
          }
        }
      }
    );
  };

  return (
    <div
      id={CLAIMABLE_BONUS_ANCHOR_IDS.tournament}
      className={clsx(
        "relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2",
        CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
      )}
    >
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/images/bonus_tournament/cup.png"
            loading="lazy"
            decoding="async"
            className="w-8 h-8 object-contain"
          />
          <h2 className={clsx("text-base font-bold uppercase")}>
            {t("tournament:tournament_reward")}
          </h2>
          {/* 活动信息提示 */}
          <Info
            onClick={(e) => {
              e.stopPropagation();
              openModal("OPEN_TOURNAMENT_HELP_MODAL");
            }} />
        </div>
      </div>

      <div className="flex items-center jusify-between gap-4">
        <div className="text-sm font-bold flex flex-col jusify-between flex-1">
          <p className="flex gap-1 text-sm text-base-content/50 font-normal">
            {t("bonus:prize_pool")}
            <span
              className="text-primary font-bold">{formatWithConversion(100000, "USD", { showCode: false }).formatted}</span>
          </p>
          <div className="flex-1 flex items-center gap-1">
            <div className="text-sm text-base-content/50 font-normal">{t("bonus:claimable")}</div>
            <div className="flex-1 text-primary">
              {formatWithConversion(claimableAmount, currency, { showCode: false }).formatted}
            </div>
          </div>
        </div>
        {user && <ConfirmBox
          loading={isClaimPending}
          className="btn-sm w-auto text-sm"
          onClick={handle}
          disabled={!isClaimable || isClaimPending || claimableAmount <= 0}
        >
          {t("bonus:claim")}
        </ConfirmBox>}
        {!user && <ConfirmBox
          className="btn-sm w-auto text-sm"
          onClick={() => navigateCallback(() => null, true)}>
          {t("bonus:go")}
        </ConfirmBox>}
      </div>
    </div>
  );
}
