import { cn } from "@/utils/cn";
import { Check, ChevronDown, Search } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode } from "react";

export interface SelectOption {
  value: string | number;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export type SelectVariant = "primary" | "secondary" | "accent" | "neutral" | "info" | "success" | "warning" | "error" | "base";

export type SelectSize = "xs" | "sm" | "md" | "lg";

export interface SelectRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  focus: () => void;
  blur: () => void;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number, option: SelectOption) => void;
  placeholder?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  clearable?: boolean;
  loading?: boolean;
  className?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  icon?: ReactNode;
  renderOption?: (option: SelectOption) => ReactNode;
  renderValue?: (option: SelectOption) => ReactNode;
  emptyMessage?: string;
  maxHeight?: string;
  showCheckIcon?: boolean;
}

const variantClasses: Record<
  SelectVariant,
  {
    button: string;
    dropdown: string;
    option: string;
    selected: string;
  }
> = {
  primary: {
    button: "border-primary/20 focus:border-primary ",
    dropdown: "border-primary/10 bg-base-200",
    option: "hover:bg-primary/10 focus:bg-primary/10",
    selected: "bg-primary text-primary-content",
  },
  secondary: {
    button: "border-secondary/20 focus:border-secondary ",
    dropdown: "border-secondary/10 bg-base-200",
    option: "hover:bg-secondary/10 focus:bg-secondary/10",
    selected: "bg-secondary text-secondary-content",
  },
  accent: {
    button: "border-accent/20 focus:border-accent ",
    dropdown: "border-accent/10 bg-base-200",
    option: "hover:bg-accent/10 focus:bg-accent/10",
    selected: "bg-accent text-accent-content",
  },
  neutral: {
    button: "border-neutral/20 focus:border-neutral ",
    dropdown: "border-neutral/10 bg-base-200",
    option: "hover:bg-neutral/10 focus:bg-neutral/10",
    selected: "bg-neutral text-neutral-content",
  },
  info: {
    button: "border-info/20 focus:border-info ",
    dropdown: "border-info/10 bg-base-200",
    option: "hover:bg-info/10 focus:bg-info/10",
    selected: "bg-info text-info-content",
  },
  success: {
    button: "border-success/20 focus:border-success ",
    dropdown: "border-success/10 bg-base-200",
    option: "hover:bg-success/10 focus:bg-success/10",
    selected: "bg-success text-success-content",
  },
  warning: {
    button: "border-warning/20 focus:border-warning ",
    dropdown: "border-warning/10 bg-base-200",
    option: "hover:bg-warning/10 focus:bg-warning/10",
    selected: "bg-warning text-warning-content",
  },
  error: {
    button: "border-error/20 focus:border-error",
    dropdown: "border-error/10 bg-base-200",
    option: "hover:bg-error/10 focus:bg-error/10",
    selected: "bg-error text-error-content",
  },
  base: {
    button: "border-base-300 bg-base-300 hover:bg-base-300/70 focus:border-base-content/40 text-base-content",
    dropdown: "border-base-300 bg-base-200",
    option: "hover:bg-base-200 focus:bg-base-200",
    selected: "bg-primary/20 text-primary",
  },
};

const sizeClasses: Record<
  SelectSize,
  {
    button: string;
    text: string;
    icon: string;
    dropdown: string;
    searchInput: string;
    searchPadding: string;
    searchIconPos: string;
  }
> = {
  xs: {
    button: "h-7 px-2 text-xs font-semibold",
    text: "text-xs font-semibold",
    icon: "w-3 h-3",
    dropdown: "text-xs",
    searchInput: "h-6 text-xs",
    searchPadding: "",
    searchIconPos: "",
  },
  sm: {
    button: "h-8 px-3 text-sm font-semibold",
    text: "text-sm font-semibold",
    icon: "w-4 h-4",
    dropdown: "text-sm font-semibold",
    searchInput: "h-7 text-sm",
    searchPadding: "",
    searchIconPos: "",
  },
  md: {
    button: "h-10 px-4 text-sm sm:text-base font-semibold",
    text: "text-sm font-semibold",
    icon: "w-4 h-4",
    dropdown: "text-sm font-semibold",
    searchInput: "h-7 text-sm",
    searchPadding: "",
    searchIconPos: "",
  },
  lg: {
    button: "h-12 px-6 text-lg font-semibold",
    text: "text-lg font-semibold",
    icon: "w-5 h-5",
    dropdown: "text-base font-semibold",
    searchInput: "h-10 text-base",
    searchPadding: "",
    searchIconPos: "",
  },
};

export const Select = forwardRef<SelectRef, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Select an option",
      variant = "base",
      size = "md",
      disabled = false,
      searchable = false,
      searchPlaceholder = "Search ...",
      clearable = false,
      loading = false,
      className,
      dropdownClassName,
      optionClassName,
      icon,
      renderOption,
      renderValue,
      emptyMessage = "No options available",
      maxHeight = "max-h-60",
      showCheckIcon = true,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [dropUp, setDropUp] = useState(false);
    const [dropMaxHeight, setDropMaxHeight] = useState<number | null>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

    const variantStyles = variantClasses[variant];
    const sizeStyles = sizeClasses[size];

    // Find selected option
    const selectedOption = options.find((option) => option.value === value);

    // Filter options based on search
    const filteredOptions =
      searchable && searchQuery
        ? options.filter((option) => {
            const label = typeof option.label === "string" ? option.label : option.value.toString();
            return label.toLowerCase().includes(searchQuery.toLowerCase());
          })
        : options;

    // 从 maxHeight tailwind class 解析像素上限，如 "max-h-60" → 240
    const maxHeightPx = (() => {
      const m = maxHeight.match(/max-h-(\d+)/);
      return m ? Number(m[1]) * 4 : 240;
    })();

    // 计算下拉方向和可用高度
    const calcDropLayout = useCallback(() => {
      if (!buttonRef.current) return { up: false, maxH: maxHeightPx };
      const rect = buttonRef.current.getBoundingClientRect();
      const dockHeight = 72;
      const safeMargin = 16;
      // 下方可用空间：视口底部 - 按钮底部 - Dock - 安全边距
      const spaceBelow = window.innerHeight - rect.bottom - dockHeight - safeMargin;
      // 上方可用空间：按钮顶部 - 安全边距
      const spaceAbove = rect.top - safeMargin;
      const estimatedH = Math.min(filteredOptions.length * 40 + 16, maxHeightPx);
      // 选择空间更大的方向
      const up = spaceBelow < estimatedH && spaceAbove > spaceBelow;
      // 可用高度取方向对应空间与 maxHeightPx 的较小值
      const availableSpace = up ? spaceAbove : spaceBelow;
      const maxH = Math.min(maxHeightPx, Math.max(availableSpace, 120));
      return { up, maxH };
    }, [filteredOptions.length, maxHeightPx]);

    // Handle selection
    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return;

      onChange?.(option.value, option);
      setIsOpen(false);
      setSearchQuery("");
      setFocusedIndex(-1);
    };

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.("", {} as SelectOption);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          if (!isOpen) {
            const { up, maxH } = calcDropLayout();
            setDropUp(up);
            setDropMaxHeight(maxH);
            setIsOpen(true);
            setFocusedIndex(0);
          } else if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
            handleSelect(filteredOptions[focusedIndex]);
          }
          e.preventDefault();
          break;
        case "Escape":
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;
        case "ArrowDown":
          if (!isOpen) {
            const { up, maxH } = calcDropLayout();
            setDropUp(up);
            setDropMaxHeight(maxH);
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
          }
          e.preventDefault();
          break;
        case "ArrowUp":
          if (isOpen) {
            setFocusedIndex((prev) => Math.max(prev - 1, 0));
          }
          e.preventDefault();
          break;
      }
    };

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery("");
          setFocusedIndex(-1);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    // 搜索过滤变化时在绘制前重新计算方向和高度
    useLayoutEffect(() => {
      if (isOpen) {
        const { up, maxH } = calcDropLayout();
        setDropUp(up);
        setDropMaxHeight(maxH);
      }
    }, [isOpen, calcDropLayout]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Scroll focused option into view
    useEffect(() => {
      if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
        optionRefs.current[focusedIndex]?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }, [focusedIndex]);

    // Expose ref methods
    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          const { up, maxH } = calcDropLayout();
          setDropUp(up);
          setDropMaxHeight(maxH);
          setIsOpen(true);
        },
        close: () => setIsOpen(false),
        toggle: () => {
          if (!isOpen) {
            const { up, maxH } = calcDropLayout();
            setDropUp(up);
            setDropMaxHeight(maxH);
          }
          setIsOpen((prev) => !prev);
        },
        focus: () => buttonRef.current?.focus(),
        blur: () => buttonRef.current?.blur(),
      }),
      [calcDropLayout, isOpen],
    );

    // Render option content
    const renderOptionContent = (option: SelectOption) => {
      if (renderOption) return renderOption(option);

      return (
        <div className="flex items-center flex-1">
          {option.icon && <span className="shrink-0">{option.icon}</span>}
          <span className="flex-1">{option.label}</span>
          {value === option.value && showCheckIcon && <Check className={cn("shrink-0 ml-auto rtl:mr-auto", sizeStyles.icon)} />}
        </div>
      );
    };

    // Render selected value
    const renderSelectedValue = () => {
      if (!selectedOption) {
        return <span className="text-base-content/50">{placeholder}</span>;
      }

      if (renderValue) return renderValue(selectedOption);

      return (
        <div className="flex items-center gap-2">
          {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={cn("flex-1 truncate", sizeStyles.text)}>{selectedOption.label}</span>
        </div>
      );
    };

    return (
      <div ref={dropdownRef} className={cn("relative w-full", className)}>
        {/* Trigger Button */}
        <button
          ref={buttonRef}
          type="button"
          className={cn(
            "btn border-none w-full justify-between rounded-field transition-all duration-150",
            sizeStyles.button,
            sizeStyles.text,
            variantStyles.button,
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
          onClick={() => {
            if (disabled) return;
            if (!isOpen) {
              const { up, maxH } = calcDropLayout();
              setDropUp(up);
              setDropMaxHeight(maxH);
            }
            setIsOpen(!isOpen);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={selectedOption ? `Selected: ${selectedOption.label}` : placeholder}
        >
          <div className={cn("flex items-center gap-2 flex-1 min-w-0 text-base-content", sizeStyles.text)}>
            {icon && <span className="shrink-0">{icon}</span>}
            <div className="text-sm flex-1 text-left rtl:text-right truncate">
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Loading...</span>
                </div>
              ) : (
                renderSelectedValue()
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {clearable && selectedOption && !disabled && (
              <button type="button" className="p-1 hover:bg-base-200 rounded" onClick={handleClear} aria-label="Clear selection">
                <svg className={sizeStyles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            <ChevronDown className={cn("transition-transform duration-150", sizeStyles.icon, isOpen && "rotate-180")} />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && !loading && (
            <div
              className={cn(
                "absolute z-50 w-full bg-base-100 rounded-field shadow-sm px-1",
                dropUp ? "bottom-full mb-1" : "top-full mt-1",
                sizeStyles.dropdown,
                variantStyles.dropdown,
                dropdownClassName,
              )}
            >
              {/* Search Input */}
              {searchable && (
                <div className="p-2 border-b border-base-content/10">
                  <div className="relative">
                    <Search
                      className={cn(
                        "absolute top-1/2 transform -translate-y-1/2 text-base-content/50",
                        "left-3 rtl:left-auto rtl:right-3",
                        sizeStyles.icon,
                      )}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "input w-full bg-base-200 border-0 focus:outline-none rounded-field",
                        "pl-10 rtl:pl-4 rtl:pr-10",
                        sizeStyles.searchInput,
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Options List */}
              <div
                className={cn("py-1 overflow-auto", !dropMaxHeight && maxHeight)}
                style={{ maxHeight: dropMaxHeight ? `${dropMaxHeight}px` : undefined }}
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-2 text-base-content/50 text-center">{emptyMessage}</div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.value}
                      ref={(el) => {
                        optionRefs.current[index] = el;
                      }}
                      className={cn(
                        "px-3 py-2 cursor-pointer transition-colors duration-100 rounded-field",
                        "flex items-center justify-between",
                        option.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : variantStyles.option,
                        value === option.value && !option.disabled && variantStyles.selected,
                        optionClassName,
                        option.className,
                      )}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setFocusedIndex(index)}
                      role="option"
                      aria-selected={value === option.value}
                      aria-disabled={option.disabled}
                    >
                      {renderOptionContent(option)}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
      </div>
    );
  },
);

Select.displayName = "Select";
