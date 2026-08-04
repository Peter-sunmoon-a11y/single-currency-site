import { WithdrawAddressAdd } from "@/components/modal/UserFinanceModal/c/WithdrawAddressAdd.tsx";
import { WithdrawCryptoAmount } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoAmount.tsx";
import { WithdrawCryptoSelect } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoSelect.tsx";
import { useEffect } from "react";
import { useBoundStore } from "@/store";
import { emitter } from "@/store/emitter.ts";

export const WithdrawCrypto = () => {
  const { resetWithdrawCrypto } = useBoundStore();

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function() {
      resetWithdrawCrypto();
    });

    return () => em?.remove();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <WithdrawCryptoSelect />
      <WithdrawAddressAdd />
      <WithdrawCryptoAmount />
    </div>
  );
};
