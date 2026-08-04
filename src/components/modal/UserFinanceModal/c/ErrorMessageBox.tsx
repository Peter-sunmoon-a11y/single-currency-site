import { clsx } from "clsx";
import { ReactNode } from "react";

export const ErrorMessageBox = (
  {
    show,
    sample,
    content,
    className
  }: {
    show: boolean;
    sample?: boolean;
    content: ReactNode;
    className?: string;
  }) => {
  return (
    <div
      className={clsx("w-full text-error text-[12px] font-semibold", className,
        show ? "block" : "hidden",
        sample ? "whitespace-normal static tracking-tighter leading-tight" : "truncate absolute",
      )}>
      {content}
    </div>
  );
};
