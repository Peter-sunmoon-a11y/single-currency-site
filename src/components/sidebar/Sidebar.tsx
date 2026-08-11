import { usePathname, useSearchParams } from "next/navigation";
import { usePortalContainer } from "@/contexts/PortalContainerContext";
import { useBaseConfig, useIsLeagueEnabled } from "@/hooks/api/usePublic";
import { supportedLanguages } from "@/lib/i18n/config";
import { useBoundStore } from "@/store";
import React from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Drawer } from "vaul";
import { useAuth } from "@/contexts/AuthContext";
import { useAppNavigate } from "@/hooks/useAppNavigate";
import {
  BETBY_GUARDED_IDS,
  CASINO_ITEMS,
  LEAGUE_EXCLUDED_IDS,
  type NavigationItem,
  NAVIGATION_ITEMS, RTP_EXCLUDED_IDS,
  SHOW_NEW_GAME_FLAG,
  SPORTS_NAVIGATION_ITEMS
} from "./config";
import { SidebarItem } from "./SidebarItem";
import { toUrlSearchParams } from "@/utils/urlSearchParams";
import { BetByLinkGuard } from "@/components/sidebar/BetByLinkGuard.tsx";
import { Headphones, LogOutIcon } from "lucide-react";
import clsx from "clsx";

type SidebarLinkConfig = {
  to: string;
  search?: Record<string, string | undefined>;
};

const parseSidebarPath = (path?: string): SidebarLinkConfig => {
  if (!path) {
    return { to: "", search: undefined };
  }

  if (!path.includes("?")) {
    return { to: path, search: undefined };
  }

  const [pathname, searchString = ""] = path.split("?");
  const searchParams = new URLSearchParams(searchString);
  const search: Record<string, string | undefined> = {};

  for (const [key, value] of searchParams.entries()) {
    search[key] = value;
  }

  return { to: pathname, search };
};

const stripLocale = (value: string) =>
  value.replace(new RegExp(`^/(${supportedLanguages.join("|")})(?=/|$)`), "").replace(/\/$/, "") || "/";

const isPathActive = (path: string | undefined, pathname: string, search: Record<string, string>) => {
  if (!path) return false;
  const currentPath = stripLocale(pathname);

  if (!path.includes("?")) return currentPath === stripLocale(path);
  const [itemPathname, itemSearch = ""] = path.split("?");
  if (currentPath !== stripLocale(itemPathname)) return false;
  const itemParams = new URLSearchParams(itemSearch);
  for (const [key, value] of itemParams.entries()) {
    if ((search[key] ?? "") !== value) return false;
  }
  return true;
};

function SidebarNav({ className }: { className?: string }) {
  const isAuthenticated = !!useBoundStore((state) => state.user);
  const isLoading = !useBoundStore((state) => state.isInitialized);
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof document === "undefined") {
      return "light";
    }

    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  });

  const { isLeagueEnabled } = useIsLeagueEnabled();

  const { t } = useTranslation(["common", "bonus"]);

  const { data: baseConfig } = useBaseConfig();

  const isRtpEnabled = baseConfig?.data?.bonus_switch?.rtp_activity !== 0;

  React.useEffect(() => {
    const root = document.documentElement;

    const syncTheme = () => {
      setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={className ?? "mt-3 flex flex-col flex-1 overflow-y-auto overflow-x-hidden flex-nowrap w-full hide-scrollbar"}
    >
      <div>
        <div className="grid grid-cols-1 gap-1">
          {NAVIGATION_ITEMS(t, isAuthenticated).map((item: NavigationItem, index) => {
            if (item.type === "action" && item.action === "toggle-theme") {
              return (
                <React.Fragment key={item.id || `${item.type}-${index}`}>
                  <SidebarItem
                    icon={theme === "dark" ? "custom:sun" : "custom:moon"}
                    label={item.label}
                    trailingLabel={theme === "dark" ? "Dark" : "Light"}
                    onClick={() => {
                      window.__toggleTheme?.();
                    }}
                    isMini={false}
                  />
                </React.Fragment>
              );
            }
            if (item.type !== "item") return null;
            if (!isRtpEnabled && RTP_EXCLUDED_IDS.some(id => item.id?.includes(id))) return null;
            if (!isLeagueEnabled && LEAGUE_EXCLUDED_IDS.some(id => item.id?.includes(id))) return null;
            const { to, search } = parseSidebarPath(item.path);
            return (
              <React.Fragment key={item.id || `${item.type}-${index}`}>
                <RouteAwareSidebarItem
                  icon={item.icon}
                  label={item.label}
                  to={to}
                  search={search}
                  isMini={false}
                  path={item.path}
                />
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div>
        <h2 className="text-base font-bold text-primary uppercase my-2">{t("menu:explore")}</h2>
        <div className="grid grid-cols-1 gap-1">
          {CASINO_ITEMS(t, isAuthenticated, isLoading).map((item, index) => {
            if (isLeagueEnabled && LEAGUE_EXCLUDED_IDS.some(id => item.id?.includes(id))) return null;
            if (item.type !== "item") return null;
            const { to, search } = parseSidebarPath(item.path);
            const isPrediction = BETBY_GUARDED_IDS.has(item.id);
            const node = (
              <React.Fragment key={item.id || `${item.type}-${index}`}>
                <RouteAwareSidebarItem
                  icon={item.icon}
                  label={item.label}
                  to={to}
                  search={search}
                  isMini={false}
                  isNewGame={SHOW_NEW_GAME_FLAG.has(item?.id)}
                  path={item.path}
                />
              </React.Fragment>
            );
            return isPrediction ? <BetByLinkGuard key={item.id}>{node}</BetByLinkGuard> : node;
          })}
        </div>
      </div>
      <BetByLinkGuard>
        <div>
          <h2 className="text-base font-bold text-primary uppercase my-2">{t("explore:sports")}</h2>
          <div className="grid grid-cols-1 gap-1">
            {SPORTS_NAVIGATION_ITEMS(t).map((item, index) => {
              if (item.type !== "item") return null;
              const { to, search } = parseSidebarPath(item.path);
              return (
                <React.Fragment key={item.id || `${item.type}-${index}`}>
                  <RouteAwareSidebarItem
                    icon={item.icon}
                    label={item.label}
                    to={to}
                    search={search}
                    isMini={false}
                    path={item.path}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </BetByLinkGuard>
    </nav>
  );
}

function RouteAwareSidebarItem({
                                 path,
                                 ...props
                               }: React.ComponentProps<typeof SidebarItem> & { path?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = toUrlSearchParams(
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  ) as unknown as Record<string, string>;

  return <SidebarItem {...props} isActive={isPathActive(path, pathname, currentSearch)} />;
}

function SidebarQuickActions({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation("common");
  const navigate = useAppNavigate();
  const { user, logout } = useAuth();
  const [isLogoutPending, setIsLogoutPending] = React.useState(false);

  if (!user) {
    return null;
  }

  const actionClassName = `
    btn btn-primary btn-md
  `;

  return (
    <div className="flex gap-1">
      <button
        type="button"
        className={actionClassName}
        onClick={() => {
          onClose();
          void navigate({ to: "/finance/deposit" });
        }}
      >
        <span className="truncate uppercase">{t("common.deposit")}</span>
      </button>
      <button
        type="button"
        className={clsx(actionClassName, "btn-square")}
        disabled={isLogoutPending}
        onClick={() => {
          if (isLogoutPending) return;
          setIsLogoutPending(true);
          onClose();
          void logout().finally(() => {
            setIsLogoutPending(false);
          });
        }}
      >
        <LogOutIcon size={20} />
      </button>

      <button
        type="button"
        className={clsx(actionClassName, "btn-square")}
        onClick={() => {
          void navigate({ to: "/customer-service" });
          onClose();
        }}
      >
        <Headphones size={20} />
      </button>
    </div>
  );
}

function MobileDrawer() {
  const isDrawerOpen = useBoundStore((state) => state.isSidebarDrawerOpen);
  const closeDrawer = useBoundStore((state) => state.closeSidebarDrawer);
  const portalContainer = usePortalContainer();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const previousRouteRef = React.useRef<{ pathname: string; search: string } | null>(null);

  React.useEffect(() => {
    const previousRoute = previousRouteRef.current;
    previousRouteRef.current = { pathname, search };

    if (!previousRoute) {
      return;
    }

    if ((previousRoute.pathname !== pathname || previousRoute.search !== search) && isDrawerOpen) {
      closeDrawer();
    }
  }, [closeDrawer, isDrawerOpen, pathname, search]);

  return (
    <Drawer.Root
      open={isDrawerOpen}
      onOpenChange={(open) => !open && closeDrawer()}
      preventScrollRestoration={false}
      shouldScaleBackground={false}
      direction="left"
    >
      <Drawer.Portal {...(portalContainer ? { container: portalContainer } : {})}>
        <Drawer.Title style={{ display: "none" }} />
        <Drawer.Overlay className="fixed inset-0 bg-black/75 z-[998]" />
        <Drawer.Content
          className="fixed left-0 min-w-[75%] bg-transparent z-[999] outline-none"
          style={{
            top: "calc(var(--safe-area-inset-top) + var(--app-sidebar-top-offset))",
            bottom: "calc(var(--safe-area-inset-bottom) + var(--app-sidebar-bottom-gap))"
          }}
        >
          <div
            className={"ml-4 h-full bg-base-200 flex flex-col overflow-hidden p-4 rounded-lg"}>
            <div className="flex-1 flex flex-col gap-1 overflow-hidden">
              <SidebarQuickActions onClose={closeDrawer} />
              {/*<SupportButton onClose={closeDrawer} />*/}
              <SidebarNav />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export const Sidebar = () => {
  return <MobileDrawer />;
};
