import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { CheckCircle2 } from "lucide-react";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const WithdrawOkModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useAppNavigate();
  const { t } = useTranslation();


  return (
    <Modal
      isOpen={open}
      title={t("transaction:details.withdrawOrderCreated")}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center font-bold">
        <CheckCircle2 className="w-12 h-12 text-success" />
        <p className="text-sm font-extrabold text-primary">{t("transaction:details.withdrawProcessing")}</p>

        <div className="flex gap-2 w-full">
          <ConfirmBox onClick={onClose} className={"flex-1 btn-soft"}>{t("common:common.close")}</ConfirmBox>
          <ConfirmBox onClick={() => {
            onClose();
            void navigate({ to: "/transactions/withdraw" });
          }} className={"flex-1"}>{t("common:common.history")}</ConfirmBox>
        </div>
      </div>
    </Modal>
  );
};

export default WithdrawOkModal;