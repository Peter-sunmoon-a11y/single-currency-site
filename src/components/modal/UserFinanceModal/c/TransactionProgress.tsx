import { cn } from "@/utils/cn.ts";
import { ReactNode } from "react";

export const TransactionProgress = ({ step, nodes }: { step: number; nodes: ReactNode[] }) => {
  return (
    <ul className="steps steps-vertical">
      {nodes.map((node, i) => {
        return (
          <li
            key={`step${i}`}
            data-content={i === 0 ? "✓" : i + 1}
            className={cn(
              step >= i + 1
                ? "step before:!w-1 before:!border-primary before:!bg-primary after:!h-5 after:!w-5 after:!border-primary after:!bg-primary after:text-[12px] after:!text-black"
                : "step before:!w-1 before:!border-base-200 before:!bg-base-200 after:!h-5 after:!w-5 after:text-[12px] after:!bg-base-200 after:!text-primary",
            )}
          >
            <div className="flex flex-col items-start gap-1">{node}</div>
          </li>
        );
      })}
    </ul>
  );
};
