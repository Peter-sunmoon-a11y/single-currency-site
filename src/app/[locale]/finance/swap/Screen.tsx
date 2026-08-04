import { Swap } from "@/components/modal/UserFinanceModal/Swap";
import { FinanceShell } from "../FinanceShell";

export const beforeLoad = undefined;

const ScreenComponent = () => (
  <FinanceShell>
    <Swap open={true} />
  </FinanceShell>
);

export default ScreenComponent;
