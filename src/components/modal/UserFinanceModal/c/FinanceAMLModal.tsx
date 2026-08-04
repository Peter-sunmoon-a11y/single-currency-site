import { Modal } from "@/components/ui/Modal.tsx";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { Service } from "@/components/icons/Service.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate";

export const FinanceAMLModal = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {

  const navigate = useAppNavigate();
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={open}
      title=""
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center">
        <img src="/images/finance/warning.png" className="h-25" alt="" />
        <div className="flex flex-col gap-4 items-center">
          <p className="text-xl font-bold">{t("transaction:transactionStatus.failed")}</p>
          <p className="text-base-content/50 text-base text-center">
            <Trans i18nKey="transaction:assistance" />
          </p>
        </div>

        <div className="flex gap-2 items-center w-full">
          <button className={"btn btn-primary btn-soft"}
                  onClick={onClose}>{t("common:common.back")}</button>
          <button className={"flex-1 btn btn-primary"} onClick={() => {
            onClose();
            void navigate({ to: "/customer-service" });
          }}><Service width={18} />{t("chat:customerService")}</button>
        </div>
      </div>
    </Modal>
  );
};

export default FinanceAMLModal;
