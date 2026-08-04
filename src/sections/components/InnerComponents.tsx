import { ReactNode } from "react";
import clsx from "clsx";

export const InnerBonusParams = ({ children, className }: { children: ReactNode, className?: string }) => {
  return <p
    className={clsx("text-xs font-bold tracking-tighter text-primary whitespace-pre-line", className)}>{children}</p>;
};