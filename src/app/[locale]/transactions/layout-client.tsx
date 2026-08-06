"use client";

import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

export default function TransactionsLayoutClient({ children }: PropsWithChildren) {
  const pathname = usePathname();

  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="p-4 flex flex-col gap-4">
      {children}
    </div>
  );
}
