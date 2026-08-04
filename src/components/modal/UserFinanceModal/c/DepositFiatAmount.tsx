import { ErrorMessageBox } from "@/components/modal/UserFinanceModal/c/ErrorMessageBox.tsx";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { NumericFormat } from "@/components/modal/UserFinanceModal/c/NumericFormat.tsx";
import { useSupportedFiatDepositGateways } from "@/hooks/api/useAuth.ts";
import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
// import { Plus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
// import FormatAmount from "./FormatAmount";
import { RequireItem } from "@/components/modal/UserFinanceModal/c/RequireItem.tsx";
import { useGetPromoByPage } from "@/query/promo";
import {
  InnerErrorWrapper,
  InnerProviderAmountRangeFormat
} from "@/components/modal/UserFinanceModal/c/InnerComponents.tsx";
import { DepositRangeOptions } from "@/components/modal/UserFinanceModal/c/DepositRangeOptions.tsx";
// import { InnerDisplayContent } from "@/components/header/message-v2/c/InnerComponents.tsx";
import { not_fiat_currency_deposit_activity_set } from "@/components/modal/UserFinanceModal/helper.ts";
import { promoKey } from "@/components/modal/UserFinanceModal/c/SpecialOffers.utils.ts";
import { emitter } from "@/store/emitter.ts";

export const DepositFiatAmount = ({ multiple }: { multiple: string }) => {
  const { t } = useTranslation();
  const { currentPromo } = useGetPromoByPage();

  // from data store, share common data
  const { depositFiat, setDepositFiat } = useBoundStore();

  // 获取法币的提供商
  const { isLoading } = useSupportedFiatDepositGateways(depositFiat.currency?.currency);

  // 查询代币信息辅助函数
  const { exchangeRates } = useCurrencyData();

  // special_offer_thursday 只针对周四加密货币
  const promotion_for_deposit_fiat = currentPromo?.promo_type === 1 && !not_fiat_currency_deposit_activity_set.has(currentPromo?.promo_code);

  // 有充值活动的时候需要按照活动的充值范围来限制 MIN
  // ⚠️按照存款币换算
  // FIXME 法币存款需要排除 "special_offer_thursday" 吗?
  const promotion_deposit_min_amount_limit = useMemo(() => {
    if (promotion_for_deposit_fiat) {
      const need_multiple = multiple && Number(multiple) > 0;

      const d_amount = (Decimal(exchangeRates?.["USDT"] || 0)
        .div(exchangeRates?.[depositFiat?.currency?.currency] || 1)
        .times(currentPromo?.min_amount || 0));
      // .times(2.88 || 0)); // TODO: debug code

      // ⚠️向上取，稍大的值才不会导致存款失败
      return d_amount.toFixed(need_multiple ? 0 : depositFiat?.currency?.decimal, Decimal.ROUND_CEIL);
    }
    return "0";
  }, [multiple, depositFiat?.currency?.currency, currentPromo?.promo_type, currentPromo?.min_amount, exchangeRates]);

  // 有充值活动的时候需要按照活动的充值范围来限制 MAX
  // ⚠️按照存款币换算
  const promotion_deposit_max_amount_limit = useMemo(() => {
    if (promotion_for_deposit_fiat) {
      return (Decimal(exchangeRates?.["USDT"] || 0)
        .div(exchangeRates?.[depositFiat?.currency?.currency] || 1)
        .times(currentPromo?.max_deposit || 0)).toFixed(depositFiat?.currency?.decimal, Decimal.ROUND_DOWN);
    }
    return "0";
  }, [depositFiat?.currency?.currency, currentPromo?.promo_type, currentPromo?.max_deposit, exchangeRates]);

  // 输入的 amount 范围错误
  const rangeError = useMemo(() => {
    const d_amount = Decimal(depositFiat.formItem?.amount || 0);
    return (d_amount.lt(depositFiat.method?.min) || d_amount.gt(depositFiat.method?.max));
  }, [depositFiat.formItem?.amount, depositFiat.method?.min, depositFiat.method?.max]);

  // 提款输入值倍数错误提示，有些通道要求x的倍数数值才能提款
  const multipleError = useMemo(() => {
    // console.info(`multiple=${multiple}`);
    if (!multiple || Number(multiple) <= 0) return false;
    const d_amount = Decimal(depositFiat.formItem?.amount || 0);
    return !(d_amount.mod(multiple).eq(0));
  }, [depositFiat.formItem?.amount, multiple]);

  // 根据用户的充值金额计算奖励
  const calcBonusAmount = useMemo(() => {
    const d_amount = Decimal(depositFiat.formItem?.amount || 0);
    if (promotion_for_deposit_fiat) {

      if (d_amount.lt(promotion_deposit_min_amount_limit)) return "0";

      if (currentPromo?.promo_code === promoKey.everyDay()) {
        const bonus_rate =
          Number(currentPromo?.bonus_rate) || Number(currentPromo?.fiat_bonus_rate) || 0;
        const max_bonus_usdt = currentPromo?.max_bonus_usdt ?? currentPromo?.max_deposit ?? 0;
        const max_bonus_local = (Decimal(exchangeRates?.["USDT"] || 0)
          .div(exchangeRates?.[depositFiat?.currency?.currency] || 1)
          .times(max_bonus_usdt)).toDP(depositFiat?.currency?.decimal, Decimal.ROUND_DOWN);

        return Decimal.min(d_amount.times(bonus_rate), max_bonus_local)
          .toDP(depositFiat?.currency?.display_decimal, Decimal.ROUND_DOWN);
      }

      if (deposit_special_offer_keys.has(currentPromo?.promo_code)) {
        const bonus_rate = (Number(currentPromo?.bonus_rate) || Number(currentPromo?.fiat_bonus_rate)) ?? 0;
        return Decimal.min(d_amount, promotion_deposit_max_amount_limit).times(bonus_rate).toDP(depositFiat?.currency?.display_decimal, Decimal.ROUND_DOWN);
      }

      return (Decimal(exchangeRates?.["USDT"] || 0)
        .div(exchangeRates?.[depositFiat?.currency?.currency] || 1)
        .times(currentPromo?.bonus_amount || 0)).toDP(depositFiat?.currency?.display_decimal, Decimal.ROUND_DOWN);
    }
    return "0";
  }, [
    currentPromo?.bonus_rate,
    currentPromo?.promo_type,
    currentPromo?.promo_code,
    currentPromo?.bonus_amount,
    currentPromo?.fiat_bonus_rate,
    depositFiat.formItem?.amount,
    depositFiat?.currency?.currency,
    depositFiat?.currency?.display_decimal,
    promotion_deposit_min_amount_limit,
    promotion_deposit_max_amount_limit
  ]);

  const final_decimal = useMemo(() => {
    const display_decimal = depositFiat.currency?.display_decimal ?? 0;
    const has_multiple = multiple && Number(multiple) > 0;
    return display_decimal > 0 && !has_multiple ? display_decimal : 0;
  }, [depositFiat.currency?.display_decimal, multiple]);

  useEffect(() => {
    setDepositFiat({ range_error: rangeError, multiple_error: multipleError });
  }, [rangeError, multipleError]);

  // 事件通知 - 计算优惠码带来的额外奖励
  useEffect(() => {
    emitter.emit("CALC_BONUS_AMOUNT", calcBonusAmount);
  }, [calcBonusAmount]);

  // 存款活动开启时设置默认的填充值
  // useLayoutEffect(() => {
  //   if (isUserFinanceOpen && Decimal(promotion_deposit_min_amount_limit).gt(0)) {
  //     // 延迟设置,防止填充值在通道切换时候重置数据,导致amount空
  //     requestAnimationFrame(() => {
  //       setDepositFiat({ formItem: { amount: promotion_deposit_min_amount_limit } });
  //     });
  //   }
  // }, [isUserFinanceOpen, promotion_deposit_min_amount_limit]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-2 text-xs text-base-content/50 font-semibold">
        <RequireItem label={t(`finance:amount`)} />
        <SmallLoading
          loading={isLoading}
          content={
            <p>
              {depositFiat.method
                ? (<InnerProviderAmountRangeFormat
                  min={depositFiat.method?.min || 0}
                  max={depositFiat.method?.max || 0}
                  currency={depositFiat.currency?.currency} />)
                : (<>? {depositFiat.currency?.currency}</>)}
            </p>
          }
        />
      </div>

      {/* deposit fiat amount control */}
      <div className="relative overflow-hidden rounded-sm flex flex-col gap-2">

        {/* 数量输入快捷选项 - 无优惠充值活动的时候 */}
        <DepositRangeOptions
          amount={depositFiat.formItem?.amount || 0}
          multiple={multiple}
          onChange={(amount) => setDepositFiat({ formItem: { amount: amount } })}
          rangeOptions={depositFiat.method?.recommended ?? default_deposit_range_options}
        />

        <InnerErrorWrapper>
          <NumericFormat
            // suf={
            //   <div className="text-primary text-sm font-bold flex items-center gap-1">
            //     <img src="/icons/finance/gift-box.png" alt="" className="w-5 h-5" />
            //     <Plus size={10} strokeWidth={5} />
            //     <FormatAmount
            //       unit={getCurrencySymbol(depositFiat.currency?.currency)}
            //       amount={calcBonusAmount}
            //       decimals={2}
            //       local
            //     />
            //   </div>
            // }
            wrapCls={"bg-base-200 h-12"}
            isAllowed={({ value }) => Decimal(value || 0).lt(1000000000000)}
            decimalScale={final_decimal}
            placeholder="0.00"
            suf={depositFiat.currency?.currency}
            value={depositFiat.formItem?.amount}
            thousandSeparator={false}
            onValueChange={(values) => {
              setDepositFiat({
                formItem: { amount: values.value }
              });
            }}
          />

          {/* 动态的活动文本 */}
          {/*<InnerDisplayContent show={!promotion_for_deposit_fiat}>*/}
          {/*  <InnerBonusText text={t(`finance:toYourBonusPool`)} />*/}
          {/*</InnerDisplayContent>*/}

          {/* 动态的活动文本 */}
          {/*<InnerDisplayContent show={promotion_for_deposit_fiat}>*/}
          {/*  <InnerBonusText text={t(`finance:to_your_account_balance`)} />*/}
          {/*</InnerDisplayContent>*/}

          {/* 输入发生错误 - 数值输入范围错误 */}
          <ErrorMessageBox
            show={rangeError}
            content={<>{t("finance:pleaseEnterAnAmountBetween")}{" "}
              <InnerProviderAmountRangeFormat
                min={depositFiat.method?.min}
                max={depositFiat.method?.max}
                currency={depositFiat.currency?.currency} />
            </>}
          />

          {/* 通道存款要求 */}
          <ErrorMessageBox show={!rangeError && multipleError}
                           content={t("finance:integer_deposit", { value: multiple })} />
        </InnerErrorWrapper>
      </div>
    </div>
  );
};

export const deposit_special_offer_keys = new Set([promoKey.everyDay()]);

// 默认的数量输入快捷选项
export const default_deposit_range_options = ["200", "500", "1000", "5000", "10000", "50000"];
