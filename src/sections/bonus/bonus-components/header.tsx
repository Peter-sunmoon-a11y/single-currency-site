import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/react-i18next";

export function BonusListHeader({
                                  className,
                                  icon,
                                  title,
                                  hasHistory,
                                  claimable,
                                  jumpTo,
                                  children,
                                  childrenClassName
                                }: {
  className?: string;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  hasHistory?: boolean;
  claimable?: boolean;
  jumpTo?: () => void;
  children?: React.ReactNode;
  childrenClassName?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={clsx(className)}>
      <div className="divider divider-start text-base font-bold text-primary gap-2">
        {icon}
        {title}
        {claimable && (
          <span className="text-base-content/50 text-[11px] p-0 shrink-0">
            {t("bonus:claimable")}
          </span>
        )}
        {hasHistory && (
          <button
            type="button"
            className="btn btn-xs btn-primary btn-soft"
            onClick={() => jumpTo?.()}
          >
            {t("common:common.history")}
          </button>
        )}
      </div>
      <div className={clsx(childrenClassName)}>
        {children}
      </div>
    </div>
  );
}

