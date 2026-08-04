import { ChevronDown, Search } from "lucide-react";
import {
  forwardRef,
  ReactNode,
  useCallback,
  useDeferredValue,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Modal } from "@/components/ui/Modal.tsx";
import { NothingFound } from "@/components/ui/NothingFound.tsx";
import clsx from "clsx";

export interface SelectOption {
  id: string;
  icon?: string;
  value: string | number;
  label?: string | ReactNode;
  extra?: ReactNode;
  disabled?: boolean;
}

export interface SelectDropdownRef {
  handleOpenChange: (open: boolean) => void;
  blur: () => void;
}

export interface SelectDropdownProps {
  title?: ReactNode;
  value?: string | number;
  loading?: boolean;
  options: SelectOption[];
  disabled?: boolean;
  onChange?: (value: string | number, option: SelectOption) => void;
  renderOption?: (option: SelectOption) => ReactNode;
  renderTrigger?: (option: SelectOption | null) => ReactNode;
  triggerClass?: string
}

export const SelectDropdown = forwardRef<SelectDropdownRef, SelectDropdownProps>(({
                                                                                    loading,
                                                                                    title,
                                                                                    options,
                                                                                    value,
                                                                                    onChange,
                                                                                    disabled = false,
                                                                                    triggerClass,
                                                                                    renderOption,
                                                                                    renderTrigger
                                                                                  }, ref) => {
  const searchRef = useRef<HTMLInputElement>(null);

  const { t } = useTranslation();

  const [{ isOpen, searchText, selectedValue }, setState] = useState<{
    isOpen: boolean;
    searchText: string;
    selectedValue: string | number | null;
  }>({ isOpen: false, searchText: "", selectedValue: null });

  const deferredSearch = useDeferredValue(searchText);

  const showSearch = options.length > 10;

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  const filtered = useMemo(() => {
    if (!showSearch || !deferredSearch) return options;
    const q = deferredSearch.toLowerCase();
    const getLabel = (o: SelectOption) => (typeof o.label === "string" ? o.label : String(o.value)).toLowerCase();
    return options
      .filter((o) => getLabel(o).includes(q))
      .sort((a, b) => {
        const aStarts = getLabel(a).startsWith(q);
        const bStarts = getLabel(b).startsWith(q);
        return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
      });
  }, [options, deferredSearch, showSearch]);

  const handleClose = useCallback(() => setState({ isOpen: false, searchText: "", selectedValue: null }), []);

  const handleSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return;
    setState((s) => ({ ...s, selectedValue: option.value }));
    if (onChange && option.value !== value) onChange(option.value, option);
    setTimeout(handleClose, 250);
  }, [onChange, value, handleClose]);

  useImperativeHandle(ref, () => ({
    handleOpenChange: (open: boolean) => setState((s) => ({ ...s, isOpen: open })),
    blur: () => searchRef.current?.blur()
  }), []);

  return (
    <div className="relative w-full">
      <button
        className={clsx("btn bg-base-200 px-4 w-full", triggerClass)}
        onClick={() => !loading && !disabled && setState((s) => ({ ...s, isOpen: true }))}
        disabled={disabled}
      >
        {loading ? <SelectSkeleton /> : renderTrigger ? (
          <><div className="flex-1 text-left overflow-hidden">{renderTrigger(selected)}</div><ChevronDown size={14} /></>
        ) : <SelectTrigger option={selected} placeholder={t("common:common.pleaseSelect")} />}
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} title={title} position="modal-middle">
        {showSearch && (
          <label className="input bg-base-200 w-full !outline-0 border-0 font-bold flex">
            <Search className="text-base-content/50 w-4 h-4" />
            <input
              ref={searchRef}
              type="text"
              value={searchText}
              placeholder={t("common:common.searchPlaceholder")}
              onChange={(e) => setState((s) => ({ ...s, searchText: e.target.value }))}
            />
          </label>
        )}
        <div className="mt-2 overflow-y-auto hide-scrollbar flex flex-col gap-1 max-h-[50dvh]">
          {filtered.length > 0 ? filtered.map((option, i) => (
            <div
              key={`${option.id}_${i}`}
              onClick={() => handleSelect(option)}
              className={`flex items-center gap-2 pl-2 pr-2 py-2 rounded-md transition-all border-l-2 border-transparent ${
                (option.value === (selectedValue ?? value)) && "text-primary bg-primary/10 border-l-2 !border-primary"
              }`}
            >
              {renderOption ? renderOption(option) : <SelectOptionItem option={option} />}
            </div>
          )) : <NothingFound className="static h-25" />}
        </div>
      </Modal>
    </div>
  );
});

SelectDropdown.displayName = "SelectDropdown";

const SelectOptionItem = ({ option }: { option: SelectOption }) => (
  <>
    {option.icon && <img loading="lazy" src={option.icon} className="w-8 h-8 rounded-full shrink-0" />}
    <span className="text-sm font-bold">{option.label || option.value}</span>
    {option.extra && <span className="ml-auto text-base-content/60 text-[13px] shrink-0">{option.extra}</span>}
  </>
);

const SelectTrigger = ({ option, placeholder }: { option: SelectOption | null; placeholder: string }) => (
  <>
    <div className="flex-1 text-left overflow-hidden">
      {option ? (
        <div className="flex items-center gap-2">
          {option.icon && <img loading="lazy" src={option.icon} alt="" className="h-6 w-6 rounded-full" />}
          <span className="flex-1 truncate">{option.label || option.value}</span>
        </div>
      ) : (
        <span className="text-base-content/50 font-semibold">{placeholder}</span>
      )}
    </div>
    <ChevronDown size={14} />
  </>
);

const SelectSkeleton = () => (
  <>
    <span className="skeleton bg-base-300 w-6 h-6 rounded-full" />
    <span className="skeleton bg-base-300 flex-1 rounded-lg h-6" />
  </>
);
