import { type Country, getCountries, getCountryCallingCode } from "@/lib/phone";
import { useMemo, useDeferredValue, useState, useEffect, useRef } from "react";
import locale from "@/lib/phone/locale/en.json";
import { Modal } from "@/components/ui/Modal.tsx";
import { Search } from "lucide-react";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import { useTranslation } from "@/lib/i18n/react-i18next";

interface PhoneAreaCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCode: Country | "";
  onSelect: (code: Country) => void;
}

const allCountries = getCountries();

export function PhoneAreaCodeModal({ isOpen, onClose, selectedCode, onSelect }: PhoneAreaCodeModalProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [activeCode, setActiveCode] = useState<Country | "">(selectedCode);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveCode(selectedCode);
      if (selectedRef.current) {
        selectedRef.current.scrollIntoView({ block: "center" });
      }
    }
  }, [isOpen, selectedCode]);

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase();
    if (!q) return allCountries;
    return allCountries.filter((code) =>
      locale[code]?.toLowerCase().includes(q) ||
      code.toLowerCase().includes(q) ||
      getCountryCallingCode(code).includes(q)
    );
  }, [deferredSearch]);

  const handleClose = () => {
    setSearch("");
    setActiveCode("");
    onClose();
  };

  const handleSelect = (code: Country) => {
    setActiveCode(code);
    onSelect(code);
    setTimeout(handleClose, 150);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t("profile:phoneVerification")}>
      <label className="input bg-base-200 w-full !outline-0 border-0 font-bold">
        <Search className="w-4 h-4 text-base-content/50" />
        <input
          type="text"
          value={search}
          autoFocus
          placeholder={t("common:common.searchPlaceholder")}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      <div className="mt-2 flex flex-col gap-0.5 min-h-[75dvh] overflow-y-auto hide-scrollbar">
        {filtered.length === 0 ? (
          <NothingFound className="static h-32" />
        ) : filtered.map((code) => (
          <div
            key={code}
            ref={activeCode === code ? selectedRef : undefined}
            onClick={() => handleSelect(code)}
            className={`flex items-center justify-between px-2 py-2 rounded-md transition-colors ${
              activeCode === code ? "bg-primary/15 text-primary" : "hover:bg-base-200"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-lg leading-none shrink-0 mt-1">{getUnicodeFlagIcon(code)}</span>
              <span className="font-semibold text-sm truncate">{locale[code]}</span>
            </div>
            <span className="text-xs font-bold text-base-content/50 shrink-0 ml-2">
              +{getCountryCallingCode(code)}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
