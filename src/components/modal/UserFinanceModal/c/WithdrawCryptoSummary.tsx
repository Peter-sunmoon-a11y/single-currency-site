import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import FormatAmount from "./FormatAmount";
import {
  DisplayContent
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";

export const WithdrawCryptoSummary = () => {
  const { t } = useTranslation();

  // from data store, share common data
  const { withdrawCrypto } = useBoundStore();

  // 手续费
  const withdrawalFee = useMemo(() => {
    return Decimal(withdrawCrypto.inputAmount || 0)
      .times(withdrawCrypto.network?.fee_rate || 0)
      .plus(withdrawCrypto.network?.fee_fix || 0)
      .toString();
  }, [withdrawCrypto]);

  // total withdraw amount 显示控制
  const totalWithdrawAmountControl = useMemo(() => {
    const max = withdrawCrypto.network?.max ?? 0;
    const d_amount = Decimal(withdrawCrypto.inputAmount || 0);
    return Decimal.min(d_amount, max);
  }, [withdrawCrypto.inputAmount, withdrawCrypto.network]);

  // 实际收到
  const withdrawAmountControl = useMemo(() => {
    const fee = totalWithdrawAmountControl.mul(withdrawCrypto.network?.fee_rate || 0).plus(withdrawCrypto.network?.fee_fix || 0);
    return Math.max(totalWithdrawAmountControl.sub(fee).toNumber(), 0).toString();
  }, [totalWithdrawAmountControl, withdrawCrypto.network]);

  if (!Decimal(withdrawCrypto.inputAmount || 0).gt(0)) return null;

  return (
    <div className="mb-1 bg-base-200 px-2 rounded-lg divide-y divide-dashed divide-base-content/20">
      <div className="flex items-center justify-between py-2">
        <span className="text-base-content/50 text-sm font-semibold">{t("finance:withdrawAmount")}</span>
        <span className="text-base-content text-sm font-bold flex items-center gap-1">
            <FormatAmount amount={withdrawAmountControl} decimals={withdrawCrypto.currency?.display_decimal} local />
          {withdrawCrypto.currency?.currency}
          </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-base-content/50 text-sm font-semibold">{t("finance:fee")}</span>
        <span className="text-base-content text-sm font-bold flex items-center gap-1">
            <FormatAmount amount={withdrawalFee} decimals={withdrawCrypto.currency?.display_decimal} local />
          {withdrawCrypto.currency?.currency}
          <DisplayContent status={Decimal(withdrawCrypto.network?.fee_rate || 0).gt(0)}>
              <div className="text-xs text-base-content/50">
                {`(${withdrawCrypto.network?.fee_rate * 100}% + ${withdrawCrypto.network?.fee_fix || 0})`}
              </div>
            </DisplayContent>
          </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-base-content/50 text-sm font-semibold">{t("finance:totalWithdrawAmount")}</span>
        <span className="text-base-content text-sm font-bold flex items-center gap-1">
            <FormatAmount amount={totalWithdrawAmountControl.toString()} local
                          decimals={withdrawCrypto.currency?.display_decimal} />
          {withdrawCrypto.currency?.currency}
          </span>
      </div>
    </div>
  );
};