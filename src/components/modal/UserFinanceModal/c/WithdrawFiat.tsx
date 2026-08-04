import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { WithdrawFiatFormV1 } from "@/components/modal/UserFinanceModal/c/WithdrawFiatFormV1.tsx";
import { WithdrawFiatFormV2 } from "@/components/modal/UserFinanceModal/c/WithdrawFiatFormV2.tsx";
import { useBoundStore } from "@/store";
import { useSupportedFiatWithdrawGatewaysV2 } from "@/components/modal/UserFinanceModal/helper.ts";
import { WithdrawFiatSelect } from "@/components/modal/UserFinanceModal/c/Case.tsx";

export const WithdrawFiat = () => {
  // from data store, share common data
  const { withdrawFiat } = useBoundStore();

  // 法币是否支持新版的提币操作
  const { data: gatewaysV2, isLoading } = useSupportedFiatWithdrawGatewaysV2(withdrawFiat.currency?.currency);

  return (
    <div className="flex flex-col gap-4">
      {/* 币种选择 */}
      <WithdrawFiatSelect />

      {/* 动态表单 */}
      <SmallLoading loading={isLoading} content={gatewaysV2?.is_new === 0
        ? <WithdrawFiatFormV1 />
        : <WithdrawFiatFormV2 />} className={"h-52 !rounded-lg"} />
    </div>
  );
};
