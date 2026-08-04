import { useCurrencyData } from "@/hooks/useCurrency.ts";
import { useBoundStore } from "@/store";
import Decimal from "decimal.js";
import { ReactNode, useMemo } from "react";
import { useGetPromoByPage } from "@/query/promo";
import { not_fiat_currency_deposit_activity_set } from "@/components/modal/UserFinanceModal/helper.ts";
import { deposit_special_offer_keys } from "@/components/modal/UserFinanceModal/c/DepositFiatAmount.tsx";
import { promoKey } from "@/components/modal/UserFinanceModal/c/SpecialOffers.utils.ts";

export const DepositFiatBonus = ({ amount, multiple }: { amount: string, multiple?: string, children?: ReactNode }) => {
  const { currentPromo } = useGetPromoByPage();

  // from data store, share common data
  const { depositFiat } = useBoundStore();

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
      return d_amount.toDP(need_multiple ? 0 : depositFiat?.currency?.decimal, Decimal.ROUND_CEIL);
    }
    return "0";
  }, [multiple, depositFiat?.currency?.currency, currentPromo?.promo_type, currentPromo?.min_amount, exchangeRates]);

  // 有充值活动的时候需要按照活动的充值范围来限制 MAX
  // ⚠️按照存款币换算
  const promotion_deposit_max_amount_limit = useMemo(() => {
    if (promotion_for_deposit_fiat) {
      return (Decimal(exchangeRates?.["USDT"] || 0)
        .div(exchangeRates?.[depositFiat?.currency?.currency] || 1)
        .times(currentPromo?.max_deposit || 0)).toDP(depositFiat?.currency?.decimal, Decimal.ROUND_DOWN);
    }
    return "0";
  }, [depositFiat?.currency?.currency, currentPromo?.promo_type, currentPromo?.max_deposit, exchangeRates]);

  // 根据用户的充值金额计算奖励
  const calcBonusAmount = useMemo(() => {
    const d_amount = Decimal(amount || 0);
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
    currentPromo?.promo_code,
    currentPromo?.bonus_amount,
    currentPromo?.fiat_bonus_rate,
    depositFiat?.currency?.currency,
    depositFiat?.currency?.display_decimal,
    promotion_deposit_min_amount_limit,
    promotion_deposit_max_amount_limit
  ]);

  return (
    <div className="relative w-full overflow-hidden rounded-b-sm bg-primary/15 flex items-center justify-center">
      <span className="font-normal text-[12px] text-primary italic">
        +{calcBonusAmount.toString()}
      </span>
    </div>
  );
};
