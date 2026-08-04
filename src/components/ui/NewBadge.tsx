import { useTranslation } from "@/lib/i18n/react-i18next";
import clsx from "clsx";

export const NewBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation();

  return (
    <span
      className={clsx(
        "absolute top-0.5 right-1.5 text-[12px] leading-none italic text-primary animate-gift-shake",
        className,
      )}
    >
      {t("explore:new")}
    </span>
  );
};
