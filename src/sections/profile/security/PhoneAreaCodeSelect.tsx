import { useTranslation } from "@/lib/i18n/react-i18next";
import { type Country, getCountryCallingCode } from "@/lib/phone";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useBoundStore } from "@/store";
import getUnicodeFlagIcon from "country-flag-icons/unicode";

export const PhoneAreaCodeSelect = ({ loading, defaultCode, defaultValue = "", onPhoneChange, onCodeChange }: {
  loading: boolean;
  defaultCode: string;
  defaultValue?: string;
  onCodeChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}) => {
  const { t } = useTranslation("profile");
  const openModal = useBoundStore((s) => s.openModal);
  const [phone, setPhone] = useState(defaultValue);
  const [selectedCode, setSelectedCode] = useState<Country | "">(
    (defaultCode?.toUpperCase() as Country) || ""
  );

  useEffect(() => {
    if (defaultCode) setSelectedCode(defaultCode.toUpperCase() as Country);
  }, [defaultCode]);

  const handleOpenPicker = () => {
    openModal("OPEN_PHONE_AREA_CODE_MODAL", {
      selectedCode,
      onSelect: (code: Country) => {
        setSelectedCode(code);
        onCodeChange(code);
      }
    });
  };

  return (
    <div className="input bg-base-200 !outline-0 border-0 p-0 overflow-hidden flex items-center">
      {/* 区号触发器 */}
      <button
        type="button"
        disabled={loading}
        onClick={handleOpenPicker}
        className="flex items-center gap-2 px-2 h-full shrink-0 border-none"
      >
        {loading ? (
          <span className="loading loading-spinner loading-xs text-primary" />
        ) : selectedCode ? (
          <span className="text-base leading-none">{getUnicodeFlagIcon(selectedCode)}</span>
        ) : null}
        <span className="text-sm font-bold text-base-content">
          {selectedCode ? `+${getCountryCallingCode(selectedCode)}` : t("finance:select")}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-base-content/40" />
      </button>

      {/* 手机号输入 */}
      <input
        type="text"
        placeholder={t("profile:enterPhoneNumber")}
        value={phone || defaultValue}
        onChange={(e) => {
          let val = e.target.value;
          if (selectedCode && /^0+/.test(val)) val = val.replace(/^0+/, "");
          setPhone(val);
          onPhoneChange(val);
        }}
      />
    </div>
  );
};
