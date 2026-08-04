import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useCancelFreeSpinRecord } from "@/query/free-spins.tsx";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { useState } from "react";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export function FreeSpinModal(
  {
    isOpen,
    onClose,
    freeSpinData
  }: Record<string, any>) {

  const navigate = useAppNavigate();
  const { t } = useTranslation("popup");

  const [loading, setLoading] = useState(false);

  const cancelFreeSpinRecordMutation = useCancelFreeSpinRecord();

  const handle = () => {
    setLoading(true);
    cancelFreeSpinRecordMutation.mutate(freeSpinData?.id || "", {
      onSuccess: (data: any) => {
        if (data.code === 0) onClose();
      },
      onSettled: () => {
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      title={t("popup:freeSpins.freeSpins")}
      isOpen={isOpen}
      onClose={onClose}
      position="modal-middle"
    >
      {/* 顶部视觉区 */}
      <div className="relative flex flex-col items-center text-center">
        <img
          src="/images/free_spins/free-spins.png"
          alt="Free Spins"
          className="w-28 h-28 object-contain animate-gift-shake"
        />

        <div className="text-5xl font-extrabold leading-none text-primary tabular-nums">
          {freeSpinData?.bet_count || 0}
        </div>

        <TextBaseContent text={t("popup:freeSpins.freeSpins")} className="!text-lg mt-1 font-bold" />
        <TextBaseContent text={t("popup:freeSpins.a_special_reward_just_for_you")} className="my-1" />
      </div>

      {/* 底部操作区 */}
      <div className="flex gap-2 mt-3">
        <ConfirmBox onClick={() => {
          onClose();
          void navigate({ to: "/free-spin-game" });
        }} className="flex-1">
          {t("popup:freeSpins.continue")}
        </ConfirmBox>

        <ConfirmBox
          loading={loading}
          onClick={handle}
          className="btn-soft flex-1"
        >
          {t("popup:freeSpins.exit_anyway")}
        </ConfirmBox>
      </div>
    </Modal>
  );
}