"use client";

import { MainRouteContent } from "@/components/next/RouteContent";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Screen = dynamic(
  () =>
    import("./Screen").then((module) => {
      const Component = module.default;
      const beforeLoad = module.beforeLoad;
      return function DynamicScreen() {
        return <MainRouteContent component={Component} beforeLoad={beforeLoad} />;
      };
    }),
  {
    ssr: false,
    loading: () => <div className="min-h-dvh bg-base-300" />
  }
);

export default function ClientPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-base-300" />}>
      <Screen />
    </Suspense>
  );
}
