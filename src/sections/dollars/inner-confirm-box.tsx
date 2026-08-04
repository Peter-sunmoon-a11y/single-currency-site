import { ComponentProps } from "react";
import clsx from "clsx";

export const InnerConfirmBox = (
  {
    sample,
    loading,
    onClick,
    children,
    className,
    ...props
  }: ComponentProps<"button"> & {
    sample?: boolean;
    loading?: boolean;
  }) => {
  return (
    sample
      ? <div
        className={"bg-primary text-sm font-bold text-primary-content px-4 py-2.5 rounded-field flex items-center justify-center"}>{children}</div>
      : <button
        {...props}
        className={clsx("truncate btn btn-primary btn-md flex items-center justify-center w-full font-bold", className)}
        onClick={(e) => !loading && onClick?.(e)}
      >
        {children}
        {loading && <span className="loading loading-spinner loading-xs" />}
      </button>
  );
};
