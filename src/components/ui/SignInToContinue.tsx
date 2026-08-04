import { useTranslation } from "@/lib/i18n/react-i18next"

export const SignInToContinue = ({ onClick }: { onClick?: () => void }) => {
  const { t } = useTranslation()
  return (
    <button className={`btn bg-primary/10 font-bold text-primary`} onClick={() => {
      onClick?.()
    }}>
      {t('finance:sign_in_to_continue')}
    </button>
  )
}
