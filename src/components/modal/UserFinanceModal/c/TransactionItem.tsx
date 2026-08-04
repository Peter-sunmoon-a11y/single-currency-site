import { ReactNode } from "react";

export const TransactionItem = ({ label, value }: { label: ReactNode; value: ReactNode }) => {
  return (
    <div className="flex items-center justify-between text-xs text-base-content/50">
      <p className="font-semibold">{label}</p>
      <div className="font-bold">{value}</div>
    </div>
  );
};
