import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useFiatGatewayDepositParams, useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { useBoundStore } from "@/store";
import { PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import { emitter } from "@/store/emitter.ts";
import { isEmpty } from "@/utils/helper.ts";

export const DepositFiatFormInit = (props: PropsWithChildren) => {
  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  // 获取支持网关
  const { data: gateways, isLoading: l1 } = useSupportedFiatDepositGateways(depositFiat.currency?.currency);

  // 获取必填字段
  const {
    data: fields,
    isLoading: l2
  } = useFiatGatewayDepositParams(depositFiat.method?.gateway_id, depositFiat.method?.pay_bankcode);

  // 初始化表单项 & 重置表单项
  const initFormFields = useCallback(() => {
    if (fields?.data) {
      const transform = fields.data;
      for (const key in transform) {
        const field = transform[key];

        if (!field.required && !field.hide) {
          setDepositFiat({ extraItem: { [key]: field.default || "" } });
          continue;
        }

        if (field.bind || field.hide) {
          const value = handleBindOrHideFormItemDefaultValue(field, depositFiat.method);
          setDepositFiat({ formItem: { [key]: value || "" } });
          continue;
        }

        if (Array.isArray(field.select) && field.select.length > 0) {
          setDepositFiat({ formItem: { [key]: field.default || field.select[0].value } });
          continue;
        }

        setDepositFiat({ formItem: { [key]: field.default || "" } });
      }
    }
  }, [depositFiat.method, fields, setDepositFiat]);

  // 初始化表单项
  useEffect(() => {
    initFormFields();
  }, [initFormFields]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function() {
      initFormFields();
    });

    return () => em?.remove();
  }, [initFormFields]);

  // 支付通道对应的表单项生成之后安全加载表单内容
  const memoFields = useMemo(() => {
    return !fields?.data || !isEmpty(depositFiat.formItem) ? props?.children : null;
  }, [depositFiat.formItem, fields?.data, props?.children]);

  // 币种有支付通道才可以继续后续步骤
  const memoGateways = useMemo(() => {
    return gateways?.data?.length === 0 ? null : memoFields;
  }, [gateways?.data?.length, memoFields]);

  return <SmallLoading loading={l1 || l2} content={memoGateways} className={'h-52 !rounded-lg'} />;
};

export function handleBindOrHideFormItemDefaultValue(field: Record<string, any>, data: Record<string, any> | null) {
  if (field.bind && data && Object.prototype.hasOwnProperty.call(data, field.bind)) {
    return data[field.bind];
  }
  return field.default;
}
