import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { InnerContainer } from "./ChangePassword";
import { Eye, EyeOff, Mail } from 'lucide-react'
import { useState } from 'react'
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

export function EmailVerification() {
  const { t } = useTranslation('profile');

  const user = useBoundStore((state) => state.user);

  const openModal = useBoundStore((state) => state.openModal);

  return (
    <div className="rounded-lg bg-base-200 p-4 flex flex-col gap-4">
      <InnerContainer
        icon={<Mail className="w-6 h-6 text-primary" />}
        title={user?.is_bind_email === 1 ? t("profile:verified_email") : t("profile:emailVerification")}
        desc={user?.is_bind_email !== 1 ? t("profile:ensure_email_valid") : ""}
      />
      {
        (user?.email || user?.is_bind_email === 1) && (
          <VerificationInput value={user?.email || ''} unverified={!!user?.email && user?.is_bind_email === 0} />
        )
      }
      <ConfirmBox
        className={`${user?.is_bind_email === 1 ? 'btn-soft' : ''}`}
        onClick={() => openModal("OPEN_EMAIL_VERIFICATION_MODAL")}>
        {user?.is_bind_email === 1
          ? t("profile:change_key")
          : t("profile:verifyEmail")}
      </ConfirmBox>
    </div>
  );
}

type VerificationInputProps = {
  value: string
  unverified?: boolean
}

export const VerificationInput = ({ value, unverified }: VerificationInputProps) => {
  const { t } = useTranslation('profile');

  const [showVerification, setShowVerification] = useState(false)

  const handleShowVerification = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setShowVerification(!showVerification)
  }

  return (
    <label className="input input-md border-0 !outline-0 text-base-content w-full text-base">
      <input type={showVerification ? 'text' : 'password'} readOnly className={`${showVerification ? '' : 'text-base-content/50'}`} value={value} />
      <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={handleShowVerification}>
        {showVerification ? (
          <Eye className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        ) : (
          <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-base-content/50" />
        )}
      </button>
      {unverified && <TextBaseContent text={t('profile:unverified')} className={'text-neutral rounded-sm px-2 bg-primary py-0.5'} />}
    </label>
  )
}
