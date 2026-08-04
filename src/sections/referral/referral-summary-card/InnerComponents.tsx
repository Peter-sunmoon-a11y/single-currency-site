import { InnerShareLink } from "@/sections/bonus/buddy-ball/share.tsx";
import clsx from "clsx";

export const InnerReferralShareLink = ({className}:{className?: string}) => {
  return (
    <div className={clsx("p-4 rounded-lg bg-base-200 flex justify-between", className)}>
      <InnerShareLink className={'bg-base-100'} />
    </div>
  );
};
