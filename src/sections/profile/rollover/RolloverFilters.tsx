import { useTranslation } from "@/lib/i18n/react-i18next";
import type { RolloverStatusKey, RolloverTypeKey } from "./types";
import { FormBox } from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { SelectDropdown } from "@/components/modal/UserFinanceModal/c/SelectDropdown.tsx";

interface RolloverFiltersProps {
  selectedType: RolloverTypeKey;
  selectedStatus: RolloverStatusKey;
  onTypeChange: (value: RolloverTypeKey) => void;
  onStatusChange: (value: RolloverStatusKey) => void;
}

export function RolloverFilters({
  selectedType,
  selectedStatus,
  onTypeChange,
  onStatusChange,
}: RolloverFiltersProps) {
  const { t } = useTranslation();

  const typeOptions = [
    { id: "all", value: "All", label: t("transaction:filters.allTypes") },
    { id: "deposit", value: "Deposit", label: t("transaction:transactionTypes.deposit") },
    { id: "bonus", value: "Bonus", label: t("transaction:transactionTypes.bonus") },
  ];

  const statusOptions = [
    { id: "all_statuses", value: "All Statuses", label: t("transaction:filters.allStatuses") },
    { id: "not_started", value: "Not Started", label: t("transaction:transactionStatus.notStarted") },
    { id: "ongoing", value: "Ongoing", label: t("transaction:transactionStatus.ongoing") },
    { id: "done", value: "Done", label: t("transaction:transactionStatus.done") },
  ];

  return (
    <div className="flex flex-col gap-2">
      <FormBox label={t("transaction:filters.type", "Type")}>
        <SelectDropdown
          options={typeOptions}
          value={selectedType}
          title={t("transaction:filters.type", "Type")}
          onChange={(value) => onTypeChange(value as RolloverTypeKey)}
        />
      </FormBox>
      <FormBox label={t("transaction:filters.status", "Status")}>
        <SelectDropdown
          options={statusOptions}
          value={selectedStatus}
          title={t("transaction:filters.status", "Status")}
          onChange={(value) => onStatusChange(value as RolloverStatusKey)}
        />
      </FormBox>
    </div>
  );
}
