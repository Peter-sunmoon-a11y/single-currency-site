import { ConfirmBox } from "@/components/modal/UserFinanceModal/c/ConfirmBox.tsx";
import { WithdrawFiatAmount } from "@/components/modal/UserFinanceModal/c/WithdrawFiatAmount.tsx";
import { createWithdrawFiatOrderV2 } from "@/services/auth/wallet";
import { useBoundStore } from "@/store";
import { useToggle } from "@/hooks/useToggle";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "@/lib/i18n/react-i18next";
import { toast } from "sonner";
import { ErrorString } from "@/store/type.ts";
import {
  InnerDisplayContent,
  WithdrawMethodInfoAdd
} from "@/components/modal/UserFinanceModal/c/WithdrawMethodInfoAdd.tsx";
import {
  useUserWithdrawFiatInfo
} from "@/components/modal/UserFinanceModal/helper.ts";
import {
  DisplayContent
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { fn_withdraw_common_status } from "@/components/modal/UserFinanceModal/c/WithdrawCryptoAmount.tsx";
import { useRumSdkUserLog, rumException } from "@/utils/helper.ts";
import { emitter } from "@/store/emitter.ts";
import { isEmpty } from "@/utils/helper.ts";
import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import FormatAmount from "@/components/modal/UserFinanceModal/c/FormatAmount";
import Decimal from "decimal.js";
import clsx from "clsx";

export const WithdrawFiatFormV2 = () => {
  const { t } = useTranslation();

  const [loading, { set }] = useToggle<boolean>(false);

  // TODO: 可视区域过小的时候,需要腾出空间,避免影响用户的表单操作
  const [viewportHeight, setViewportHeight] = useState<number>(window.visualViewport?.height || window.innerHeight);

  const { rumCustomLog, rumResource } = useRumSdkUserLog();

  // from data store, share common data
  const { withdrawFiat, withdrawFiatV2, setWithdrawFiatV2, openModal } = useBoundStore();

  // 法币提现用用户添加的快捷信息列表
  const { data: wallets, isLoading: fiatInfoLoading } = useUserWithdrawFiatInfo(withdrawFiat.currency?.currency);

  // 表单字段是否有错误
  const filed_value_null = useMemo(() => {
    return isEmpty(withdrawFiatV2.formItem) || (!!withdrawFiatV2.formItem && Object.values(withdrawFiatV2.formItem).some((value) => !value));
  }, [withdrawFiatV2.formItem]);

  // 表单字段是否有额外的错误
  const filed_value_error = useMemo(() => {
    const keys = Object.keys(withdrawFiatV2);
    return keys.filter((k) => k.includes("_error")).some((j) => withdrawFiatV2[j as ErrorString]);
  }, [withdrawFiatV2]);

  // 供应商不可用
  const provider_error = useMemo(() => {
    if (withdrawFiatV2.method) return withdrawFiatV2.method?.status === 0;
    return true;
  }, [withdrawFiatV2.method]);

  // 计算手续费
  const withdrawalFee = useMemo(() => {
    return Decimal(withdrawFiatV2.formItem?.amount || 0)
      .times(withdrawFiatV2.method?.fee_rate || 0)
      .plus(withdrawFiatV2.method?.fee_fix || 0)
      .toString();
  }, [withdrawFiatV2.method]);

  // total withdraw amount 显示控制
  const totalWithdrawAmountControl = useMemo(() => {
    const max = withdrawFiatV2.method?.max ?? 0;
    const d_amount = Decimal(withdrawFiatV2.formItem?.amount || 0);
    return Decimal.min(d_amount, max);
  }, [withdrawFiatV2.formItem, withdrawFiatV2.method]);

  // 实际收到
  const withdrawAmountControl = useMemo(() => {
    const fee = totalWithdrawAmountControl.mul(withdrawFiatV2.method?.fee_rate || 0).plus(withdrawFiatV2.method?.fee_fix || 0);
    return Math.max(totalWithdrawAmountControl.sub(fee).toNumber(), 0).toString();
  }, [totalWithdrawAmountControl, withdrawFiatV2.method]);

  // 创建订单
  const createOrder = useCallback(async () => {
    set(true);

    const params = {
      // pin: md5(syncAction?.data),
      amount: withdrawFiatV2.formItem?.amount,
      currency: withdrawFiat.currency?.currency,
      userWithdrawInfoId: withdrawFiatV2.method?.id
    };

    let url = "";
    let name = "";
      createWithdrawFiatOrderV2(params)
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
  }, [openModal, t, withdrawFiat, withdrawFiatV2]);

  // 事件通知
  // useEffect(() => {
  //   if (syncAction.type === "SYNC_WITHDRAW_FIAT_CREATE") void createOrder();
  // }, [syncAction]);

  // 事件通知【CLOSE_FINANCE_MODAL- 关闭finance操作窗口】需要重置表单状态
  useEffect(() => {
    const em = emitter.addListener("CLOSE_FINANCE_MODAL", function() {
      setWithdrawFiatV2({ formItem: null });
    });

    return () => {
      em?.remove();
    };
  }, []);

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
    <div className="flex flex-col gap-4">
      <WithdrawMethodInfoAdd />

      {/* 通道维护不可用 */}
      <InnerDisplayContent show={!fiatInfoLoading && !!withdrawFiatV2.method && Boolean(provider_error)}>
        <div className="bg-error/20 px-2 py-1 rounded-lg">
          <ErrorMessageBox
            sample
            className={"!mt-0 static !text-sm"}
            content={
              <Trans
                i18nKey={"finance:withdraw_channel_under_maintenance"}
                values={{ channel: withdrawFiatV2.method?.display_name || withdrawFiatV2.method?.channel_class }}
                components={[<span className="underline font-bold" />]} />}
            show={Boolean(provider_error)} />
        </div>
      </InnerDisplayContent>

      <DisplayContent
        className="flex flex-col gap-4"
        status={(wallets?.data ?? [])?.length > 0 && !!withdrawFiatV2.method}>
        <WithdrawFiatAmount key="amount" formKey="amount" version={"V2"} />
      </DisplayContent>

      {/*TODO: 可视区域过小的时候,需要腾出空间,避免影响用户的表单操作*/}
      <div className={clsx("w-full z-1", viewportHeight >= 700 && "sticky bottom-1")}>
        <DisplayContent
          status={(wallets?.data ?? [])?.length > 0 && !!withdrawFiatV2.method}>
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
                <DisplayContent status={Decimal(withdrawFiatV2.method?.fee_rate || 0).gt(0)}>
                  <div className="text-[10px] text-base-content/50">
                    {`(${withdrawFiatV2.method?.fee_rate * 100}% + ${withdrawFiatV2.method?.fee_fix || 0})`}
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
        </DisplayContent>
        {/* 提交 */}
        <DisplayContent
          className="flex flex-col gap-1"
          status={(wallets?.data ?? [])?.length > 0 && !!withdrawFiatV2.method}>
          <ConfirmBox
            disabled={filed_value_null || filed_value_error || provider_error}
            loading={loading}
            onClick={() => {
              void createOrder();
              // openModal("OPEN_WITHDRAW_FIAT_PIN_MODAL");
            }}
          >
            {t("finance:continue")}
          </ConfirmBox>
        </DisplayContent>
      </div>
    </div>
  );
};
