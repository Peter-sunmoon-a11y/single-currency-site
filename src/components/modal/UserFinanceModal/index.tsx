import { Modal } from "@/components/ui/Modal.tsx";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Deposit as UserDeposit } from "./Deposit";
import type { TabItemsType } from "@/store/type";

type UserFinanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabItemsType;
};

export const UserFinanceModal = ({ isOpen, onClose }: UserFinanceModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('common.deposit')}
      position={"modal-bottom"}
      className="!min-h-[75dvh]"
    >
      {/*移动端*/}
      <UserDeposit isModal />
    </Modal>
  );
};
