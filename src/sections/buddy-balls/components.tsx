import { ReactNode } from "react";
import clsx from "clsx";

export const InnerItemWrap = ({ label, value, className }: {
  label?: string,
  value: ReactNode,
  className?: string
}) => {
  return <div className="flex justify-between text-sm font-semibold">
    <span className={"truncate"}>{label}</span>
    <span className={clsx("text-end font-bold", className)}>{value}</span>
  </div>;
};