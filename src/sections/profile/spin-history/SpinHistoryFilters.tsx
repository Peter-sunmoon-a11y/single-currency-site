import { useTranslation } from "@/lib/i18n/react-i18next";
import type { StatusFilter, StatusOption } from "./types";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";

interface SpinHistoryFiltersProps {
  statusFilter: StatusFilter;
  statusOptions: StatusOption[];
  onStatusChange: (value: StatusFilter) => void;
}

export const SpinHistoryFilters = ({ statusFilter, statusOptions, onStatusChange }: SpinHistoryFiltersProps) => {
  const { t } = useTranslation("profile");

  const options = statusOptions.map((o, i) => ({
    id: String(i),
    value: o.value,
    label: o.label,
  }));

  return (
    <FormBox label={""}>
      <SelectDropdown
        options={options}
        value={statusFilter}
        title={t("profile:spinHistory.statusFilterLabel", "Status")}
        onChange={(value) => onStatusChange(value as StatusFilter)}
      />
    </FormBox>
  );
};
