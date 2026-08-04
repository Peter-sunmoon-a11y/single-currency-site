/**
 * Withdraw 提款最小额度提示
 *
 * 使用发布订阅模式来唤起弹窗
 */

import { Modal } from "@/components/ui/Modal.tsx";
import { useToggle } from "@/hooks/useToggle";
import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";

export const WithdrawMinAmountModal = (
  {
    open,
    onClose
  }: {
    open: boolean;
    onClose: () => void;
  }
) => {
  const { t } = useTranslation();

  const [status, { set }] = useToggle<boolean>(false);

  useEffect(() => {
    if (typeof open === "boolean") set(open);
  }, [open, set]);

  return (
    <Modal
      title={t('finance:min')}
      isOpen={status}
      onClose={() => {
        set(false);
        onClose();
      }}
      position="modal-middle"
    >
      <p className="text-sm text-base-content/50">{t("finance:minimumWithdrawalAmountTooltip")}</p>
    </Modal>
  );
};

export default WithdrawMinAmountModal;
