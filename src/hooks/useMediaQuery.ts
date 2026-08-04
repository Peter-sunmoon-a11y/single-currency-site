import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  const subscribe = (onStoreChange: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }

    const media = window.matchMedia(query);
    const listener = () => onStoreChange();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }

    media.addListener(listener);
    return () => media.removeListener(listener);
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
