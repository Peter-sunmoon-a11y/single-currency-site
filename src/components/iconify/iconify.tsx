import { runtimeConfig } from "@/lib/env";
import { cn } from "@/utils/cn";
import type { LucideProps } from "lucide-react";

import { LUCIDE_ICON_MAP } from "./iconify-lucide-map";
import { SVG_ICON_MAP } from "./iconify-svg-map";

interface IconifyProps extends LucideProps {
  icon: string;
}

const Iconify = ({ icon, className, width, height, size, ...rest }: IconifyProps) => {
  const sz = size ?? (typeof width === "number" ? width : typeof height === "number" ? height : 20);

  const svgEntry = SVG_ICON_MAP[icon];
  if (svgEntry) {
    const viewBox = typeof svgEntry === "string" ? "0 0 24 24" : svgEntry.viewBox;
    const paths = typeof svgEntry === "string" ? [svgEntry] : "paths" in svgEntry ? svgEntry.paths : [svgEntry.d];
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={sz} height={sz} viewBox={viewBox} className={cn("inline-flex", className)}>
        {paths.map((d, i) => (
          <path key={i} fill="currentColor" d={d} />
        ))}
      </svg>
    );
  }

  const LucideIcon = LUCIDE_ICON_MAP[icon];
  if (!LucideIcon) {
    if (!runtimeConfig.isProd) {
      console.warn(`[Iconify] unmapped icon: "${icon}"`);
    }
    return null;
  }
  return <LucideIcon size={sz} className={cn("inline-flex", className)} {...rest} />;
};

Iconify.displayName = "Iconify";

export default Iconify;
