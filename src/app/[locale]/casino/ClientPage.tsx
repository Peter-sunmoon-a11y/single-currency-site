"use client";

import { MainRouteContent } from "@/components/next/RouteContent";
import type { DehydratedState } from "@tanstack/react-query";
import { Suspense } from "react";
import Screen, { beforeLoad } from "./Screen";

export default function ClientPage({ dehydratedState }: { dehydratedState?: DehydratedState }) {
  return (
    <Suspense fallback={null}>
      <MainRouteContent component={Screen} beforeLoad={beforeLoad} dehydratedState={dehydratedState} />
    </Suspense>
  );
}
