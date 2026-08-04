import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useActivateBoosterMutation, useBonusSwitch, useClaimBonus, useClaimBonusMutation } from "@/hooks/api/useAuth";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { Info } from "@/sections/bonus/components/Info.tsx";
import clsx from "clsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { CountdownTimer } from "@/sections/dollars/CountdownTimer.tsx";
import {
  CLAIMABLE_BONUS_ANCHOR_IDS,
  CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
} from "@/sections/bonus/shared/claimable-bonus-config";
import { useNavigateGuard } from "@/sections/casino/hero-banner/InnerComponents.tsx";
import { getRakebackClaimableSummary } from "@/sections/bonus/shared/rakeback-claimable";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal";
import { useToggle } from "@/hooks/useToggle";

export const BonusRakeback = () => {
  const { switchData } = useBonusSwitch();

  const rakebackBonusEnabled = switchData?.bonus_switch?.rakeback !== 0;

  if (!rakebackBonusEnabled) {
    return null;
  }

  return <BonusRakebackContent />;
};

export function BonusRakebackContent() {
  const { t } = useTranslation(["popup", "bonus", "toast"]);
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { data: baseConfig } = useBaseConfig();
  const { mutate: claimBonus, isPending: isClaimPending } = useClaimBonusMutation();
  const { mutate: activateBooster, isPending: isActivatePending } = useActivateBoosterMutation();
  const { navigateCallback } = useNavigateGuard();

  const { openModal } = useBoundStore();

  const user = useBoundStore((state) => state.user);
  const status = useBoundStore((state) => state.status);

  const [isClaimOpen, { setTrue: openClaimModal, setFalse: closeClaimModal }] = useToggle(false);

  // 查询是否有待领取的rakeback bonus
  const { data: claimData } = useClaimBonus("rakeback");

  const { amount: claimableAmount, currency } = getRakebackClaimableSummary(claimData);

  const minClaimAmount = parseFloat(baseConfig?.data?.bonus_config?.super_rakeback?.min_claim_amount || "1");

  const handle = (selectedCurrency: string) => {
    if (!selectedCurrency || isClaimPending) return;

    claimBonus(
      { item: "rakeback", currency: selectedCurrency },
      {
        onSuccess: (response) => {
          if (response.code === 0) {
            closeClaimModal();
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

  // Check if battery is active (battery_expire is a future Unix timestamp)
  const isBatteryActive = status?.battery_expire && new Date(status.battery_expire * 1000) > new Date();

  // Convert Unix timestamp to milliseconds for Countdown component
  const batteryExpireMs = status?.battery_expire ? status.battery_expire : 0;

  // 可领取状态
  const isClaimable = minClaimAmount <= Number(claimableAmount);

  return (
    <>
      <div
        id={CLAIMABLE_BONUS_ANCHOR_IDS.rakeback}
        className={clsx(
          "relative bg-base-100 rounded-lg px-4 py-4 overflow-hidden flex flex-col gap-2",
          CLAIMABLE_BONUS_SCROLL_MARGIN_TOP_CLASS
        )}
      >
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/images/bonus_rakeback/rakeback.png"
              loading="lazy"
              decoding="async"
              className="w-8 h-8 object-contain"
            />
            <h2 className={clsx("text-base font-bold uppercase")}>
              {t("bonus:super_rakeback")}
            </h2>
            {/* 活动信息提示 */}
            <Info
              onClick={(e) => {
                e.stopPropagation();
                openModal("OPEN_RAKEBACK_HELP_MODAL");
              }} />
          </div>
        </div>

        <div className="flex flex-col">
          <ConfirmBox
            loading={isActivatePending}
            onClick={() => activateBooster()}
            disabled={isActivatePending || (status?.battery ?? 0) <= 0}
            className={"btn-md text-sm"}
          >
            {isBatteryActive ? (
              <CountdownTimer className="text-sm !font-normal" expireTime={batteryExpireMs} />
            ) : (
              t("bonus:activate_booster")
            )}
            <img src="/images/bonus_rakeback/energy.png" className="w-5 h-5" />
            x&nbsp;{status?.battery ?? 0}
          </ConfirmBox>
        </div>

        <div className="flex items-center jusify-between gap-2">
          <div className="text-sm font-bold flex flex-col jusify-between flex-1">
            <div className="flex-1 flex items-center gap-1">
              <div className="text-sm text-base-content/50 font-normal">{t("bonus:claimable")}</div>
              <div className="flex-1 text-primary">
                {formatWithConversion(claimableAmount, currency, { showCode: false, compact: true }).formatted}
              </div>
            </div>
            <span
              className={`text-xs text-base-content/50 font-normal italic`}>
              {t("bonus:min_claim")}:{" "}{formatWithConversion(minClaimAmount, "USD", { showCode: false }).formatted}</span>
          </div>
          {user && <ConfirmBox
            loading={isClaimPending}
            className="btn-sm w-auto text-sm"
            onClick={openClaimModal}
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
      <BonusClaimModal
        open={isClaimOpen}
        bonus={String(claimableAmount)}
        isBonus
        loading={isClaimPending}
        onClose={closeClaimModal}
        onClick={handle}
      />
    </>
  );
}
