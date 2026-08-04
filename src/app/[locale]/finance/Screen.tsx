"use client";

import { useSearchParams } from "next/navigation";
import { Deposit } from "@/components/modal/UserFinanceModal/Deposit";
import { Swap } from "@/components/modal/UserFinanceModal/Swap";
import { Withdraw } from "@/components/modal/UserFinanceModal/Withdraw";
import { FinanceShell } from "./FinanceShell";
export { IconDeposit, IconSwap, IconWithdraw } from "./icons";

export const beforeLoad = undefined;

function FinanceHomeScreen() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  return (
    <FinanceShell>
      {tab === "withdraw" ? <Withdraw /> : tab === "swap" ? <Swap open /> : <Deposit />}
    </FinanceShell>
  );
}

export default FinanceHomeScreen;
