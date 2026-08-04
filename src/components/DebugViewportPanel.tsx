import { useEffect, useState } from "react";

/**
 * 可视化调试面板 - 在真机上直接显示各项视口/安全区指标
 * 调试完成后删除此文件
 */
export function DebugViewportPanel() {
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const cs = getComputedStyle(root);

      setData({
        innerHeight: `${window.innerHeight}`,
        "screen.height": `${screen.height}`,
        "vv.height": window.visualViewport ? `${window.visualViewport.height}` : "N/A",
        "vv.offsetTop": window.visualViewport ? `${window.visualViewport.offsetTop}` : "N/A",
        "innerH - vv.H": window.visualViewport ? `${Math.round(window.innerHeight - window.visualViewport.height)}` : "N/A",
        "screen.H - innerH": `${screen.height - window.innerHeight}`,
        "screen.H - vv.H": window.visualViewport ? `${screen.height - window.visualViewport.height}` : "N/A",
        "env(sai-bottom)": cs.getPropertyValue("--_debug-env-sai-bottom") || "0px",
        "--tg-sai-bottom": cs.getPropertyValue("--tg-safe-area-inset-bottom") || "unset",
        "--tg-csai-bottom": cs.getPropertyValue("--tg-content-safe-area-inset-bottom") || "unset",
        "--safe-area-bottom": cs.getPropertyValue("--safe-area-inset-bottom") || "unset",
        "--android-nav-off": cs.getPropertyValue("--android-nav-offset") || "unset",
        "--tg-vp-height": cs.getPropertyValue("--tg-viewport-height") || "unset",
        isFullscreen: root.classList.contains("tg-fullscreen") ? "true" : "false",
      });
    };

    // 注入一个 CSS 变量来读取 env(safe-area-inset-bottom) 的实际值
    const style = document.createElement("style");
    style.textContent = `:root { --_debug-env-sai-bottom: env(safe-area-inset-bottom, 0px); }`;
    document.head.appendChild(style);

    update();
    const timer = setInterval(update, 500);
    window.visualViewport?.addEventListener("resize", update);
    window.addEventListener("resize", update);

    return () => {
      clearInterval(timer);
      window.visualViewport?.removeEventListener("resize", update);
      window.removeEventListener("resize", update);
      style.remove();
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 60,
        right: 4,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#0f0",
        fontSize: 10,
        fontFamily: "monospace",
        padding: 6,
        borderRadius: 6,
        maxWidth: 220,
        pointerEvents: "none",
        lineHeight: 1.4,
      }}
    >
      {Object.entries(data).map(([k, v]) => (
        <div key={k}>
          <span style={{ color: "#aaa" }}>{k}:</span> {v}
        </div>
      ))}
    </div>
  );
}
