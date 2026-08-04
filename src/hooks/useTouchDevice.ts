import { useCallback, useEffect, useState } from "react";

/**
 * 检测设备是否支持触摸的 Hook
 * @returns {boolean} 是否为触摸设备
 */
export const useTouchDevice = (): boolean => {
  const [isTouchDevice, setTouchDevice] = useState(false);

  // 设备检测函数
  const checkTouchDevice = useCallback((): boolean => {
    // 安全检查，避免 SSR 错误
    if (typeof window === "undefined") return false;

    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      // 额外的检测方法
      (navigator as any).msMaxTouchPoints > 0
    );
  }, []);

  useEffect(() => {
    // 初始检测
    setTouchDevice(checkTouchDevice());

    // 媒体查询监听器
    let media_query: MediaQueryList | null = null;

    try {
      media_query = window.matchMedia("(pointer: coarse)");

      const handleMediaChange = (): void => {
        setTouchDevice(checkTouchDevice());
      };

      // 现代浏览器
      if (media_query.addEventListener) {
        media_query.addEventListener("change", handleMediaChange);
      } else {
        // 旧版浏览器兼容
        (media_query as any).addListener(handleMediaChange);
      }

      // 清理函数
      return () => {
        if (media_query) {
          if (media_query.removeEventListener) {
            media_query.removeEventListener("change", handleMediaChange);
          } else {
            (media_query as any).removeListener(handleMediaChange);
          }
        }
      };
    } catch (error) {
      // 静默处理媒体查询错误
      console.warn("Touch device detection failed:", error);
      return undefined;
    }
  }, [checkTouchDevice]);

  return isTouchDevice;
};
