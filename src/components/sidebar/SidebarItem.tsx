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
  trailingLabel?: string;
  to?: string;
  search?: Record<string, string | undefined>;
  onClick?: () => void;
  isActive?: boolean;
  isMini?: boolean;
  isNewGame?: boolean;
};

const SidebarItemComponent = ({ icon, label, trailingLabel, to, search, onClick, isActive, isMini, isNewGame }: SidebarItemProps) => {
  const locale = useLocale();
  const closeDrawer = useBoundStore((state) => state.closeSidebarDrawer);
  const href = String(buildHref({ to: to ?? "", search }, undefined, locale));
  const isAction = !!onClick || !to;

  // Memoize className computation to avoid recalculation on every render
  const linkClassName = useMemo(
    () => `
    flex items-center transition-all duration-200
    w-full
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

  const handleLinkClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isActive) {
      event.preventDefault();
      return;
    }

    closeDrawer();
  }, [closeDrawer, href, isActive]);

  const handleActionClick = useCallback(() => {
    onClick?.();
    closeDrawer();
  }, [closeDrawer, onClick]);

  return (
    <li className={"list-none relative"}>
      {isAction ? (
        <button
          type="button"
          className={`${linkClassName} justify-between`}
          aria-pressed={isAction}
          onClick={handleActionClick}
        >
          <span className="flex min-w-0 items-center gap-2 overflow-hidden">
            {icon && <Iconify icon={icon} width={16} height={16} className="shrink-0 text-base-content" />}

            <span className="truncate text-sm font-bold text-base-content">
              {label ?? ""}
              <sub className={'ml-2 text-base-content/60 text-sm italic'}>{trailingLabel}</sub>
            </span>
          </span>
        </button>
      ) : (
        <Link href={href} className={linkClassName} onClick={handleLinkClick}>
          {icon && <Iconify icon={icon} width={16} height={16} className="shrink-0 text-base-content" />}

          <div className="flex items-center text-base-content text-sm font-bold whitespace-nowrap overflow-hidden">
            {label ?? ""}
          </div>
        </Link>
      )}
      {isNewGame && <NewBadge />}
    </li>
  );
};

// Memoize the component to prevent unnecessary re-renders when parent components update
export const SidebarItem = memo(SidebarItemComponent);
