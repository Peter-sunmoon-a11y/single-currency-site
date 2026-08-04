import { Alert } from "@/components/icons/Alert.tsx";
import { ReactNode } from "react";

export const PromoOptionWrap = ({ icon, title, onClick, countdown, extraNode }: {
  icon: string,
  title: string,
  onClick: () => void
  countdown?: ReactNode
  extraNode: ReactNode
}) => {
  return (
    <div className="relative p-4 rounded-lg overflow-hidden">
      <div className="flex-inline flex-col justify-center">
        <div className="flex items-center gap-2">
          <p className="text-sm text-base-content font-extrabold whitespace-pre-line leading-4">{title}</p>
          <Alert
            className={"text-base-content/50"}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
              return false;
            }} />
        </div>
        <div className={"flex gap-1 flex-wrap max-w-[65%] mt-1"}>
          {extraNode}
        </div>
        <div className="mt-1">
          {countdown}
        </div>
      </div>
      <img src={icon} className="h-full absolute top-0 right-0 rtl:left-0 rtl:right-auto rtl:-scale-x-100" />
    </div>
  );
};