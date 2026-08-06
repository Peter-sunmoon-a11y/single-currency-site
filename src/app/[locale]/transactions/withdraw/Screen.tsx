import { requireAuth } from "@/lib/auth-guards";
import { WithdrawSection } from "@/sections/profile/transactions/WithdrawSection";
import { TransactionsPageShell } from "@/sections/profile/transactions";

export const beforeLoad = requireAuth;

export default function ScreenComponent() {
  return (
    <TransactionsPageShell>
      <WithdrawSection />
    </TransactionsPageShell>
  );
}
