import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useFiatGatewayWithdrawParams } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import { PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { handleBindOrHideFormItemDefaultValue } from "@/components/modal/UserFinanceModal/c/DepositFiatFormInit.tsx";
import { emitter } from "@/store/emitter.ts";
import { useSupportedFiatWithdrawGatewaysV1 } from "@/components/modal/UserFinanceModal/helper.ts";

export const WithdrawFiatFormInit = (props: PropsWithChildren) => {
  // from data store, share common data
  const { withdrawFiat, setWithdrawFiat } = useBoundStore();
  const openWithdrawOrderOk = useBoundStore((state) => "OPEN_WITHDRAW_ORDER_OK_MODAL" in state.modals);

  // 获取支持网关
  const { data: gateways, isLoading: l1 } = useSupportedFiatWithdrawGatewaysV1(withdrawFiat.currency?.currency);

  // 获取必填字段
  const {
    data: fields,
    isLoading: l2
  } = useFiatGatewayWithdrawParams(withdrawFiat.method?.gateway_id, withdrawFiat.method?.pay_bankcode);

  // 支付通道对应的表单项生成之后安全加载表单内容
  const memoFields = useMemo(() => {
    return <SmallLoading loading={!withdrawFiat.formItem} content={props?.children} className="h-52" />;
  }, [withdrawFiat.formItem, props?.children]);

  // 币种有支付通道才可以继续后续步骤
  const memoGateways = useMemo(() => {
    return gateways?.data?.length === 0 ? null : memoFields;
  }, [gateways, memoFields]);

  // 初始化表单项
  const initFormFields = useCallback(() => {
    if (fields?.data) {
      const transform = fields.data;
      const nextFormItem: Record<string, string> = {};

      for (const key in transform) {
        const field = transform[key];

        if (!field.required && !field.hide) {
          setWithdrawFiat({ extraItem: { [key]: field.default || "" } });
          continue;
        }

        if (field.bind || field.hide) {
          const value = handleBindOrHideFormItemDefaultValue(field, withdrawFiat.method);
          nextFormItem[key] = value || "";
          continue;
        }

        if (Array.isArray(field.select) && field.select.length > 0 && field.required) {
          nextFormItem[key] = field.default;
          continue;
        }

        nextFormItem[key] = field.default || "";
      }

      setWithdrawFiat({ formItem: nextFormItem });
    }
  }, [fields?.data]);

  useEffect(() => {
    initFormFields();
  }, [initFormFields]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    const events = ["CLOSE_FINANCE_MODAL"];
    const subs = events.map((eventName) =>
      emitter.addListener(eventName, () => {
        initFormFields();
      })
    );
    return () => {
      subs.forEach((sub) => sub.remove());
    };
  }, [initFormFields]);

  // TODO：未来优化掉 用 emitter
  useEffect(() => {
    if (openWithdrawOrderOk) initFormFields();
  }, [initFormFields, openWithdrawOrderOk]);

  return <SmallLoading loading={l1 || l2} content={memoGateways} className="h-52" />
};
