import clsx from "clsx";
import { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { ScanSearch } from "lucide-react";

export const NothingFound = ({ text, icon, className }: { text?: ReactNode, icon?: ReactNode, className?: string }) => {
  const { t } = useTranslation();
  return <div
    className={clsx("z-1 absolute inset-0 flex flex-col gap-1 items-center justify-center text-sm text-base-content/50 font-semibold", className)}>
    {icon || <ScanSearch size={24} />}
    <span>{text || t("common:common.noData")}</span>
  </div>;
};
