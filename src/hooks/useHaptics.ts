import { useCallback } from "react";

type HapticType = "light" | "medium" | "heavy" | "success" | "error";

export const useHaptics = () => {
  const vibrate = useCallback((type: HapticType) => {
    if (!navigator.vibrate) return;

    try {
      switch (type) {
        case "light":
          navigator.vibrate(10);
          break;
        case "medium":
          navigator.vibrate(25);
          break;
        case "heavy":
          navigator.vibrate(50);
          break;
        case "success":
          navigator.vibrate([20, 50, 20, 50, 40]);
          break;
        case "error":
          navigator.vibrate([100, 50, 100]);
          break;
      }
    } catch (e) {
      // Haptics not available
    }
  }, []);

  return { vibrate };
};
