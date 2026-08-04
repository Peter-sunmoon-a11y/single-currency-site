import { useReferralRewards } from "@/hooks/useReferralRewards";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { useClaimBonusMutation } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import { BonusClaimModal } from "@/sections/dollars/bonus-claim-modal";
import { useToggle } from "@/hooks/useToggle";

export const InnerReferralRewards = () => {
  const { t } = useTranslation("referral");

  const openModal = useBoundStore((state) => state.openModal);

  const {
    isLoading,
    referralValue,
    lockedReferral,
    availableReferral,
    totalReceivedReferral,
    refetchreferralData
  } = useReferralRewards();

  const { mutate: claimBonus, isPending } = useClaimBonusMutation();
  const [isClaimOpen, { setTrue: openClaimModal, setFalse: closeClaimModal }] = useToggle(false);

  const handleClaimConfirm = (selectedCurrency: string) => {
    if (!selectedCurrency || isPending) return;

    claimBonus(
      { item: "referral", currency: selectedCurrency },
      {
        onSuccess: (response) => {
          if (response.code === 0) {
            closeClaimModal();
            void refetchreferralData();
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
    <div className="p-4 rounded-lg bg-base-200 flex justify-between">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold text-base-content">
            {t("common:common.referral")}{" "}{t("bonus:rewards")}
          </h3>
          <h1 className="text-primary text-2xl font-bold">
            {availableReferral.formatted}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-end">
        <ConfirmBox
          className="w-auto btn-sm text-sm"
          loading={isPending}
          disabled={availableReferral?.value === 0 || isLoading || isPending}
          onClick={openClaimModal}
        >
          {t("bonus:claim")}
        </ConfirmBox>
        <div className={'text-right'}>
          <p className="text-base-content/50 text-xs">
            <span className={"pr-1"}>{t("referral:totalReceived")}</span>
            <span className={"font-bold text-primary"}>{totalReceivedReferral.formatted}</span>
          </p>
          <p className="text-base-content/50 text-xs mt-1">
            <span className={"pr-1"}>{t("finance:locked")}</span>
            <span className={"font-bold text-primary"}>{lockedReferral.formatted}</span>
          </p>
        </div>
      </div>
      <BonusClaimModal
        open={isClaimOpen}
        bonus={String(referralValue?.value ?? 0)}
        isBonus
        loading={isPending}
        onClose={closeClaimModal}
        onClick={handleClaimConfirm}
      />
    </div>
  );
};
