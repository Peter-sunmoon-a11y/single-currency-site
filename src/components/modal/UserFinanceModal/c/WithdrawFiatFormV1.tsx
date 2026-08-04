import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { WithdrawFiatAmount } from "@/components/modal/UserFinanceModal/c/WithdrawFiatAmount.tsx";
import { WithdrawFiatFormInit } from "@/components/modal/UserFinanceModal/c/WithdrawFiatFormInit.tsx";
import { useFiatGatewayWithdrawParams } from "@/hooks/api/useAuth.ts";
import { createWithdrawFiatOrder } from "@/services/auth/wallet";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { ErrorString } from "@/store/type.ts";
import {
  DisplayContent,
  InnerFieldItem,
  InnerOptions,
  InnerUnnecessary
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { debug_target, open_debug } from "@/components/modal/UserFinanceModal/helper.ts";
import { fn_withdraw_common_status } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoAmount.tsx";
import { useRumSdkUserLog } from "@/utils/helper.ts";
import { isEmpty } from "@/utils/helper.ts";
import { InnerDisplayContent } from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import clsx from "clsx";
import Decimal from "decimal.js";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import { WithdrawMethodSelectV1 } from "@/components/modal/UserFinanceModal/c/WithdrawMethodSelectV1.tsx";

export const WithdrawFiatFormV1 = () => {
  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  // TODO: 可视区域过小的时候,需要腾出空间,避免影响用户的表单操作
  const [viewportHeight, setViewportHeight] = useState<number>(window.visualViewport?.height || window.innerHeight);

  const { rumCustomLog, rumException, rumResource } = useRumSdkUserLog();

  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat, openModal } = useBoundStore();

  // 获取取款网关必填字段
  const {
    data: fields
    // isLoading
  } = useFiatGatewayWithdrawParams(withdrawFiat.method?.gateway_id, withdrawFiat.method?.pay_bankcode);

  const formItem = useMemo(() => {
    let amountNode: React.ReactNode = null;
    let selectNode: React.ReactNode[] = [];
    let nodes: React.ReactNode[] = [];
    if (fields?.data) {
      const transform = fields.data;

      if (open_debug && debug_target === "WITHDRAW") {
        console.info(`WithdrawFiatFormV1:`);
        console.info(transform);
      }

      for (const key in transform) {
        const field = transform[key];

        if (field.hide) continue;

        if (!field.required && !field.hide && !field.select) {
          nodes.push(<InnerUnnecessary
            key={`${key}_${withdrawFiat.method?.gateway_id}`} // key 的不同可以强制重新挂载新数据，方便数据状态重置
            name={key}
            field={field}
            onChange={(v) => {
              setWithdrawFiat({
                extraItem: { [key]: v.value }
              });
            }} />);
          continue;
        }

        if (key === "amount") {
          amountNode = <WithdrawFiatAmount key="amount" formKey="amount" />;
          continue;
        }

        if (Array.isArray(field.select) && field.select.length > 0) {
          selectNode.push(
            <InnerOptions
              key={`${key}_${withdrawFiat.method?.gateway_id}`}
              name={key}
              field={field}
              onChange={(v) => {
                if (field.required) { // 必选
                  setWithdrawFiat({
                    formItem: { [key]: v.value },
                    [`${key}_error`]: v[`${key}_error`]
                  });
                } else { // 非必选
                  setWithdrawFiat({
                    extraItem: { [key]: v.value }
                  });
                }
              }} />
          );
          continue;
        }

        nodes.push(<InnerFieldItem
          key={`${key}_${withdrawFiat.method?.gateway_id}`}
          name={key}
          field={field}
          onChange={(v) => {
            setWithdrawFiat({
              formItem: { [key]: v.value },
              [`${key}_error`]: v[`${key}_error`]
            });
          }} />);
      }
    }

    return nodes.concat(selectNode, amountNode);
  }, [fields?.data, withdrawFiat.method?.gateway_id]);

  // 创建订单
  const createOrder = useCallback(async () => {
    set(true);

    const params = {
      ...withdrawFiat.formItem,
      // pin: md5(syncAction?.data),
      currency: withdrawFiat.currency?.currency,
      gateway_id: withdrawFiat.method?.gateway_id,
      pay_bankcode: withdrawFiat.method?.pay_bankcode
    };

    let url = "";
    let name = "";
      createWithdrawFiatOrder(params)
      .then((res) => {
        url = res?._request_url || "";
        name = res?._request_name || "";

        fn_withdraw_common_status(() => {

          // 提款订单提交成功
          if (res.code === 0 || res.code === 200) {
            openModal("OPEN_WITHDRAW_ORDER_OK_MODAL");

            // TODO rum 下单成功推送
            rumCustomLog(`Withdraw ${withdrawFiat.currency?.currency} ✅`, { url });
          }

          // 提款AML措施-错误提示
          if (res.code === 40021) {
            openModal("OPEN_FINANCE_AML_MODAL");
          }
        }, res.code, t);
      })
      .catch((error) => {
        toast.error(t("toast:failedToCreateWithdrawalOrder"));
        set(false);

        // 异常推送
        rumException(`Withdraw ${withdrawFiat.currency?.currency} ❌`, error);
      })
      .finally(() => {
        set(false);

        // TODO rum 资源访问推送
        rumResource({
          url,
          name,
          event: `Withdraw ${withdrawFiat.currency?.currency}`
        });
      });
  }, [openModal, t, withdrawFiat]);

  // 表单字段是否有错误
  const filed_value_null = useMemo(() => {
    return isEmpty(withdrawFiat.formItem) || (!!withdrawFiat.formItem && Object.values(withdrawFiat.formItem).some((value) => !value));
  }, [withdrawFiat.formItem]);

  // 表单字段是否有额外的错误
  const filed_value_error = useMemo(() => {
    const keys = Object.keys(withdrawFiat);
    return keys.filter((k) => k.includes("_error")).some((j) => withdrawFiat[j as ErrorString]);
  }, [withdrawFiat]);

  // 供应商不可用
  const provider_error = useMemo(() => {
    if (withdrawFiat.method) return withdrawFiat.method?.status === 0;
    return true;
  }, [withdrawFiat.method]);

  // 计算手续费
  const withdrawalFee = useMemo(() => {
    return Decimal(withdrawFiat.formItem?.amount || 0)
      .times(withdrawFiat.method?.fee_rate || 0)
      .plus(withdrawFiat.method?.fee_fix || 0)
      .toString();
  }, [withdrawFiat.method]);

  // total withdraw amount 显示控制
  const totalWithdrawAmountControl = useMemo(() => {
    const max = withdrawFiat.method?.max ?? 0;
    const d_amount = Decimal(withdrawFiat.formItem?.amount || 0);
    return Decimal.min(d_amount, max);
  }, [withdrawFiat.formItem, withdrawFiat.method]);

  // 实际收到
  const withdrawAmountControl = useMemo(() => {
    const fee = totalWithdrawAmountControl.mul(withdrawFiat.method?.fee_rate || 0).plus(withdrawFiat.method?.fee_fix || 0);
    return Math.max(totalWithdrawAmountControl.sub(fee).toNumber(), 0).toString();
  }, [totalWithdrawAmountControl, withdrawFiat.method]);

  // 事件通知
  // useEffect(() => {
  //   if (syncAction.type === "SYNC_WITHDRAW_FIAT_CREATE") void createOrder();
  // }, [syncAction]);

  // TODO: 可视区域过小的时候,需要腾出空间,避免影响用户的表单操作
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const height = window.visualViewport!.height;
      setViewportHeight(height);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  return (
    <WithdrawFiatFormInit>
      <div className="relative">
        <WithdrawMethodSelectV1 />

        {/* 通道在维护 */}
        <InnerDisplayContent show={Boolean(provider_error)}>
          <ErrorMessageBox
            sample
            className={"!mt-4"}
            content={<Trans
              i18nKey={"finance:withdraw_channel_under_maintenance"}
              values={{ channel: withdrawFiat.method?.display_name }}
              components={[<span className="underline font-bold" />]} />}
            show={Boolean(provider_error)} />
        </InnerDisplayContent>
      </div>

      {/* 表单 */}
      {formItem}

      {/*TODO: 可视区域过小的时候,需要腾出空间,避免影响用户的表单操作*/}
      <div className={clsx("w-full z-1", viewportHeight >= 700 && "sticky bottom-1")}>
        <div className="mb-1 bg-base-200 px-2 rounded-lg divide-y divide-dashed divide-base-content/20">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold text-base-content/50">{t("finance:withdrawAmount")}</span>
            <div className="text-sm font-bold flex items-center gap-1 text-base-content">
              <FormatAmount amount={withdrawAmountControl} decimals={withdrawFiat.currency?.display_decimal} local />
              {withdrawFiat.currency?.currency}
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-base-content/50 text-sm font-semibold">{t("finance:fee")}</span>
            <div className="text-base-content text-sm font-bold flex items-center gap-1">
              <FormatAmount amount={withdrawalFee} local decimals={withdrawFiat.currency?.display_decimal} />
              {withdrawFiat.currency?.currency}
              <DisplayContent status={Decimal(withdrawFiat.method?.fee_rate || 0).gt(0)}>
                <div className="text-[10px] text-base-content/50">
                  {`(${withdrawFiat.method?.fee_rate * 100}% + ${withdrawFiat.method?.fee_fix || 0})`}
                </div>
              </DisplayContent>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-base-content/50 text-sm font-semibold">{t("finance:totalWithdrawAmount")}</span>
            <div className="text-base-content text-sm font-bold flex items-center gap-1">
              <FormatAmount amount={totalWithdrawAmountControl.toString()} local
                            decimals={withdrawFiat.currency?.display_decimal} />
              {withdrawFiat.currency?.currency}
            </div>
          </div>
        </div>

        {/* 提交 */}
        <ConfirmBox
          loading={loading}
          disabled={filed_value_null || filed_value_error || provider_error}
          onClick={() => {
            void createOrder();
            // openModal("OPEN_WITHDRAW_FIAT_PIN_MODAL");
          }}
        >
          {t("finance:continue")}
        </ConfirmBox>
      </div>
    </WithdrawFiatFormInit>
  );
};
