import clsx from "clsx";
import { Modal } from "@/components/ui/Modal";
import Copy from "@/components/ui/Copy";
import type { TransactionDetailViewModel } from "./TransactionDetailMapper";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

type TransactionDetailsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  detail: TransactionDetailViewModel | null;
};

export function TransactionDetailsDialog({ isOpen, onClose, detail }: TransactionDetailsDialogProps) {
  const { t } = useTranslation();

  if (!detail) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("transaction:details.title")}
      position="modal-middle"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-2xl font-bold text-primary">{detail.amountLabel}</div>
        </div>

        <div className="rounded-lg bg-base-200 p-2 text-sm space-y-1">
          {detail.infoRows.map((row) => (
            <InfoRow key={`${row.label}-${row.value}`} label={row.label} value={row.value} />
          ))}
        </div>

        {detail.timeline.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-base-content/50">
              {t("transaction:details.transactionProgress")}
            </label>
            <ul className="steps steps-vertical">
              {detail.timeline.map((step, index) => (
                <TimelineStep
                  key={`${step.label}-${index}`}
                  completed={step.completed}
                  stepNumber={index + 1}
                  label={step.label}
                  description={step.description}
                />
              ))}
            </ul>
          </div>
        )}

        {detail.orderId ? <CopyField label={t("transaction:details.orderId")} value={detail.orderId} /> : null}
        {detail.showTransactionHash && (
          <CopyField 
            label={t("transaction:details.transactionHash")} 
            value={detail.transactionId || "N/A"} 
            obfuscate={!!detail.transactionId} 
            disableCopy={!detail.transactionId}
          />
        )}

        <button type="button" className="btn btn-primary" onClick={onClose}>
          {t("common:common.close", "Close")}
        </button>
      </div>
    </Modal>
  );
}

const TimelineStep = ({
  completed,
  label,
  description,
  stepNumber,
}: {
  completed: boolean;
  label: string;
  description?: string;
  stepNumber: number;
}) => (
  <li
    data-content={completed ? "✓" : String(stepNumber)}
    className={clsx(
      "step mb-2 last:mb-0 text-left text-base-content before:!w-1 before:!origin-bottom after:!h-6 after:!w-6 after:text-[14px] after:!flex after:!items-center after:!justify-center after:!content-[attr(data-content)] first:before:!h-0",
      completed
        ? "step-primary before:!bg-primary before:!border-primary after:!bg-primary after:!border-primary after:!text-black"
        : "step-neutral before:!bg-base-300 before:!border-base-300 after:!bg-base-300 after:!border-base-300 after:!text-base-content/60",
    )}
  >
    <div className="flex flex-col gap-1">
      <p className="text-sm font-bold text-base-content text-left">{label}</p>
      {description ? <p className="text-xs text-base-content/50">{description}</p> : null}
    </div>
  </li>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="text-base-content/60 font-semibold">{label}</span>
    <span className="font-bold text-base-content text-right">{value}</span>
  </div>
);

const CopyField = ({ label, value, obfuscate }: { label: string; value: string; obfuscate?: boolean; disableCopy?: boolean }) => {
  const displayValue = obfuscate && value.length > 12 ? `${value.slice(0, 6)}...${value.slice(-6)}` : value;
  return (

    <>
      <div className={clsx("w-full input h-10 border-none flex items-center pr-1", "bg-base-200")}>
        <div className="gap-2 flex items-center h-full flex-1 min-w-0 overflow-x-auto hide-scrollbar">
          {label}<TextBaseContent text={displayValue} className={"!whitespace-nowrap"} />
        </div>
        <Copy text={displayValue} />
      </div>
    </>
  );
};
