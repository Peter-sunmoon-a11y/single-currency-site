import clsx from "clsx";

export const DataLoading = ({className}:{className?: string}) => {
  return <div
    className={clsx("absolute inset-0 flex items-center justify-center rounded-xl overflow-hidden", className)}>
    <span className="loading loading-spinner loading-sm text-primary" />
  </div>;
};
