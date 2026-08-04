import { useTranslation } from "@/lib/i18n/react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { Suspense, lazy } from "react";

const MessageV2 = lazy(() => import("@/components/header/message-v2/index.tsx"));

type InternalMessageModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function InternalMessageModal({ open, onClose }: InternalMessageModalProps) {
  const { t } = useTranslation("chat");

  return (
    <Modal
      title={t("chat:notifications")}
      isOpen={open}
      onClose={onClose}
      position="modal-bottom"
      style={{ minHeight: "75dvh" }}
    >
      <Suspense
        fallback={
          <div className="min-h-40 flex flex-col items-center justify-center">
            <div className="loading loading-spinner loading-xs" />
          </div>
        }
      >
        <MessageV2 status={open} onClose={onClose} />
      </Suspense>
    </Modal>
  );
}
