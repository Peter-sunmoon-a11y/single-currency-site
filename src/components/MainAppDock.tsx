import { LIVE_NAV_ITEMS, MAIN_NAV_ITEMS, type NavItem } from "@/config";
import { isSupportedLocale } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBoundStore } from "@/store";
import { isPWA } from "@/utils/browser";
import { cn } from "@/utils/cn";
import type { LucideProps } from "lucide-react";
import { Compass, Diamond, Headphones, Menu, Trophy, Video } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentType } from "react";
import { useMemo } from "react";
// import { useAuth } from "@/contexts/AuthContext.tsx";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { useAppNavigate } from "@/hooks/useAppNavigate";

const normalizeDockPathname = (pathname: string) => {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (isSupportedLocale(maybeLocale)) {
    const rest = `/${segments.slice(2).join("/")}`.replace(/\/+$/, "");
    return rest === "" ? "/" : rest;
  }
  return pathname;
};

const DOCK_ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  "custom:menu": Menu,
  "custom:explore": Compass,
  "custom:casino": Diamond,
  "custom:sports": Trophy,
  "custom:support": Headphones,
  "custom:live-casino": Video,
};

const DockIcon = ({ icon }: { icon: string }) => {
  const Icon = DOCK_ICON_MAP[icon];
  if (!Icon) return null;
  return <Icon size={20} />;
};

// 为了向后兼容，导出 DockItem 类型别名
export type DockItem = NavItem;

interface DockProps {
  items?: DockItem[];
  visible?: boolean;
}

export const MainAppDock = (props: DockProps) => {
  if (!props.visible) return null;

  return <DockInner {...props} />;
};

const DockInner = ({ items = MAIN_NAV_ITEMS }: DockProps) => {
  const navigate = useAppNavigate();
  const pathname = usePathname();
  const locationSearchParams = useSearchParams();
  const googleId = useBoundStore((state) => state.user?.google_id);

  // 这里不能只看 URL 上的 `auth_type=google`，因为它只能表示当前流程经过过 Google 登录，
  // 不能准确表示当前账号真的绑定了 Google，也不能表示当前页面正运行在 PWA 容器里。
  // 底部安全区是否去掉，要同时满足这两个真实运行条件。
  const shouldRemoveSafeAreaInsetBottom = Boolean(googleId) && isPWA();

  const location = {
    pathname,
    search: locationSearchParams.toString() ? `?${locationSearchParams.toString()}` : "",
    href: locationSearchParams.toString() ? `${pathname}?${locationSearchParams.toString()}` : pathname,
    hash: typeof window === "undefined" ? "" : window.location.hash,
  };
  const toggleDrawer = useBoundStore((state) => state.toggleSidebarDrawer);

  const handleItemClick = (e: React.MouseEvent, item: DockItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (location.pathname.startsWith("/sports") && item.href !== "/sports") {
      (window as any).__betby_disable_route_sync = true;
    }

    if (item.href === "#") {
      toggleDrawer();
    } else if (item.href === "back") {
      navigate({ to: "/casino" });
    } else if (item.href === "/sports") {
      navigate({ to: "/sports", search: { "bt-path": undefined } });
    } else if (item.href === "/casino") {
      navigate({ to: "/casino" });
    } else {
      navigate({ to: item.href });
    }
  };

  // 确定是否应该隐藏（自动隐藏功能）
  const shouldHide = false;
  // const shouldHide = isMobile && isScrolled && scrollDirection === 'down';

  return (
    <div
      className={cn(
        "app-dock",
        // *********底部菜单的位置控制⚠️**********
        "fixed bottom-0 left-0 right-0",
        shouldRemoveSafeAreaInsetBottom ? "pb-0" : "pb-[var(--safe-area-inset-bottom)]",
        // *********底部菜单的位置控制⚠️**********
        "bg-base-300 border-t-2 border-t-primary/15 z-[997]",
        "transition-transform duration-300 ease-in-out",
        shouldHide ? "translate-y-full" : "translate-y-0", // 控制菜单的显示和隐藏
      )}
      style={{ overscrollBehavior: "contain", touchAction: "pan-x" }}
    >
      <div
        className="grid h-[var(--app-dock-height)] font-bold text-base-content/50"
        style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const normalizedPathname = normalizeDockPathname(location.pathname);
          const normalizedItemHref = item.href.includes("?") ? item.href.split("?")[0] : item.href;
          const itemHasQuery = item.href.includes("?");
          // 处理查询参数的active状态判断
          const isActive = itemHasQuery
            ? normalizedPathname === normalizedItemHref ||
              location.pathname + location.search === item.href ||
              `${normalizedPathname}${location.search}` === item.href ||
              location.href.includes(item.href)
            : normalizedPathname === normalizedItemHref;
          return <InnerDockGuard key={item.label} item={item} isActive={isActive} onClick={handleItemClick} />;
        })}
      </div>
    </div>
  );
};

const InnerDockGuard = ({
  item,
  isActive,
  onClick,
}: {
  item: DockItem;
  isActive: boolean;
  onClick: (e: React.MouseEvent, item: DockItem) => void;
}) => {
  const { t } = useTranslation();

  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();

  // 是否开启 betby
  // betby 入口 sports 可能被替换
  const _item = useMemo(() => {
    return baseConfig?.data?.is_show_betby === 0 && item.href === "/sports" ? LIVE_NAV_ITEMS : item;
  }, [baseConfig?.data?.is_show_betby, item]);

  return (
    <button
      key={_item.label}
      className={cn("relative inline-flex flex-col items-center justify-center", isActive ? "text-primary" : "")}
      onClick={(e) => onClick(e, _item)}
    >
      <DockIcon icon={_item.icon} />
      <span
        className={cn(
          "text-[13px] font-bold text-base-content/60 truncate max-w-full overflow-hidden whitespace-nowrap",
          isActive ? "text-primary" : "",
        )}
      >
        {t(_item.label)}
      </span>
    </button>
  );
};
