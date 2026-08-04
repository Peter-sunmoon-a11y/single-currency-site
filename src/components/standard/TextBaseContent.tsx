import { ReactNode } from "react";
import clsx from "clsx";

export const TextBaseContent = ({ text, className }: { text: ReactNode, className?: string }) => {
  return <p
    className={clsx("text-sm text-base-content/60 whitespace-pre-line", className)}>
    {text}
  </p>;
};