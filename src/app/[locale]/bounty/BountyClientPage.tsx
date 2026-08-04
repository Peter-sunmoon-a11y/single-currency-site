"use client";

import { Suspense } from "react";
import { buildHref } from "@/lib/navigation.ts";
import { MainRouteContent } from "@/components/next/RouteContent";
import { queryClient } from "@/integrations/tanstack-query/root-provider.tsx";
import { BountyScreen } from "@/sections/bonus/bounty";
import { CardLoading } from "@/sections/bonus/components/CardLoading.tsx";
import { getBountyStatus } from "@/services/auth/bounty";
import type { ApiResponse } from "@/types/auth.ts";

type BeforeLoadArgs = {
  context: {
    auth: {
      isAuthenticated: boolean;
      isLoading: boolean;
    };
  };
};

const BOUNTY_STATUS_QUERY_KEY = ["bounty", "status"] as const;

const redirectToBonus = () => {
  const error = new Error("APP_CLIENT_REDIRECT") as Error & { href?: string };
  error.href = String(buildHref({ to: "/bonus" }));
  throw error;
};

const beforeLoad = async ({ context }: BeforeLoadArgs) => {
  const { isAuthenticated, isLoading } = context.auth;

  if (isLoading || !isAuthenticated) return;

  const statusData = await queryClient.fetchQuery<ApiResponse<{ is_forbidden: boolean; branch_enabled: boolean }>>({
    queryKey: BOUNTY_STATUS_QUERY_KEY,
    queryFn: () => getBountyStatus(),
  });

  const isAvailable = !!statusData?.data?.branch_enabled;

  if (!isAvailable) {
    redirectToBonus();
  }
};

export default function BountyClientPage({ tab }: { tab: "active" | "completed" | "my" }) {
  const Component = () => <BountyScreen tab={tab} />;

  return (
    <Suspense fallback={<div className="p-4"><CardLoading /></div>}>
      <MainRouteContent component={Component} beforeLoad={beforeLoad} />
    </Suspense>
  );
}
