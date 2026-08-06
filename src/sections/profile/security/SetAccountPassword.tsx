import { useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { InnerContainer } from "./ChangePassword";
import { KeyRound } from "lucide-react";
import { SetAccountPasswordModal } from "./SetAccountPasswordModal";

export function SetAccountPassword() {
  const { t } = useTranslation("profile");
  const user = useBoundStore((state) => state.user);
  const [open, setOpen] = useState(false);

  const hasAccount = Boolean(user?.email) || Boolean(user?.mobile);

  return (
    <div className="rounded-lg bg-base-200 p-4 flex flex-col gap-4">
      <InnerContainer
        icon={<KeyRound className="w-6 h-6 text-primary" />}
        title={t("profile:setAccountAndPassword", "Set Account and Password")}
        desc={t("profile:setOtherDevices", "Set an account and password for sign-in on other devices.")}
      />
      <ConfirmBox onClick={() => setOpen(true)}>
        {hasAccount
          ? t("profile:updateAccountAndPassword", "Update Account and Password")
          : t("profile:enableAccountAndPassword", "Enable Account and Password")}
      </ConfirmBox>
      <SetAccountPasswordModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
