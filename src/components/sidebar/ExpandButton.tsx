import { ChevronDown } from "lucide-react";
import { ComponentProps } from "react";

export const ExpandButton = (props: ComponentProps<"div">) => {
  return <div
    {...props}
    className="flex items-center justify-center btn-square btn-xs rounded-md bg-primary text-primary-content shrink-0">
    <ChevronDown size={16} />
  </div>;
};