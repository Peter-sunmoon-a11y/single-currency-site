import { requireAuth } from "@/lib/auth-guards";
import { DepositSection } from "@/sections/profile/transactions/DepositSection";
import { TransactionsPageShell } from "@/sections/profile/transactions";

export const beforeLoad = requireAuth;

export default function ScreenComponent() {
  return (
    <TransactionsPageShell>
      <DepositSection />
    </TransactionsPageShell>
  );
}
