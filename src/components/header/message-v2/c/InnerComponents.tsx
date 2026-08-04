import { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useTranslation } from "@/lib/i18n/react-i18next";

export const InnerComponents = (props: ComponentProps<"button">) => {
  return (<button {...props} className="btn btn-sm btn-square rtl:left-4 rtl:right-auto"><X size={16} /></button>);
};

export const InnerModalTitle = () => {
  const { t } = useTranslation("chat");
  return (<div
    className="h-8 font-bold text-sm text-base-content inline-flex items-center gap-2 bg-base-200 px-3 rounded-lg">
    <InnerBoxIcon />
    {t("chat:notifications")}
  </div>);
};

export const InnerBoxIcon = (props: ComponentProps<"svg">) => {
  return (<svg {...props} width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 0C9.41421 0 9.75 0.335786 9.75 0.75V6.3401L11.7004 4.23966C11.9823 3.93613 12.4568 3.91855 12.7603 4.20041C13.0639 4.48226 13.0814 4.95681 12.7996 5.26034L9.54959 8.76034C9.40769 8.91316 9.20855 9 9 9C8.79145 9 8.59231 8.91316 8.45041 8.76034L5.20041 5.26034C4.91855 4.95681 4.93613 4.48226 5.23966 4.20041C5.54319 3.91855 6.01774 3.93613 6.29959 4.23966L8.25 6.3401V0.75C8.25 0.335786 8.58579 0 9 0Z"
        fill="currentColor" />
      <path
        d="M4.27298 2.5C3.71065 2.5 3.21753 2.8755 3.06799 3.41759L1.54501 8.93839C1.53938 8.95881 1.53427 8.97935 1.52969 9H5C5.37877 9 5.72504 9.214 5.89443 9.55279L6.34164 10.4472C6.51103 10.786 6.8573 11 7.23607 11H10.674C11.0269 11 11.3537 10.814 11.5339 10.5105L12.1401 9.48946C12.3203 9.18601 12.6471 9 13 9H16.4703C16.4657 8.97935 16.4606 8.95881 16.455 8.93839L14.932 3.41759C14.7825 2.8755 14.2894 2.5 13.727 2.5H12.75C12.3358 2.5 12 2.16421 12 1.75C12 1.33579 12.3358 1 12.75 1H13.727C14.9642 1 16.049 1.8261 16.378 3.0187L17.901 8.5395C17.9667 8.77771 18 9.02369 18 9.2708V13C18 14.1046 17.1046 15 16 15H2C0.89543 15 0 14.1046 0 13V9.2708C0 9.02369 0.0333066 8.77771 0.0990203 8.5395L1.622 3.0187C1.95099 1.82611 3.03584 1 4.27298 1H5.25C5.66421 1 6 1.33579 6 1.75C6 2.16421 5.66421 2.5 5.25 2.5H4.27298Z"
        fill="currentColor" />
    </svg>
  );
};

export const InnerButton = (
  {
    loading,
    onClick,
    children,
    className,
    ...props
  }: ComponentProps<"button"> & {
    loading?: boolean;
  }) => {
  return (
    <button
      {...props}
      className={clsx(`btn btn-primary btn-soft btn-sm w-full`, className)}
      onClick={(e) => !loading && onClick?.(e)}
    >
      {children}
      {loading && <span className="loading loading-spinner loading-xs text-primary" />}
    </button>
  );
};

export const InnerIsRead = ({ read }: { read: boolean }) => {
  if (read) return null;
  return <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-success" />;
};

export const InnerNoRecords = ({ status }: { status: boolean }) => {
  const { t } = useTranslation();
  return (status && <div
    className="flex flex-col items-center justify-center text-xs text-base-content/50 py-6 bg-base-200 rounded-lg font-semibold">
    {t("common:no_notification", "No notification yet")}
  </div>);
};

export const InnerDataLabel = ({ label }: { label: ReactNode }) => {
  const { t } = useTranslation();
  return <p
    className={"text-xs text-base-content/80 font-bold capitalize"}>{t(`chat:${label}`)}</p>;
};

export const InnerStatusText = ({ text, className }: { text: string, className?: string }) => {
  return <p className={clsx("text-xs text-base-content/50 font-normal", className)}>{text}</p>;
};

const placeholderSrc = '/favicon/favicon-96x96.png';
export const InnerCustomIcon = ({ icon }: { icon: string }) => {
  return <LazyLoadImage
    src={icon || placeholderSrc}
    placeholderSrc={placeholderSrc}
    wrapperClassName={"rounded-lg w-6 h-6 shrink-0"}
    className="w-6 h-6"
    onError={(e) => {
      e.currentTarget.src = placeholderSrc;
    }}
    alt="" />;
};

export const InnerDisplayContent = ({ show, children }: { show: boolean, children: ReactNode }) => {
  return show ? (children) : null;
};

export const InnerContentVisible = ({ show, className, ...props }: ComponentProps<"div"> & {
  show: boolean,
  className?: string
}) => {
  return <div {...props} className={clsx(show ? "block" : "hidden", className)}>{props.children}</div>;
};
