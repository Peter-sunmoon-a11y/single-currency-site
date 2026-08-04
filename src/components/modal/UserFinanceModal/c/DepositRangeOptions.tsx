import { cn } from "@/utils/cn.ts";
import Decimal from "decimal.js";
import { useBoundStore } from "@/store";
import { useEffect, useMemo, useState, useTransition } from "react";
import { DepositFiatBonus } from "@/components/modal/UserFinanceModal/c/DepositFiatBonus.tsx";
import { useGetPromoByPage } from "@/query/promo.tsx";

export const DepositRangeOptions = (
  {
    amount,
    multiple,
    onChange,
    rangeOptions
  }: {
    amount: string
    multiple: string
    onChange: (v: string) => void;
    rangeOptions: string[]
  }) => {
  // from data store, share common data
  const { depositFiat } = useBoundStore();

  const { currentPromo } = useGetPromoByPage();

  const [value, setValue] = useState(amount);

  // 过渡效果优化
  const [, startTransition] = useTransition();

  /**
   * 有些供应商提供的快捷选项值和通道的min max不符合
   * 需要去禁止不适合的快捷选项值做禁用
   *
   * 选项小于通道最小值
   * 选项大于通道最大值
   */
  const computedOptions = useMemo(() => {
    const min = depositFiat.method?.min ?? 0;
    const max = depositFiat.method?.max ?? 0;

    return rangeOptions.map((v) => {
      const d_value = new Decimal(v ?? 0);
      const isDisabled = !Boolean(depositFiat.method) || d_value.lt(min) || d_value.gt(max);
      const isSelected = d_value.eq(value || 0);
      return { value: v, isDisabled, isSelected };
    });
  }, [depositFiat.method, rangeOptions, value]);

  useEffect(() => {
    setValue(amount);
  }, [amount]);

  return (
    <div className="mt-0 grid grid-cols-3 gap-1">
      {computedOptions.map(({ value, isDisabled, isSelected }) => (
        <button
          key={value}
          className={cn(
            `relative btn text-base-content btn-primary btn-soft p-0 min-h-[32px] h-auto`,
            isSelected && "btn-outline btn-primary border-1 text-primary",
            isDisabled && "opacity-50"
          )}
          onClick={() => {
            setValue(value);
            startTransition(() => onChange(value)); // 动画过渡优化
          }}
          disabled={isDisabled}
        >
          <div className="h-full flex flex-col w-full items-center justify-between">
            <div className="flex-1 text-sm flex items-center truncate max-w-[90%]">
              {value}
            </div>
            {currentPromo && <DepositFiatBonus amount={value} multiple={multiple} />}
          </div>
          {isSelected && <span
            className="absolute bottom-0 right-0 w-0 h-0 border-b-[18px] border-l-[18px] border-b-primary border-l-transparent rounded-br-[inherit]" />}
        </button>
      ))}
    </div>
  );
};
