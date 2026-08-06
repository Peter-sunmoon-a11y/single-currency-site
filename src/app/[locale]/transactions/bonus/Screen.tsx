import { requireAuth } from "@/lib/auth-guards";
import { BonusSection } from "@/sections/profile/transactions/BonusSection";
import { TransactionsPageShell } from "@/sections/profile/transactions";

export const beforeLoad = requireAuth;

export default function ScreenComponent() {
  return (
    <TransactionsPageShell>
      <BonusSection />
    </TransactionsPageShell>
  );
}
