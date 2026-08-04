import { CSSProperties, ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { toast } from "sonner";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";

export const InnerToastCustom = (
  {
    tst,
    icon,
    title,
    style,
    subTitle,
    closeIcon,
    closeBtn = true,
    onConfirm
  }: {
    tst: any,
    icon: string,
    title: ReactNode,
    style?: CSSProperties,
    closeBtn?: boolean
    subTitle: ReactNode,
    closeIcon?: ReactNode,
    onConfirm?: () => void
  }) => {
  return <div
    className="flex flex-col gap-4 p-4 relative"
    style={{ fontFamily: "var(--font-family)", ...style }}>

    <div className={clsx("flex items-center gap-4")}>
      <img src={icon} className="h-10" alt="" />

      <div className={"flex-1 text-sm"}>
        <div className={clsx("font-bold text-base")}>
          {title}
        </div>
        <TextBaseContent text={subTitle} className={"font-normal"} />
      </div>

      {closeBtn && <button
        className={"btn btn-square bg-base-200 btn-sm right-4"}
        onClick={() => {
          toast.dismiss(tst);
          onConfirm?.();
        }}>
        {closeIcon || <X size={16} />}
      </button>}
    </div>
  </div>;
};
