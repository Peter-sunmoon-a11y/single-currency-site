/**
 * Deposit 提款最小额度提示
 *
 * 使用发布订阅模式来唤起弹窗
 */

import { Modal } from "@/components/ui/Modal.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";

type DepositMinAmountModalProps = {
  open: boolean;
  onClose: () => void;
};

export const DepositMinAmountModal = ({ open, onClose }: DepositMinAmountModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('finance:min')}
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <p className="text-sm text-base-content/50">{t("finance:minDepositAmountDescription")}</p>
    </Modal>
  );
};

export default DepositMinAmountModal;
