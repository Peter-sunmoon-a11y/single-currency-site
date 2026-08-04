import type { ReactNode } from "react";
import { Suspense } from "react";
import TransactionsLayoutClient from "./layout-client";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-base-300" />}>
      <TransactionsLayoutClient>{children}</TransactionsLayoutClient>
    </Suspense>
  );
}
