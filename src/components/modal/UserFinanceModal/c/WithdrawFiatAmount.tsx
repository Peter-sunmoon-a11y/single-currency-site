import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { Wallet, Lock } from "lucide-react";
import { useAvailableBalance, useSupportedFiatWithdrawGatewaysV2 } from "@/components/modal/UserFinanceModal/helper.ts";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import FormatAmount from "./FormatAmount";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import {
  InnerErrorGapWrapper, InnerErrorWrapper,
  InnerProviderAmountRangeFormat
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { emitter } from "@/store/emitter.ts";
import { WithdrawRangeOptions } from "@/components/modal/UserFinanceModal/c/WithdrawRangeOptions.tsx";

export const WithdrawFiatAmount = ({ version = "V1", formKey }: {
  version?: "V1" | "V2",
  formKey: string
}) => {
  // FIXME: 目的 -> 用户触发了数量输入则使快捷选项失效
  const [withdrawRangeOptionsReset, setWithdrawRangeOptionsReset] = useState<number>(0);

  const { t } = useTranslation();

  // from data store, share common data
  const {
    withdrawFiat,
    withdrawFiatV2,
    resetWithdrawFiat,
    resetWithdrawFiatV2,
    setWithdrawFiat,
    setWithdrawFiatV2
  } = useBoundStore();
  const openWithdrawOrderOk = useBoundStore((state) => "OPEN_WITHDRAW_ORDER_OK_MODAL" in state.modals);

  // 区分 withdraw V1 V2 的数据控制源
  const source = version === "V1" ? withdrawFiat : withdrawFiatV2;

  // 区分 withdraw V1 V2 的数据操作源
  const operate = version === "V1" ? setWithdrawFiat : setWithdrawFiatV2;

  // 区分 withdraw V1 V2 的数据操作源
  const dataReset = version === "V1" ? resetWithdrawFiat : resetWithdrawFiatV2;

  // 获取支持法币提款的网关
  const { isLoading: isGatewaysLoading } = useSupportedFiatWithdrawGatewaysV2(withdrawFiat.currency?.currency);

  // 用户的可提款数量
  const availableAndLocked = useAvailableBalance(withdrawFiat.currency?.currency);

  // 小于最小提款数量限制错误
  const lessThanMinimum = useMemo(() => {
    return Decimal(availableAndLocked.available || 0).lt(source.method?.min ?? 0);
  }, [source.method, availableAndLocked.available]);

  // 计算快捷选项对应的提款 amount
  const calcWithdrawAmount = useCallback(
    (value: number) => {
      const min = source.method?.min ?? 0;
      const max = source.method?.max ?? 0;
      const balance = Decimal(availableAndLocked.available ?? 0);
      const final_max = balance.gt(max) ? Decimal(max) : balance;

      switch (value) {
        case 0:
          operate({ formItem: { [formKey]: balance.lt(min) ? 0 : min } });
          break;
        case 0.25:
          const de_25 = balance.mul(0.25);
          let de_25_final_value = de_25;
          if (de_25.lt(min)) de_25_final_value = Decimal(min);
          if (de_25.gt(final_max)) de_25_final_value = final_max;
          operate({ formItem: { [formKey]: de_25_final_value.floor().toString() } });
          break;
        case 0.5:
          const de_50 = balance.mul(0.5);
          let de_50_final_value = de_50;
          if (de_50.lt(min)) de_50_final_value = Decimal(min);
          if (de_50.gt(final_max)) de_50_final_value = final_max;
          operate({ formItem: { [formKey]: de_50_final_value.floor().toString() } });
          break;
        case 1:
          const de_100 = balance;
          let de_100_final_value = de_100;
          if (de_100.gt(final_max)) de_100_final_value = final_max;
          operate({ formItem: { [formKey]: de_100_final_value.floor().toString() } });
          break;
      }
    },
    [availableAndLocked.available, source.method]
  );

  // 用户提款输入值: 0 / ""
  const amountError = useMemo(() => {
    const d_amount = source.formItem?.amount;
    return !d_amount;
  }, [source.formItem?.amount]);

  // 提款范围错误提示
  const rangeError = useMemo(() => {
    const d_amount = Decimal(source.formItem?.amount || 0);
    return (
      d_amount.lt(source.method?.min ?? 0) || d_amount.gt(source.method?.max ?? 0)
    );
  }, [source.formItem, source.method]);

  // 输入的提款数量大于余额
  const insufficient = useMemo(() => {
    const d_amount = Decimal(source.formItem?.amount || 0);
    return d_amount.gt(0) && d_amount.gt(availableAndLocked.available || 0);
  }, [source.formItem?.amount, availableAndLocked.available]);

  useEffect(() => {
    operate({
      range_error: rangeError,
      amount_error: amountError,
      balance_error: insufficient,
      less_than_minimum_error: lessThanMinimum
    });
  }, [operate, rangeError, amountError, insufficient, lessThanMinimum]);

  // 事件通知 & 重置表单状态
  useEffect(() => {
    const events = ["CLOSE_FINANCE_MODAL"];
    const subs = events.map((eventName) =>
      emitter.addListener(eventName, () => {
        dataReset();
      })
    );

    return () => {
      subs.forEach((sub) => sub.remove());
    };
  }, [formKey]);

  // FIXME：未来优化掉 用 emitter
  useEffect(() => {
    if (openWithdrawOrderOk) {
      dataReset();
    }
  }, [dataReset, openWithdrawOrderOk]);

  // FIXME: 目的 -> 切换供应商/关闭finance 时候需要重置快捷按钮状态
  useEffect(() => {
    if (source.method?.id) setWithdrawRangeOptionsReset((v) => v + 1);

    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function() {
      setWithdrawRangeOptionsReset((v) => v + 1);
    });

    return () => em?.remove();
  }, [source.method?.id]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-base-content/50 font-semibold">
          <RequireItem label={t(`finance:amount`)} />
          <span className={'text-sm'}>
            {
              Decimal(source.method?.min || 0).gt(0)
                ? <InnerProviderAmountRangeFormat
                  min={source.method?.min}
                  max={source.method?.max}
                  currency={withdrawFiat.currency?.currency} />
                : <>0.00{' '}{withdrawFiat.currency?.currency}</>
            }
          </span>
        </div>

        {/* 数量输入快捷选项 */}
        <WithdrawRangeOptions
          key={withdrawRangeOptionsReset}
          onChange={(v) => {
            calcWithdrawAmount(v);
          }}
          disabled={isGatewaysLoading || lessThanMinimum || source.method?.status === 0}
        />

        <InnerErrorGapWrapper>
          <InnerErrorWrapper>
            <NumericFormat
              placeholder="0.00"
              value={source.formItem?.amount || ""}
              thousandSeparator={false}
              onValueChange={(values) => {
                operate({ formItem: { amount: values.value } });
              }}
              onFocus={() => {
                setWithdrawRangeOptionsReset((v) => v + 1);
              }}
              disabled={lessThanMinimum}
              decimalScale={0}
              wrapCls={'bg-base-200 h-12'}
              suf={withdrawFiat.currency?.currency}
            />

            {/* 余额不在最小范围 */}
            <ErrorMessageBox show={lessThanMinimum && Decimal(source.formItem?.amount || 0).gt(0)}
                             content={t("finance:theBalanceDoesNotReachTheMinimumWithdrawalLimit")} />
            {/* 余额不足 */}
            <ErrorMessageBox show={insufficient}
                             content={t("finance:insufficient_balance")} />

            {/* 范围错误 */}
            <ErrorMessageBox
              show={rangeError && !insufficient && !lessThanMinimum}
              content={<span>
            {t("finance:pleaseEnterAnAmountBetween")}{" "}
                <InnerProviderAmountRangeFormat
                  min={source.method?.min}
                  max={source.method?.max}
                  currency={withdrawFiat.currency?.currency} />
          </span>}
            />
          </InnerErrorWrapper>
        </InnerErrorGapWrapper>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-base-content/50 text-sm flex items-center gap-1">
          <Wallet className="w-3.5 h-3.5 shrink-0" />
          <FormatAmount amount={availableAndLocked.available} local
                        decimals={withdrawFiat.currency?.display_decimal} />{" "}
          {withdrawFiat.currency?.currency}
        </span>
        <span className="text-base-content/50 text-sm flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <FormatAmount amount={availableAndLocked.locked} local
                        decimals={withdrawFiat.currency?.display_decimal} />{" "}
          {withdrawFiat.currency?.currency}
        </span>
      </div>
    </>
  );
};
