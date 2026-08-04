import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from "@/lib/i18n/react-i18next"

type PasswordInputProps = {
  value: string
  onChange: (value: string) => void
}

export const PasswordInput = ({ value, onChange }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useTranslation()

  const handleShowPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    setShowPassword(!showPassword)
  }

  return (
    <label className="input input-md input-ghost bg-base-300 text-base-content w-full">
      <input className={'grow font-bold placeholder:!text-base-content/30'} type={showPassword ? 'text' : 'password'} placeholder={t('login:password')} value={value} onChange={e => onChange(e.target.value)} />
      <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={handleShowPassword}>
        {showPassword ? (
          <Eye className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        ) : (
          <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-base-content/50" />
        )}
      </button>
    </label>
  )
}
