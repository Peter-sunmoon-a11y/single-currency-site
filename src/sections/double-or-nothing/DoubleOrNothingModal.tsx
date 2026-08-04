import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { donDeal } from "@/services/auth/promo";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useBoundStore } from "@/store";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export interface DoubleOrNothingModalProps {
  open: boolean;
  onClose: () => void;
  modalData?: {
    don_record_id: string;
    amount: string;
  };
}

export const DoubleOrNothingModal = ({ open, onClose, modalData }: DoubleOrNothingModalProps) => {
  const { formatWithConversion } = useDisplayCurrencyFormatter();
  const { t } = useTranslation("doubleOrNothing");
  const [isLoading, setIsLoading] = useState(false);

  const openModal = useBoundStore((state) => state.openModal);

  const handle = async () => {
    if (!modalData?.don_record_id) return;

    setIsLoading(true);
    try {
      const res = await donDeal(modalData.don_record_id);
      if (res.code === 0) {
        if (res.data?.is_win) {
          openModal("OPEN_DOUBLED_UP_MODAL", res.data);
        } else {
          openModal("OPEN_NOTHING_MODAL", { don_record_id: modalData.don_record_id });
        }
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title={""}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <div className="font-bold text-base-content text-5xl">
            0x
          </div>
          <img src="/images/double_nothing/rocket.png" alt="rocket" className="w-36 animate-coin-pulse" />
          <div className="font-bold text-base-content text-5xl">
            2x
          </div>
        </div>

        <div className="text-primary text-4xl font-bold text-center">
          {formatWithConversion(modalData?.amount ?? 0, "BUCK", {
            showSymbol: true,
            showCode: false
          }).formatted}
        </div>

        <p className="text-base-content text-sm font-bold text-center whitespace-pre-line">
          <Trans i18nKey={"doubleOrNothing:double_or_nothing_description"}
                 components={[<span className={"text-primary"} />]} />
        </p>

        <div className="flex gap-2">
          <button className="btn btn-primary btn-soft flex-1" onClick={onClose}>
            {t("doubleOrNothing:no_thanks")}
          </button>
          <ConfirmBox
            loading={isLoading}
            className="flex-1"
            disabled={isLoading}
            onClick={handle}
          >
            {t("doubleOrNothing:double_or_nothing")}
          </ConfirmBox>
        </div>
      </div>
    </Modal>
  );
};

export default DoubleOrNothingModal;

