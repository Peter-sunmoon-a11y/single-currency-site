import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { InnerContainer } from "@/sections/profile/security/ChangePassword.tsx";
import { LockKeyhole } from "lucide-react";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";

export function SetWithdrawalPIN() {
  const { t } = useTranslation("profile");

  const user = useBoundStore((state) => state.user);

  const openModal = useBoundStore((state) => state.openModal);

  return (
    <div className="rounded-lg bg-base-200 p-4 flex flex-col gap-4">
      <InnerContainer
        icon={<LockKeyhole className="w-6 h-6 text-primary" />}
        title={t("profile:setWithdrawalPIN")}
        desc={t("profile:setWithdrawalPINDescription")} />
      <ConfirmBox
        onClick={() => openModal("OPEN_SET_WITHDRAWAL_PIN_MODAL")}>
        {user?.pin_setted ? t("profile:updateWithdrawalPin") : t("profile:enableWithdrawalPin")}
      </ConfirmBox>
    </div>
  );
}
