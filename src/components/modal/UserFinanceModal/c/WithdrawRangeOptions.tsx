import { perRangeOptions } from "@/components/modal/UserFinanceModal/helper.ts";
import { cn } from "@/utils/cn.ts";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useState, useTransition } from "react";

export const WithdrawRangeOptions = (
  {
    onChange,
    disabled
  }: {
    onChange: (v: number) => void;
    disabled: boolean;
  }) => {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<number>(-1);

  // 过渡效果优化
  const [, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-4 gap-2">
      {perRangeOptions.map((o, index) => (
        <button
          key={index}
          className={cn(
            `btn text-base-content btn-primary btn-soft btn-sm w-auto`,
            selected === o.value && "btn-outline btn-primary border-1 text-primary"
          )}
          onClick={() => {
            setSelected(o.value);
            startTransition(() => onChange(o.value)); // 动画过渡优化
          }}
          disabled={disabled}
        >
          {["Min", "Max"].includes(o.label) ? t(`finance:${o.label?.toLowerCase()}`) : o.label}
        </button>
      ))}
    </div>
  );
};
