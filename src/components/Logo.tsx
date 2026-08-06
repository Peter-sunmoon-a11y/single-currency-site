"use client";

import { useBoundStore } from "@/store";
import { useEffect, useState } from "react";

export default function Logo() {
  const [isMounted, setIsMounted] = useState(false);
  const user = useBoundStore((state) => state.user);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const shouldShowCompactLogo = isMounted && Boolean(user);

  return (
    <div className="flex relative items-center">
      {shouldShowCompactLogo
        ? <img src="/favicon/favicon-96x96.png" alt="" className={"w-9 h-9"} />
        : <img src="/favicon/logo-200w.png" alt="" className={"w-25"} />}
      {/*<p className="font-bold text-lg text-primary">{siteConfig.name}</p>*/}
    </div>
  );
}

export function BigLogo() {
  return (
    <div className="flex relative items-center">
      <img src="/favicon/logo-200w.png" alt="" className={"w-25"} />
      {/*<p className="font-bold text-lg text-primary">{siteConfig.name}</p>*/}
    </div>
  );
}
