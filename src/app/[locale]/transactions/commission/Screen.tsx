import { requireAuth } from "@/lib/auth-guards";
import { CommissionSection } from "@/sections/profile/transactions/CommissionSection";
import { TransactionsPageShell } from "@/sections/profile/transactions";

export const beforeLoad = requireAuth;

export default function ScreenComponent() {
  return (
    <TransactionsPageShell>
      <CommissionSection />
    </TransactionsPageShell>
  );
}
