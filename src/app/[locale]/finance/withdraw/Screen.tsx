import { Withdraw } from "@/components/modal/UserFinanceModal/Withdraw";
import { FinanceShell } from "../FinanceShell";

export const beforeLoad = undefined;

const ScreenComponent = () => (
  <FinanceShell>
    <Withdraw />
  </FinanceShell>
);

export default ScreenComponent;
