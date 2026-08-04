/**
 * Deposit Fiat 订单确认窗口
 *
 * 使用发布订阅模式来唤起弹窗
 */

import { Modal } from "@/components/ui/Modal.tsx";
import { useBoundStore } from "@/store";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { emitter } from "@/store/emitter.ts";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export const DepositFiatViewModal = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }) => {
  const { t } = useTranslation();

  // from data store, share common data
  const { depositFiat } = useBoundStore();

  return (
    <Modal
      title={t("finance:newFiatDeposit")}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-1">
          <div className="flex justify-between text-sm">
            <div className={"text-base-content/50"}>{t("finance:depositAmount")}</div>
            <div className={"text-primary font-bold text-sm"}>
              {Number(depositFiat.formItem?.amount).toLocaleString()} {depositFiat.currency?.currency}
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <div className={"text-base-content/50"}>{t("finance:depositMethod")}</div>
            <div className={"text-primary font-bold text-sm truncate"}>
              {depositFiat.method?.display_name}
            </div>
          </div>
        </div>

        <ConfirmBox
          onClick={() => {
            onClose();
            emitter.emit("SYNC_DEPOSIT_FIAT_CREATE");
          }}
        >
          {t("finance:iUnderstand")}
        </ConfirmBox>
      </div>
    </Modal>
  );
};

export default DepositFiatViewModal;