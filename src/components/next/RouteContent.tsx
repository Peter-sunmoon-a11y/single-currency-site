"use client";

import { LegacyProviders } from "@/components/next/LegacyProviders";
import { MainAppLayout } from "@/components/next/MainAppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { localizeHref } from "@/lib/navigation";
import React, { useEffect, useMemo, useState } from "react";
import type { DehydratedState } from "@tanstack/react-query";

type RouteObject = {
  options?: {
    component?: React.ComponentType;
    beforeLoad?: (args: any) => unknown;
  };
};

type RouteContentProps = {
  component?: React.ComponentType;
  beforeLoad?: (args: any) => unknown;
  route?: RouteObject;
  dehydratedState?: DehydratedState;
};

type GuardBlockResult = {
  type: "block";
  component: React.ComponentType;
};

const isGuardBlockResult = (value: unknown): value is GuardBlockResult => {
  return Boolean(
    value &&
    typeof value === "object" &&
    (value as GuardBlockResult).type === "block" &&
    typeof (value as GuardBlockResult).component === "function"
  );
};

function RouteComponent({ component, beforeLoad, route }: RouteContentProps) {
  const Component = component ?? route?.options?.component;
  const load = beforeLoad ?? route?.options?.beforeLoad;
  const auth = useAuth();
  const pathname = usePathname();
  const locationSearchParams = useSearchParams();
  const search = locationSearchParams.toString();
  const location = useMemo(() => ({
    pathname,
    search: search ? `?${search}` : "",
    href: search ? `${pathname}?${search}` : pathname,
    hash: typeof window === "undefined" ? "" : window.location.hash
  }), [pathname, search]);
  const router = useRouter();
  const [isGuardReady, setIsGuardReady] = useState(!load);
  const [guardBlockedComponent, setGuardBlockedComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!load) {
      setGuardBlockedComponent(null);
      setIsGuardReady(true);
      return;
    }

    setGuardBlockedComponent(null);
    setIsGuardReady(false);

    void Promise.resolve()
      .then(() =>
        load({
          context: { auth },
          location: {
            ...location,
            href: typeof window === "undefined" ? location.href : window.location.href
          }
        })
      )
      .then((result) => {
        if (cancelled) return;

        if (isGuardBlockResult(result)) {
          setGuardBlockedComponent(() => result.component);
        } else {
          setGuardBlockedComponent(null);
        }

        setIsGuardReady(true);
      })
      .catch((error) => {
        const redirect = error as Error & { href?: string };
        if (redirect.message === "APP_CLIENT_REDIRECT" && redirect.href) {
          router.replace(localizeHref(redirect.href));
          return;
        }

        console.error(error);
        if (!cancelled) setIsGuardReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [auth, load, location, router]);

  if (!isGuardReady) {
    return <div className="min-h-dvh bg-base-300" />;
  }

  if (guardBlockedComponent) {
    const GuardBlockedComponent = guardBlockedComponent;
    return <GuardBlockedComponent />;
  }

  return Component ? <Component /> : null;
}

export function MainRouteContent(props: RouteContentProps) {
  const { dehydratedState, ...routeProps } = props;
  return (
    <LegacyProviders dehydratedState={dehydratedState}>
      <MainAppLayout>
        <RouteComponent {...routeProps} />
      </MainAppLayout>
    </LegacyProviders>
  );
}

export function PlainRouteContent(props: RouteContentProps) {
  const { dehydratedState, ...routeProps } = props;
  return (
    <LegacyProviders dehydratedState={dehydratedState}>
      <RouteComponent {...routeProps} />
    </LegacyProviders>
  );
}
