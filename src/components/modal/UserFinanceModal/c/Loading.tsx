import { cn } from "@/utils/cn.ts";
import clsx from "clsx";
import { ReactNode } from "react";

// 卡片式加载数据
export const Loading = ({ className }: { className?: string }) => {
  return (
    <div className={cn("bg-base-200 flex h-[92px] items-center justify-center rounded-lg", className)}>
      <div className="loading loading-spinner loading-xs"></div>
    </div>
  );
};

// 局部的数据加载过渡
export const SmallLoading = ({ loading, content, className }: { loading: boolean; content: ReactNode; className?: string }) => {
  return loading ? <div className={clsx("h-4 bg-base-200 rounded-sm min-w-25 skeleton", className)} /> : content;
};
