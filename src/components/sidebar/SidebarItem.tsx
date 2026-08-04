import { buildHref } from "@/lib/navigation";
import { useBoundStore } from "@/store";
import { useLocale } from "next-intl";
import Link from "next/link";
import { memo, useCallback, useMemo } from "react";
import Iconify from "../iconify";
import { NewBadge } from "@/components/ui/NewBadge";

type SidebarItemProps = {
  icon?: string;
  label?: string;
  to?: string;
  search?: Record<string, string | undefined>;
  isActive?: boolean;
  isMini?: boolean;
  isNewGame?: boolean;
};

const SidebarItemComponent = ({ icon, label, to, search, isActive, isMini, isNewGame }: SidebarItemProps) => {
  const locale = useLocale();
  const closeDrawer = useBoundStore((state) => state.closeSidebarDrawer);
  const href = String(buildHref({ to: to ?? "", search }, undefined, locale));

  // Memoize className computation to avoid recalculation on every render
  const linkClassName = useMemo(
    () => `
    flex items-center transition-all duration-200
    relative text-base-content/70
    active:bg-base-200 focus-visible:bg-base-200
    active:text-base-content focus-visible:text-base-content
    bg-base-100 rounded-lg
    bg-gradient-to-r from-primary/25 to-primary/8 border-l-2 border-primary/50
    ${isActive ? "text-primary bg-primary/10" : ""}
    ${"gap-2 pl-2 py-2"}
  `,
    [isActive, isMini],
  );

  const handleClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      event.preventDefault();
      return;
    }

    closeDrawer();
  }, [closeDrawer, href, isActive]);

  return (
    <li className={"list-none relative"}>
      <Link href={href} className={linkClassName} onClick={handleClick}>
        {icon && <Iconify icon={icon} width={16} height={16} className="shrink-0 text-base-content" />}

        <div className="flex items-center text-base-content text-sm font-bold whitespace-nowrap overflow-hidden">
          {label ?? ""}
        </div>
      </Link>
      {isNewGame && <NewBadge />}
    </li>
  );
};

// Memoize the component to prevent unnecessary re-renders when parent components update
export const SidebarItem = memo(SidebarItemComponent);
