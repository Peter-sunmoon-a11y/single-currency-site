import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { DepositFiatAmount } from "@/components/modal/UserFinanceModal/c/DepositFiatAmount.tsx";
import {
  DepositFiatFormInit
} from "@/components/modal/UserFinanceModal/c/DepositFiatFormInit.tsx";
import { useFiatGatewayDepositParams } from "@/hooks/api/useAuth.ts";
import { createFiatDepositOrder } from "@/services/auth/wallet";
import { getUserProfile } from "@/services/auth/user";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import clsx from "clsx";
import { ErrorString } from "@/store/type.ts";
import {
  InnerFieldItem,
  InnerOptions,
  InnerUnnecessary
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { isROIBEST, useRumSdkUserLog, rumException } from "@/utils/helper.ts";
import { isEmpty } from "@/utils/helper.ts";
import { emitter } from "@/store/emitter.ts";
import { openExternalUrl } from "@/utils/telegramWebApp";
import { DepositFiatSummary } from "@/components/modal/UserFinanceModal/c/DepositFiatSummary.tsx";
import {
  SecurityCheck,
  SecurityStep,
  SecurityStepStatus
} from "@/components/modal/UserFinanceModal/c/SecurityCheck.tsx";

export const DepositFiatForm = ({ extraNode }: { extraNode?: ReactNode }) => {

  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  const INITIAL_STEPS: SecurityStep[] = [
    { labelKey: "finance:securityCheck_encrypting", status: "idle" },
    { labelKey: "finance:securityCheck_identity", status: "idle" },
    { labelKey: "finance:securityCheck_processing", status: "idle" }
  ];

  const [securitySteps, setSecuritySteps] = useState<SecurityStep[]>(INITIAL_STEPS);

  const updateStep = useCallback((index: number, status: SecurityStepStatus) => {
    setSecuritySteps(prev => prev.map((s, i) => i === index ? { ...s, status } : s));
  }, []);

  // 键盘弹起时取消吸底，避免遮挡表单输入区域
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => setKeyboardVisible(vv.height < window.innerHeight * 0.75);
    vv.addEventListener("resize", handler);
    return () => vv.removeEventListener("resize", handler);
  }, []);

  const { rumCustomLog, rumResource } = useRumSdkUserLog();

  // from data store, share common data
  const { depositFiat, setDepositFiat, openModal, startDepositBalanceSync, stopDepositBalanceSync } = useBoundStore();

  // 网关必填字段
  const { data: fields } = useFiatGatewayDepositParams(depositFiat.method?.gateway_id, depositFiat.method?.pay_bankcode);

  // 客户端可见的表单生成
  const formItem = useMemo(() => {
    let amountNode: React.ReactNode = null;
    let selectNode: React.ReactNode[] = [];
    let nodes: React.ReactNode[] = [];
    if (fields?.data) {
      const transform = fields.data;

      for (const key in transform) {
        const field = transform[key];

        if (field.hide) continue;

        if (!field.required && !field.hide && !field.select) {
          nodes.push(
            <div key={`${key}_${depositFiat.method?.gateway_id}`} data-field-key={key}
                 className="-mx-2 px-2 -mt-1 pt-1 -mb-2 pb-2 rounded-lg transition-colors duration-300">
              <InnerUnnecessary
                name={key}
                field={field}
                onChange={(v) => {
                  setDepositFiat({ extraItem: { [key]: v.value } });
                }} />
            </div>
          );
          continue;
        }

        if (key === "amount") {
          amountNode = (
            <div key="amount" data-field-key="amount"
                 className="-mx-2 px-2 -mt-1 pt-1 -mb-2 pb-2 rounded-lg transition-colors duration-300">
              <DepositFiatAmount multiple={field?.multiple} />
            </div>
          );
          continue;
        }

        if (Array.isArray(field.select) && field.select.length > 0) {
          selectNode.push(
            <div key={`${key}_${depositFiat.method?.gateway_id}`} data-field-key={key}
                 className="-mx-2 px-2 -mt-1 pt-1 -mb-2 pb-2 rounded-lg transition-colors duration-300">
              <InnerOptions
                name={key}
                field={field}
                onChange={(v) => {
                  if (field.required) {
                    setDepositFiat({
                      formItem: { [key]: v.value },
                      [`${key}_error`]: v[`${key}_error`]
                    });
                  } else {
                    setDepositFiat({ extraItem: { [key]: v.value } });
                  }
                }} />
            </div>
          );
          continue;
        }

        nodes.push(
          <div key={`${key}_${depositFiat.method?.gateway_id}`} data-field-key={key}
               className="-mx-2 px-2 -mt-1 pt-1 -mb-2 pb-2 rounded-lg transition-colors duration-300">
            <InnerFieldItem
              name={key}
              field={field}
              onChange={(v) => {
                setDepositFiat({
                  formItem: { [key]: v.value },
                  [`${key}_error`]: v[`${key}_error`]
                });
              }} />
          </div>
        );
      }
    }

    // 控制表单的显示顺序
    return nodes.concat(selectNode, amountNode);
  }, [fields, depositFiat.method?.gateway_id]);

  // 创建订单（三步安全检测）
  const createOrder = useCallback(async () => {
    set(true);
    setSecuritySteps(INITIAL_STEPS);

    // ── Step 0：数据加密准备 ─────────────────────────────
    updateStep(0, "running");
    // 短延迟模拟数据准备（HTTPS 加密本身是透明的，给用户明确感知）
    await new Promise<void>((r) => setTimeout(r, 500));
    updateStep(0, "done");
    await new Promise<void>((r) => setTimeout(r, 350));

    // ── Step 1：身份核验（真实 API） ──────────────────────
    updateStep(1, "running");
    try {
      const profile = await getUserProfile();
      if (profile.code !== 0 && profile.code !== 200) {
        updateStep(1, "failed");
        toast.error(t("toast:accountVerificationFailed"));
        set(false);
        return;
      }
      updateStep(1, "done");
      await new Promise<void>((r) => setTimeout(r, 350));
    } catch {
      updateStep(1, "failed");
      toast.error(t("toast:accountVerificationFailed"));
      set(false);
      return;
    }

    // ── Step 2：提交订单（真实 API） ──────────────────────
    updateStep(2, "running");

    const params: Record<string, any> = {
      ...depositFiat.formItem,
      gateway_id: depositFiat.method?.gateway_id,
      return_url: isROIBEST() ? `${location.origin}${location.pathname}` : location.origin,
      pay_bankcode: depositFiat.method?.pay_bankcode
    };

    let url = "";
    let name = "";

    try {
      const { code, data, _request_url, _request_name } = await createFiatDepositOrder(params);
      url = _request_url || "";
      name = _request_name || "";

      if (code === 0 || code === 200) {
        updateStep(2, "done");
        if (data.payment_url) {
          startDepositBalanceSync();
          openExternalUrl(data.payment_url);
        } else if (params?.payType === "2") {
          toast.success(t("toast:succeedToCreateDepositOrder"));
        } else {
          toast.error(t("toast:paymentUrlNotFound"));
        }
        rumCustomLog(`Deposit ${depositFiat.currency?.currency} ✅`, { url });
      } else if (code === 40021) {
        updateStep(2, "failed");
        openModal("OPEN_FINANCE_AML_MODAL");
      } else {
        updateStep(2, "failed");
        toast.error(t("toast:failedToCreateDepositOrder"));
      }
    } catch (error) {
      updateStep(2, "failed");
      toast.error(t("toast:failedToCreateDepositOrder"));
      rumException(`Deposit ${depositFiat.currency?.currency} ❌`, error);
    } finally {
      set(false);
      rumResource({ url, name, event: `Deposit ${depositFiat.currency?.currency}` });
    }
  }, [t, depositFiat, updateStep, startDepositBalanceSync]);

  // 表单字段是否有错误
  const filed_value_null = useMemo(() => {
    return isEmpty(depositFiat.formItem) || (!!depositFiat.formItem && Object.values(depositFiat.formItem).some((value) => !value));
  }, [depositFiat.formItem]);

  // 表单字段是否有额外的错误
  const filed_value_error = useMemo(() => {
    const keys = Object.keys(depositFiat);
    return keys.filter((k) => k.includes("_error")).some((j) => depositFiat[j as ErrorString]);
  }, [depositFiat]);

  // 供应商不可用错误
  const provider_error = useMemo(() => {
    if (depositFiat.method) return depositFiat.method?.status === 0;
  }, [depositFiat.method]);

  // 滚动到第一个有问题的字段并高亮
  const scrollToFirstError = useCallback(() => {
    if (!formRef.current || !fields?.data) return;

    let firstBadKey: string | null = null;
    for (const key in fields.data) {
      const field = fields.data[key];
      if (field.hide) continue;
      if (depositFiat[`${key}_error` as ErrorString]) {
        firstBadKey = key;
        break;
      }
      if (field.required && !depositFiat.formItem?.[key]) {
        firstBadKey = key;
        break;
      }
    }
    if (!firstBadKey) return;

    const el = formRef.current.querySelector(`[data-field-key="${firstBadKey}"]`) as HTMLElement | null;
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("bg-primary/35");
    setTimeout(() => el.classList.remove("bg-primary/35"), 1000);
  }, [fields, depositFiat]);

  // 提交前校验：有错误则定位，无错误则下单
  const handleSubmitAttempt = useCallback(() => {
    if (filed_value_null || filed_value_error) {
      scrollToFirstError();
      return;
    }
    if (Boolean(provider_error)) {
      toast.error(<Trans
        i18nKey={"finance:channel_under_maintenance"}
        values={{ channel: depositFiat.method?.display_name }}
        components={[<span className="underline font-bold" />]} />);
      return;
    }
    void createOrder();
  }, [filed_value_null, filed_value_error, provider_error, scrollToFirstError, createOrder, depositFiat.method?.display_name]);

  // 事件通知
  useEffect(() => {
    const em = emitter.addListener("SYNC_DEPOSIT_FIAT_CREATE", function() {
      handleSubmitAttempt();
    });

    return () => em?.remove();
  }, [handleSubmitAttempt]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      stopDepositBalanceSync();
    };
  }, [stopDepositBalanceSync]);

  return (
    <DepositFiatFormInit>
      {/* 安全检测过渡层 */}
      <div className="flex flex-col gap-4">
        <SecurityCheck visible={loading} steps={securitySteps} />

        {/* 表单 */}
        <div ref={formRef} className={"flex flex-col gap-4"}>{formItem}</div>

        {extraNode}

        <div className={clsx("w-full z-1", !keyboardVisible && "sticky bottom-1")}>
          {/* Fiat 订单汇总 */}
          <DepositFiatSummary />

          {/* 提交 Fiat 存款 */}
          <div className="rounded-lg">
            <ConfirmBox
              loading={loading}
              onClick={() => handleSubmitAttempt()}
            >
              {t("finance:continue")}
            </ConfirmBox>
          </div>
        </div>
      </div>
    </DepositFiatFormInit>
  );
};
