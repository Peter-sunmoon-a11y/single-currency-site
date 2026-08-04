
import { ComponentProps } from "react";
import { cn } from "@/utils/cn.ts";

export const ConfirmBox = ({
  loading,
  onClick,
  children,
  className,
  ...props
}: ComponentProps<"button"> & {
  loading?: boolean;
}) => {
  return (
    <button
      {...props}
      className={cn(`btn btn-primary flex items-center justify-center w-full whitespace-nowrap`, className)}
      onClick={(e) => !loading && onClick?.(e)}
    >
      {children}
      {loading && <span className="loading loading-spinner loading-xs" />}
    </button>
  );
};
