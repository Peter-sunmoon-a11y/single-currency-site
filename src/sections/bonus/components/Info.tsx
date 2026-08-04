import { Alert } from "@/components/icons/Alert.tsx";
import { ComponentProps } from "react";
import clsx from "clsx";

export const Info = (props: ComponentProps<"button">) => {
  return <button {...props} className={clsx("btn btn-square btn-primary btn-soft btn-sm", props.className)}>
    <Alert className="text-base-content w-4 h-4" />
  </button>;
};