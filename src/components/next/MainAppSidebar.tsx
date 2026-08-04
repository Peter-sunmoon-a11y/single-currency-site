"use client";

import React from "react";

const Sidebar = React.lazy(() => import("@/components/sidebar/Sidebar").then((m) => ({ default: m.Sidebar })));

export function MainAppSidebar() {
  return (
    <React.Suspense fallback={null}>
      <Sidebar />
    </React.Suspense>
  );
}
