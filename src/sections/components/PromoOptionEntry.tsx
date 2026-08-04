import { ReactNode } from "react";
import { Alert } from "@/components/icons/Alert.tsx";
import clsx from "clsx";

export const PromoOptionEntry = ({ icon, desc, title, onClick, countdown, extraNode, className }: {
  icon?: string,
  desc?: ReactNode,
  title: string,
  onClick?: () => void,
  onExpand?: () => void,
  countdown?: ReactNode
  extraNode: ReactNode
  className?: string
}) => {
  return (
    <div className={clsx("overflow-hidden relative rounded-lg flex px-2 py-2 cursor-pointer items-end justify-between", className)}>
      <div className="flex gap-2 items-center">
        <img src={icon || "/images/deposit_promotion/gift-box.png"} alt="" className={"w-8 h-8"} />
        <div className="flex flex-col gap-1 leading-none">
          <p
            className="flex gap-2 items-center text-sm text-base-content font-extrabold"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
              return false;
            }}>
            {title}
            {onClick && <Alert className={"w-4 h-4 text-base-content/50"} />}
          </p>
          <div className={"flex gap-1 flex-wrap"}>
            {extraNode}
          </div>
        </div>
      </div>
      {desc}
      {countdown && <div
        className="absolute top-0 right-0 flex items-center gap-0.5 bg-error/15 p-1 text-error text-[12px] leading-none">
        <span className="text-[10px]">⚡</span>
        {countdown}
      </div>}
    </div>
  );
};

