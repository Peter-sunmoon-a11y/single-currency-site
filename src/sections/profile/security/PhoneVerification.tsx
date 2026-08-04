import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { InnerContainer } from "./ChangePassword";
import { VerificationInput } from "./EmailVerification";
import { Smartphone } from "lucide-react";

export function PhoneVerification() {
  const { t } = useTranslation('profile');

  const user = useBoundStore((state) => state.user);

  const openModal = useBoundStore((state) => state.openModal);

  return (
    <div className="rounded-lg bg-base-200 p-4 flex flex-col gap-4">
      <InnerContainer
        icon={<Smartphone className="w-6 h-6 text-primary" />}
        title={user?.is_bind_mobile === 1 ? t("profile:verified_phone_number") : t("profile:phoneNumberVerification")}
        desc={user?.is_bind_mobile !== 1 ? t("profile:ensure_phone_valid") : ""}
      />
      {
        user?.is_bind_mobile === 1 && (
          <VerificationInput value={user?.mobile || ''} />
        )
      }
      <ConfirmBox
        className={`${user?.is_bind_mobile == 1 ? 'btn-soft' : ''}`}
        onClick={() => openModal("OPEN_PHONE_VERIFICATION_MODAL")}>
        {user?.is_bind_mobile === 1
          ? t("profile:change_key")
          : t("profile:verifyPhone")}
      </ConfirmBox>
    </div>
  );
}
