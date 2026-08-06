import { requireAuth } from "@/lib/auth-guards";
import { ReferralSection } from "@/sections/profile/transactions/ReferralSection";
import { TransactionsPageShell } from "@/sections/profile/transactions";

export const beforeLoad = requireAuth;

export default function ScreenComponent() {
  return (
    <TransactionsPageShell>
      <ReferralSection />
    </TransactionsPageShell>
  );
}
