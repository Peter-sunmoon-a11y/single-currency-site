import { TransactionsTabs } from "@/components/transactions/TransactionsTabs";

export const TransactionsPageShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-4 flex flex-col gap-4">
      <TransactionsTabs />
      {children}
    </div>
  );
};
