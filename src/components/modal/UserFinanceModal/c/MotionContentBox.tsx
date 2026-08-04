import { cn } from "@/utils/cn";
import { ReactNode } from "react";

export const MotionContentBox = ({ show, content }: { show: boolean; content: ReactNode; sample?: boolean }) => {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-100",
        show ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
    >
      <div className="overflow-hidden">{content}</div>
    </div>
  );
};
