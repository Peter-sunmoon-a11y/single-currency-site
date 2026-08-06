import { useEffect, useState } from "react";
import { ensureTelegramSdkMounted, subscribeTelegramViewportChanges } from "@/utils/telegramWebApp";

function readRootCssPixelVar(variableName: string) {
  if (typeof document === "undefined") return 0;

  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function useRootCssPixelVar(variableName: string) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const updateValue = () => {
      setValue(readRootCssPixelVar(variableName));
    };

    updateValue();

    let disposed = false;
    let unsubscribeViewport: VoidFunction | undefined;

    void ensureTelegramSdkMounted().then((mounted) => {
      if (!mounted || disposed) return;
      unsubscribeViewport = subscribeTelegramViewportChanges(updateValue);
    });

    window.addEventListener("resize", updateValue);

    return () => {
      disposed = true;
      unsubscribeViewport?.();
      window.removeEventListener("resize", updateValue);
    };
  }, [variableName]);

  return value;
}
