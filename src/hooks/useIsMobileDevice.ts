import { useEffect, useState } from "react";

/**
 * 检测是否是移动设备（基于设备特性，不受横屏影响）
 * 用于游戏等需要稳定设备检测的场景
 */
export function useIsMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkIsMobile = () => {
      // 检测触摸设备
      const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

      // 检测 UA（作为辅助判断）
      const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // 检测是否是 PWA standalone 模式
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

      // 触摸设备 或 移动端 UA 视为移动设备
      return isTouchDevice || mobileUA || isStandalone;
    };

    setIsMobileDevice(checkIsMobile());

    // 这些特性不会因为横屏而改变，所以不需要监听变化
  }, []);

  return isMobileDevice;
}
