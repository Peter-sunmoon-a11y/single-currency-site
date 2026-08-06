import { requireAuth } from "@/lib/auth-guards";
import { SwapSection } from "@/sections/profile/transactions/SwapSection";
import { TransactionsPageShell } from "@/sections/profile/transactions";

export const beforeLoad = requireAuth;

export default function ScreenComponent() {
  return (
    <TransactionsPageShell>
      <SwapSection />
    </TransactionsPageShell>
  );
}
