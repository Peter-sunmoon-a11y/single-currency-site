import { useEffect, useState } from "react";

export function useIdleEnabled(enabled = true) {
  const [idleReady, setIdleReady] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIdleReady(false);
      return;
    }

    if (!("requestIdleCallback" in window)) return;

    const idleId = window.requestIdleCallback(() => {
      setIdleReady(true);
    });

    return () => window.cancelIdleCallback(idleId);
  }, [enabled]);

  return enabled && idleReady;
}
