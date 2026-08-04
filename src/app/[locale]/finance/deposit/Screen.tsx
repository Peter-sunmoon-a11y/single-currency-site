import { Deposit } from "@/components/modal/UserFinanceModal/Deposit";
import { FinanceShell } from "../FinanceShell";

export const beforeLoad = undefined;

const ScreenComponent = () => (
  <FinanceShell>
    <Deposit />
  </FinanceShell>
);

export default ScreenComponent;
