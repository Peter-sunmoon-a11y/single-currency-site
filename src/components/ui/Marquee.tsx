import { useRef, useEffect, useState, ReactNode, memo, CSSProperties } from "react";

interface MarqueeProps {
  children: ReactNode;
  /** 滚动速度（像素/秒） */
  speed?: number;
  /** 悬停时暂停 */
  pauseOnHover?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 无限滚动走马灯组件
 * - 内容宽度 > 容器宽度时自动滚动
 * - 使用 CSS animation 实现丝滑动画
 * - GPU 加速，无 JS 抖动
 * - 支持 RTL 方向
 */
export const Marquee = memo((
  {
    children,
    speed = 50,
    pauseOnHover = true,
    className = ""
  }: MarqueeProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [marqueeState, setMarqueeState] = useState({
    isRTL: false,
    shouldScroll: false,
    duration: 0,
    scrollDistance: 0
  });

  // 检测RTL方向
  useEffect(() => {
    const checkDirection = () => {
      const isRTLDir = document.documentElement.dir === "rtl" ||
        getComputedStyle(document.body).direction === "rtl";
      setMarqueeState(prev => ({ ...prev, isRTL: isRTLDir }));
    };

    checkDirection();

    // 监听方向变化
    const observer = new MutationObserver(checkDirection);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"]
    });

    return () => observer.disconnect();
  }, []);

  // 检测内容是否超出容器，计算动画时长和滚动距离
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const checkSize = () => {
      const contentWidth = content.scrollWidth;
      const containerWidth = container.clientWidth;
      const needsScroll = contentWidth > containerWidth;
      setMarqueeState(prev => ({ ...prev, shouldScroll: needsScroll }));

      if (needsScroll && speed > 0) {
        // 滚动距离 = 内容宽度 + gap
        const totalWidth = contentWidth + 8; // gap-2 = 8px
        setMarqueeState(prev => ({
          ...prev,
          scrollDistance: totalWidth,
          duration: totalWidth / speed
        }));
      }
    };

    checkSize();
    const observer = new ResizeObserver(checkSize);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children, speed]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      dir={marqueeState.isRTL ? "rtl" : "ltr"}
    >
      <div
        className="flex"
        style={{
          "--marquee-distance": marqueeState.isRTL ? `${marqueeState.scrollDistance}px` : `-${marqueeState.scrollDistance}px`,
          animationName: marqueeState.shouldScroll ? `marquee-scroll` : "none",
          animationDuration: `${marqueeState.duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: "running",
          backfaceVisibility: "hidden",
          willChange: "transform"
        } as CSSProperties}
        onMouseEnter={(e) => {
          if (pauseOnHover && marqueeState.shouldScroll) {
            (e.currentTarget as HTMLElement).style.animationPlayState = "paused";
          }
        }}
        onMouseLeave={(e) => {
          if (pauseOnHover && marqueeState.shouldScroll) {
            (e.currentTarget as HTMLElement).style.animationPlayState = "running";
          }
        }}
      >
        <div ref={contentRef} className="flex shrink-0 gap-1">
          {children}
        </div>
        {marqueeState.shouldScroll && (
          <div className={`flex shrink-0 gap-1 ${marqueeState.isRTL ? "mr-2" : "ml-2"}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
});
