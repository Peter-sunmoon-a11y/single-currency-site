import { Modal } from "@/components/ui/Modal";
import type { RolloverDetailViewModel } from "./RolloverDetailMapper";
import { useTranslation } from "@/lib/i18n/react-i18next";

type RolloverDetailsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  detail: RolloverDetailViewModel | null;
};

export function RolloverDetailsDialog({ isOpen, onClose, detail }: RolloverDetailsDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("profile:rolloverDetails", "Rollover Details")}
      position="modal-middle"
    >
      <div className="text-2xl font-bold text-primary text-center">{detail?.amountLabel}</div>

      <div className="text-sm space-y-2">
        {(detail?.infoRows ?? []).map((row, index) => (
          <InfoRow key={`${row.label}-${index}`} label={row.label} value={row.value} />
        ))}
      </div>
    </Modal>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-base-content/60">{label}</span>
    <span className="font-bold text-base-content text-right">{value}</span>
  </div>
);

