import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Country,
  getCountries,
  getCountryCallingCode,
  detectCountryFromPhone as parsePhoneNumberCountry,
  formatPhoneNumberIntl,
} from "@/lib/phone";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { cn } from "@/utils/cn.ts";
import { Search, ChevronDown, X } from "lucide-react";

// Types
export type PhoneEmailValue = string
export type InputMode = "email" | "phone" | "auto"
export type ValidationState = "valid" | "invalid" | "pending" | "none"

interface PhoneEmailInputProps {
  value?: PhoneEmailValue;
  onChange?: (value: PhoneEmailValue) => void;
  onValidationChange?: (isValid: boolean, mode: InputMode) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultCountry?: Country;
  countries?: Country[];
  mode?: InputMode;
  showValidationIcon?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

// Enhanced email validation (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Utility functions
const isValidEmail = (email: string): boolean => {
  if (!email || email.length > 254) return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [localPart] = parts;
  if (localPart.length > 64) return false;
  return EMAIL_REGEX.test(email);
};

const detectInputMode = (input: string): InputMode => {
  if (!input) return "auto";

  // Clear email detection
  if (input.includes("@")) return "email";

  // Phone number detection - starts with + or contains only digits/spaces/dashes/parentheses
  const phonePattern = /^[\d\s\-\(\)\+]+$/;
  if (phonePattern.test(input) && (input.startsWith("+") || input.replace(/\D/g, "").length >= 3)) {
    return "phone";
  }

  return "auto";
};

const extractDigits = (value: string): string => value.replace(/\D/g, "");

const removeLeadingPlus = (value: string): string => value.replace(/^\++/, "");

const buildInternationalFromRaw = (value: string, country: Country): string => {
  const digits = extractDigits(value);

  if (!digits) {
    return "";
  }

  return `+${getCountryCallingCode(country)}${digits}`;
};

const formatPhoneForParent = (value: string, country: Country): string => {
  const international = buildInternationalFromRaw(value, country);
  if (!international) return "";

  try {
    const country = parsePhoneNumberCountry(international);
    if (country) {
      const callingCode = getCountryCallingCode(country);
      const nationalNumber = extractDigits(international).slice(callingCode.length);
      const formatted = `+${callingCode}-${nationalNumber}`;
      const originalDigits = extractDigits(value);
      const parsedDigits = extractDigits(formatted);
      if (parsedDigits.length >= originalDigits.length) {
        return formatted;
      }
    }
  } catch {
  }

  // 解析失败或导致截断，返回原始国际格式（不带横杠）
  return international;
};

const deriveRawFromExternal = (external: string, fallbackCountry: Country): string => {
  if (!external) return "";

  const trimmed = external.trim();
  if (!trimmed) return "";

  const detectedMode = detectInputMode(trimmed);
  if (detectedMode !== "phone") {
    return trimmed;
  }

  const digits = extractDigits(trimmed);

  if (!digits) {
    return "";
  }

  // 如果外部值以 + 开头，尝试提取本地号码部分
  if (trimmed.startsWith("+")) {
    const fallbackCode = getCountryCallingCode(fallbackCountry);

    // 简单字符串匹配：如果以 +国家代码 开头，移除它
    if (digits.startsWith(fallbackCode)) {
      return digits.slice(fallbackCode.length);
    }

    // 如果包含横杠分隔符（如 +86-13800138000），提取横杠后的部分
    if (trimmed.includes("-")) {
      const parts = trimmed.split("-");
      if (parts.length === 2 && parts[0].startsWith("+")) {
        return parts[1];
      }
    }

    // 其他情况返回所有数字（可能是其他国家的号码）
    return digits;
  }

  // 如果不以 + 开头，说明是本地号码，直接返回所有数字
  return digits;
};

const getBrowserCountryCode = (): Country => {
  try {
    // Try to detect from timezone first
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneToCountry: Record<string, Country> = {
      "America/New_York": "US",
      "America/Los_Angeles": "US",
      "America/Chicago": "US",
      "Europe/London": "GB",
      "Europe/Paris": "FR",
      "Europe/Berlin": "DE",
      "Europe/Rome": "IT",
      "Europe/Madrid": "ES",
      "Asia/Tokyo": "JP",
      "Asia/Shanghai": "CN",
      "Asia/Seoul": "KR",
      "Asia/Kolkata": "IN",
      "Australia/Sydney": "AU",
      "America/Toronto": "CA"
    };

    if (timezoneToCountry[timezone]) {
      return timezoneToCountry[timezone];
    }

    // Fallback to browser locale
    const locale = navigator.language || navigator.languages?.[0] || "en-US";
    const countryFromLocale = locale.split("-")[1]?.toUpperCase() as Country;
    if (countryFromLocale && getCountries().includes(countryFromLocale)) {
      return countryFromLocale;
    }

    return "US";
  } catch {
    return "US";
  }
};

// Pre-import available languages to avoid dynamic import issues
import enLocale from "@/lib/phone/locale/en.json";
import getUnicodeFlagIcon from "country-flag-icons/unicode";

export const PhoneEmailInput = forwardRef<HTMLInputElement, PhoneEmailInputProps>(
  (
    {
      value = "",
      onChange,
      onValidationChange,
      placeholder = "Enter email or phone number",
      disabled = false,
      className = "",
      defaultCountry,
      countries = getCountries(),
      mode = "auto",
      showValidationIcon = true,
      autoFocus = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const { t } = useTranslation();

    // State
    const [rawValue, setRawValue] = useState<string>(value);
    const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry || getBrowserCountryCode());
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);

    // Refs
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
    const rawValueRef = useRef(rawValue);

    // Combine refs
    const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;

    // Derived state
    const currentMode = mode === "auto" ? detectInputMode(rawValue) : mode;
    const isEmailMode = currentMode === "email";
    const isPhoneMode = currentMode === "phone";

    const digitsOnlyValue = useMemo(() => extractDigits(rawValue), [rawValue]);

    // Show country selector when in phone mode and has significant input
    const showCountrySelector = isPhoneMode && digitsOnlyValue.length >= 3;

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
      if (!searchTerm) return countries;
      return countries.filter(country => {
        const countryName = (enLocale[country as keyof typeof enLocale] || country)?.toLowerCase() || "";
        const callingCode = getCountryCallingCode(country);
        const searchLower = searchTerm.toLowerCase();
        return countryName.includes(searchLower) ||
          callingCode.includes(searchTerm) ||
          `+${callingCode}`.includes(searchTerm);
      });
    }, [countries, searchTerm]);

    // Validation
    const validationState = useMemo((): ValidationState => {
      if (!rawValue.trim()) return "none";

      if (isEmailMode) {
        return isValidEmail(rawValue) ? "valid" : "invalid";
      }

      if (isPhoneMode) {
        const digits = digitsOnlyValue;

        if (!digits) {
          return "invalid";
        }

        // TODO: 生产环境启用 - 暂时关闭手机号有效性验证，允许输入6位
        // const internationalValue = buildInternationalFromRaw(rawValue, selectedCountry)
        // if (internationalValue && isValidPhoneNumber(internationalValue)) {
        //   return 'valid'
        // }
        // return digits.length >= 7 ? 'invalid' : 'pending'

        // 临时验证逻辑：允许至少6位数字
        if (digits.length >= 6) {
          return "valid";
        }
        return "pending";
      }

      return "pending";
    }, [rawValue, isEmailMode, isPhoneMode, digitsOnlyValue, selectedCountry]);

    const isValid = validationState === "valid" || validationState === "none";

    // 同步 rawValueRef，让 effect 能读到最新值但不依赖它
    rawValueRef.current = rawValue;

    // Effects
    useEffect(() => {
      const nextMode = mode === "auto" ? detectInputMode(value) : mode;

      if (nextMode === "phone") {
        const nextRawValue = deriveRawFromExternal(value, selectedCountry);

        if (nextRawValue !== rawValueRef.current) {
          setRawValue(nextRawValue);
        }

        const trimmed = value.trim();
        if (trimmed.startsWith("+")) {
          const digits = extractDigits(trimmed);
          if (digits) {
            const detectedCountry = parsePhoneNumberCountry(`+${digits}`);
            if (detectedCountry && detectedCountry !== selectedCountry) {
              setSelectedCountry(detectedCountry);
            }
          }
        }

        return;
      }

      if (value !== rawValueRef.current) {
        setRawValue(value);
      }
    }, [value, mode, selectedCountry]); // 移除 rawValue 依赖，防止用户输入触发回滚

    useEffect(() => {
      if (!defaultCountry || rawValue.trim()) return;
      if (defaultCountry !== selectedCountry) {
        setSelectedCountry(defaultCountry);
      }
    }, [defaultCountry, rawValue, selectedCountry]);

    useEffect(() => {
      if (onValidationChange) {
        onValidationChange(isValid, currentMode);
      }
    }, [isValid, currentMode, onValidationChange]);

    // Auto-focus
    useEffect(() => {
      if (autoFocus && combinedRef.current) {
        combinedRef.current.focus();
      }
    }, [autoFocus]);

    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsDropdownOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
        }
      };

      if (isDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isDropdownOpen]);

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isDropdownOpen) return;

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            setFocusedIndex(prev =>
              prev < filteredCountries.length - 1 ? prev + 1 : 0
            );
            break;
          case "ArrowUp":
            event.preventDefault();
            setFocusedIndex(prev =>
              prev > 0 ? prev - 1 : filteredCountries.length - 1
            );
            break;
          case "Enter":
            event.preventDefault();
            if (focusedIndex >= 0 && filteredCountries[focusedIndex]) {
              handleCountrySelect(filteredCountries[focusedIndex]);
            }
            break;
          case "Escape":
            event.preventDefault();
            setIsDropdownOpen(false);
            setSearchTerm("");
            setFocusedIndex(-1);
            combinedRef.current?.focus();
            break;
        }
      };

      if (isDropdownOpen) {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [isDropdownOpen, focusedIndex, filteredCountries]);

    // Scroll focused option into view
    useEffect(() => {
      if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
        optionRefs.current[focusedIndex]?.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        });
      }
    }, [focusedIndex]);

    // Handlers
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputWithoutLeadingPlus = removeLeadingPlus(e.target.value);
        const nextMode = mode === "auto" ? detectInputMode(inputWithoutLeadingPlus) : mode;

        // 只在手机号模式下移除 + 号，邮箱模式保留（支持 user+tag@example.com 格式）
        const sanitizedValue = nextMode === "phone"
          ? inputWithoutLeadingPlus.replace(/\+/g, "")
          : inputWithoutLeadingPlus;

        setRawValue(sanitizedValue);
        let nextCountry = selectedCountry;

        if (onChange) {
          if (nextMode === "phone") {
            onChange(formatPhoneForParent(sanitizedValue, nextCountry));
          } else {
            onChange(sanitizedValue);
          }
        }
      },
      [mode, onChange, selectedCountry]
    );

    const handleCountrySelect = useCallback(
      (country: Country) => {
        setSelectedCountry(country);
        setIsDropdownOpen(false);
        setSearchTerm("");
        setFocusedIndex(-1);

        if (isPhoneMode && rawValue.trim() !== "") {
          onChange?.(formatPhoneForParent(rawValue, country));
        }

        // Return focus to input
        setTimeout(() => combinedRef.current?.focus(), 0);
      },
      [combinedRef, isPhoneMode, onChange, rawValue]
    );

    const handleDropdownToggle = useCallback(() => {
      if (disabled) return;
      setIsDropdownOpen(prev => !prev);
      if (!isDropdownOpen) {
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    }, [disabled, isDropdownOpen]);

    const clearInput = useCallback(() => {
      setRawValue("");
      onChange?.("");
      combinedRef.current?.focus();
    }, [combinedRef, onChange]);

    // Format display value for phone numbers
    const displayValue = useMemo(() => {
      if (!rawValue || rawValue.trim() === "") {
        return "";
      }

      if (isPhoneMode) {
        if (showCountrySelector) {
          // 用户输入本地号码，直接显示
          return rawValue;
        }

        // 不显示国家选择器时，尝试格式化为国际格式
        const internationalValue = buildInternationalFromRaw(rawValue, selectedCountry);
        if (internationalValue) {
          try {
            return formatPhoneNumberIntl(internationalValue);
          } catch {
            return internationalValue;
          }
        }
      }

      return rawValue;
    }, [rawValue, isPhoneMode, showCountrySelector, selectedCountry]);

    return (
      <div className={cn("phone-email-input-container relative", className)}>
        <div className="join w-full flex relative">
          {/* Country Selector */}
          {showCountrySelector && (
            <div className="" ref={dropdownRef}>
              <button
                className={cn(
                  "px-4 join-item bg-base-300",
                  "min-w-20 gap-2 flex items-center justify-start",
                  "border-0 h-10",
                  disabled && "btn-disabled"
                )}
                type="button"
                onClick={handleDropdownToggle}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                aria-label={`Selected country: ${enLocale[selectedCountry as keyof typeof enLocale] || selectedCountry}`}
              >
                <span className={"h-5"}>{getUnicodeFlagIcon(selectedCountry)}</span>
                <span className="text-sm font-bold text-primary">
                  +{getCountryCallingCode(selectedCountry)}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div
                  className="absolute top-full w-full z-50 mt-1 bg-base-200 border border-base-300 rounded-lg shadow-lg h-[294px] overflow-hidden">
                  {/* Search */}
                  <div className="p-2 border-b border-base-300">
                    <div className="relative">
                      <Search
                        className="absolute z-50 left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={t("common:common.searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-md w-full rounded-field pl-8 bg-base-300 border-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Countries List */}
                  <div className="hide-scrollbar overflow-y-auto h-[228px]" role="listbox">
                    {filteredCountries.length === 0 ? (
                      <div className="p-3 text-center text-base-content/50 text-sm">
                        {t("common:no_countries_found")}
                      </div>
                    ) : (
                      filteredCountries.map((country, index) => (
                        <li
                          key={country}
                          ref={el => {
                            optionRefs.current[index] = el;
                          }}
                          className={cn(
                            "font-bold flex items-center gap-2 px-2 py-2 cursor-pointer transition-colors rounded-field",
                            country === selectedCountry && "bg-primary/10 text-primary",
                            focusedIndex === index && "bg-base-200"
                          )}
                          onClick={() => handleCountrySelect(country)}
                          role="option"
                          aria-selected={country === selectedCountry}
                          tabIndex={-1}
                        >
                          <span className={"h-5"}>{getUnicodeFlagIcon(country)}</span>
                          <span className="flex-1 text-sm">
                            {enLocale[country as keyof typeof enLocale] || country}
                          </span>
                          <span className="text-xs text-primary font-bold">
                            +{getCountryCallingCode(country)}
                          </span>
                        </li>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Input */}
          <label className={cn(
            "input input-ghost join-item flex-1 bg-base-300 input-md",
            disabled && "input-disabled"
          )}>
            <input
              ref={combinedRef}
              type="text"
              inputMode="text"
              autoComplete={isEmailMode ? "email" : "tel"}
              value={displayValue}
              onChange={handleInputChange}
              placeholder={
                isEmailMode
                  ? "Enter email address"
                  : isPhoneMode
                    ? "Enter phone number"
                    : placeholder
              }
              disabled={disabled}
              required={required}
              className="grow font-bold placeholder:!text-base-content/30"
              {...props}
            />

            {/* Clear button */}
            {rawValue && !disabled && (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={clearInput}
                aria-label="Clear input"
                tabIndex={-1}
              >
                <X className="w-4 h-4 text-base-content/50" />
              </button>
            )}

          </label>
        </div>

      </div>
    );
  }
);

PhoneEmailInput.displayName = "PhoneEmailInput";