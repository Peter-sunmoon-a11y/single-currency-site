import { Modal } from "../ui/Modal";
import { Bell } from "lucide-react";
import { recordDismiss, requestWebPushSubscribe } from "@/hooks/useWebPush";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";

const BULLET_KEYS = [
  ["webpush:prompt.bullet_bonus"],
  ["webpush:prompt.bullet_deposit"],
  ["webpush:prompt.bullet_promo"]
] as const;

export function NotificationPromptModal({ isOpen, onClose }: Record<string, any>) {
  const { t } = useTranslation("webpush");

  return (
    <Modal
      hideTitle
      isOpen={isOpen}
      onClose={onClose}
      outsideClose={false}
      position="modal-middle"
    >
      <div className="flex flex-col gap-4 items-center text-center pt-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Bell className="w-6 h-6 text-primary animate-bell-shake" />
        </div>

        <h3 className="text-lg font-bold">
          {t("webpush:prompt.title")}
        </h3>
        <p className="text-sm text-base-content/50">
          {t("webpush:prompt.subtitle")}
        </p>

        <ul className="flex flex-col gap-2 self-stretch">
          {BULLET_KEYS.map(([key]) => (
            <li key={key} className="flex items-center gap-2 text-sm text-left">
              <span className="text-success shrink-0 leading-none">✓</span>
              <p>{t(key)}</p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 self-stretch">
          <button
            type="button"
            className="btn btn-primary"
            onClick={async () => {
              onClose();
              try {
                await requestWebPushSubscribe();
              } catch (error: any) {
                toast.error(error?.message || t("common:error", { ns: "common" }));
              }
            }}
          >
            {t("webpush:prompt.enable")}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-soft"
            onClick={() => {
              onClose();
              recordDismiss();
            }}
          >
            {t("webpush:prompt.dismiss")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default NotificationPromptModal;
