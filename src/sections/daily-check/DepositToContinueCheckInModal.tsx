import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { useAppNavigate } from "@/hooks/useAppNavigate.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

type DepositToContinueCheckInModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function DepositToContinueCheckInModal(
  {
    open,
    onClose
  }: DepositToContinueCheckInModalProps) {
  const navigate = useAppNavigate();
  const { t } = useTranslation(["buddyBalls", "bonus"]);

  return (
    <Modal
      title=""
      isOpen={open}
      onClose={onClose}
      position="modal-middle"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <img
          src="/images/daily_check/warning.png"
          alt=""
          className="h-25 w-25 object-contain"
        />

        <div className="space-y-4">
          <h2 className="text-base font-bold">
            {t("buddyBalls:deposit_to_continue_check_in_title")}
          </h2>

          <TextBaseContent text={t("buddyBalls:deposit_to_continue_check_in_desc")} />
        </div>

        <ConfirmBox
          onClick={() => {
            onClose();
            void navigate({ to: "/finance/deposit" });
          }}
        >
          {t("bonus:deposit_now")}
        </ConfirmBox>
      </div>
    </Modal>
  );
}
