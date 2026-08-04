import clsx from "clsx";
import { forwardRef, ReactNode, useMemo } from "react";
import { NumericFormat as _NumericFormat, NumericFormatProps } from "react-number-format";

export { o } from "@/utils/numericFormat";
import { o } from "@/utils/numericFormat";

export const NumericFormat = forwardRef<HTMLDivElement, NumericFormatProps<{
  suf?: ReactNode
  pre?: ReactNode
  wrapCls?: string
}>>((
  {
    suf,
    pre,
    wrapCls,
    ...props
  }, _ref) => {
  const final_value = useMemo(() => {
    const v1 = props.value;
    const v2 = props.decimalScale;
    if (v1 === "") return "";
    if (Number(v1) === 0) return 0;
    if (Number(v1) > 0) return o(v1!, v2);
    return props.value;
  }, [props.value, props.decimalScale]);
  return (
    <div className={clsx("w-full input border-none outline-none flex gap-1 items-center px-4", wrapCls)}>
      {pre && <div className="shrink-0 text-base font-bold text-primary">{pre}</div>}
      <_NumericFormat
        {...props}
        value={final_value}
        allowNegative={false}
        className={clsx("text-base flex-1 font-bold bg-transparent border-none outline-none disabled:bg-inherit [&::placeholder]:text-base-content", props.className)}
      />
      {suf && <div className="shrink-0 text-base font-bold text-primary">{suf}</div>}
    </div>
  );
});

NumericFormat.displayName = "NumericFormat";
