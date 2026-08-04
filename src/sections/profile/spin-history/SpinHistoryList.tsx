import { useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { cn } from "@/utils/cn";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { formatDateTime } from "@/utils/formatDateTime";
import type { StatusClassMap } from "./types";
import { FreeSpinStatus, IFreeSpinBonus, resolveFreeSpinStatus } from "@/types/freeSpins";
import { useCancelFreeSpinRecord } from "@/query/free-spins";
import { DataLoading } from "@/components/standard/DataLoading.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Code2 } from "lucide-react";

interface SpinHistoryListProps {
  rows: any[];
  isLoading?: boolean;
  isFetching?: boolean;
  isEmpty?: boolean;
  statusClass: StatusClassMap;
  formatStatus: (status?: number) => string;
}

export const SpinHistoryList = ({
                                  rows,
                                  isLoading,
                                  isEmpty,
                                  statusClass,
                                  formatStatus
                                }: SpinHistoryListProps) => {
  const { t } = useTranslation(["profile", "luckySpin"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const cancelFreeSpinRecord = useCancelFreeSpinRecord();
  const [cancelTarget, setCancelTarget] = useState<IFreeSpinBonus | null>(null);

  const renderRowData = (item: any) => {
    const status = resolveFreeSpinStatus(item);
    const totalSpins = Number(item?.bet_count ?? 0);
    const usedSpins = Number(item?.current_bet_count ?? 0);
    const remainingSpins =
      item?.remaining_bets != null ? Number(item.remaining_bets) : Math.max(0, totalSpins - usedSpins);

    const currentTurnover = parseFloat(item?.current_turnover_limit_usdt ?? "0");
    const turnoverTotal = parseFloat(item?.turnover_limit_usdt ?? item?.max_win_limit ?? "0");
    const progressPercent = turnoverTotal > 0 ? Math.min((currentTurnover / turnoverTotal) * 100, 100) : 0;

    const maxWin = parseFloat(item?.win_amount ?? item?.win_bucks_amount ?? "0");
    const maxWinFormatted = formatWithConversion(maxWin, item?.currency || "USDT", {
      showSymbol: true,
      showCode: false
    }).formatted;

    const turnoverCurrency = "USDT";

    const formattedTurnoverTotal = formatWithConversion(turnoverTotal, turnoverCurrency, {
      showSymbol: true,
      showCode: false
    }).formatted;

    const formattedTurnoverCurrent = formatWithConversion(currentTurnover, turnoverCurrency, {
      showSymbol: true,
      showCode: false
    }).formatted;

    const turnoverDisplay =
      status === FreeSpinStatus.NOT_STARTED || turnoverTotal <= 0
        ? formattedTurnoverTotal
        : `${formattedTurnoverCurrent} / ${formattedTurnoverTotal}`;

    const showProgress =
      status === FreeSpinStatus.NOT_STARTED || status === FreeSpinStatus.ONGOING || status === FreeSpinStatus.CLAIM;

    return {
      status,
      totalSpins,
      remainingSpins,
      progressPercent,
      maxWinFormatted,
      turnoverDisplay,
      showProgress
    };
  };

  if (isLoading || isEmpty) {
    return (
      <div className="relative min-h-[125px]">
        {isLoading && <DataLoading />}
        {isEmpty && !isLoading && <NothingFound />}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1 bg-base-200 p-2 rounded-lg">
        {rows.map((item: any, index: number) => {
          const {
            status,
            maxWinFormatted,
            turnoverDisplay,
            showProgress
          } = renderRowData(item);

          return (
            <div
              key={item?.id ?? item?.free_spin_code ?? index}
              className="rounded-lg bg-base-300 p-2 flex flex-col gap-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <p className="flex items-center gap-1 font-bold text-base-content text-sm">
                    <Code2 size={20} />{item?.free_spin_code || item?.template_key || `#${item?.id ?? "-"}`}
                  </p>
                </div>
                <div className={cn("text-sm italic", statusClass[status] || "text-base-content/50")}>
                  {formatStatus(status)}
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm text-base-content/50">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-base-content/50">{t("luckySpin:bonusWins", "Bonus Wins")}</span>
                  <span className="text-primary font-bold">{maxWinFormatted}</span>
                </div>
                {showProgress ? (
                  <div className="flex items-center justify-between text-sm text-base-content/50 font-semibold">
                    <span>{t("transaction:rollover.wagerRequirement", "Wager Requirement")}</span>
                    <span className={'font-bold text-primary'}>{turnoverDisplay}</span>
                  </div>
                ) : status === FreeSpinStatus.CLAIMED ? (
                  <div className="flex items-center justify-between text-sm text-base-content/50 font-semibold">
                    <span>{t("bonus:claimed", "Claimed")}</span>
                    <span>{item?.updated_at ? formatDateTime(item.updated_at * 1000, "YYYY/MM/DD HH:mm") : "--"}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm text-base-content/50 font-semibold">
                    <span>{t("bonus:expires", "Expires")}</span>
                    <span>{item?.expired_at ? formatDateTime(item.expired_at * 1000, "YYYY/MM/DD HH:mm") : "--"}</span>
                  </div>
                )}
              </div>

              {(status === FreeSpinStatus.NOT_STARTED || status === FreeSpinStatus.ONGOING) && (
                <button
                  className="btn btn-soft btn-sm btn-primary"
                  onClick={() => setCancelTarget(item as IFreeSpinBonus)}
                  aria-label={t("profile:cancel_free_spins")}
                >
                  {t("profile:cancel_free_spins")}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title={t("transaction:bonusRewards.are_you_sure", "Are you sure?")}
        position="modal-middle"
      >
        <p className="text-sm text-base-content/70">
          {t("transaction:bonusRewards.you_will_lose_your", "You will lose your")}{" "}
          <span className="text-primary font-semibold">
            {formatWithConversion(cancelTarget?.win_amount || 0, cancelTarget?.currency || "", { showCode: false }).formatted}
          </span>
          {" "}
          {t("transaction:bonusRewards.in_unclaimed_rewards", "in unclaimed rewards")}
        </p>
        <div className="flex gap-2 mt-4">
          <button className="btn btn-primary flex-1" onClick={() => setCancelTarget(null)}>
            {t("transaction:bonusRewards.go_back", "Go back")}
          </button>
          <ConfirmBox
            loading={cancelFreeSpinRecord.isPending}
            className="btn btn-primary btn-soft flex-1"
            onClick={() => {
              if (!cancelTarget?.id) return;
              cancelFreeSpinRecord.mutate(String(cancelTarget.id), {
                onSuccess: () => setCancelTarget(null),
                onError: () => setCancelTarget(null)
              });
            }}
            disabled={cancelFreeSpinRecord.isPending}
          >
            {t("transaction:bonusRewards.cancel_anyway", "Cancel anyway")}
          </ConfirmBox>
        </div>
      </Modal>
    </>
  );
};
