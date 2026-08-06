import { requireAuth } from "@/lib/auth-guards";
import { BonusStoreSection } from "@/sections/profile/transactions/BonusStoreSection";
import { TransactionsPageShell } from "@/sections/profile/transactions";

export const beforeLoad = requireAuth;

export default function ScreenComponent() {
  return (
    <TransactionsPageShell>
      <BonusStoreSection />
    </TransactionsPageShell>
  );
}
