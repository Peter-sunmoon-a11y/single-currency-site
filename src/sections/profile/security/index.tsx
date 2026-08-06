import { ChangePassword } from "@/sections/profile/security/ChangePassword.tsx";
import { EmailVerification } from "@/sections/profile/security/EmailVerification.tsx";
import { PhoneVerification } from "@/sections/profile/security/PhoneVerification.tsx";
import { SetAccountPassword } from "@/sections/profile/security/SetAccountPassword";
// import { SetWithdrawalPIN } from "@/sections/profile/security/SetWithdrawalPIN.tsx";
import { useTelegramContext } from "@/hooks/useTelegramContext";
import { useTranslation } from "@/lib/i18n/react-i18next";

export function Index() {
  const { t } = useTranslation();
  const isTelegram = useTelegramContext();
  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-base text-primary font-bold border-l-4 pl-2 border-l-primary">
        {t("common.security")}
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {isTelegram ? <SetAccountPassword /> : <ChangePassword />}
        {/*TODO: 暂时取消*/}
        {/*<SetWithdrawalPIN />*/}
        <PhoneVerification />
        <EmailVerification />
      </div>
    </div>
  );
}
