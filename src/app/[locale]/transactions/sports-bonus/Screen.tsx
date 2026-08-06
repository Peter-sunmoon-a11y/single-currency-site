import { requireAuth } from "@/lib/auth-guards";
import { SportsBonusStoreSection } from "@/sections/profile/transactions/SportsBonusStoreSection";
import { TransactionsPageShell } from "@/sections/profile/transactions";

export const beforeLoad = requireAuth;

export default function ScreenComponent() {
  return (
    <TransactionsPageShell>
      <SportsBonusStoreSection />
    </TransactionsPageShell>
  );
}
