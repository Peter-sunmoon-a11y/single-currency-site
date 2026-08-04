import { type MouseEvent, useRef, useState } from 'react';
import { useTranslation } from "@/lib/i18n/react-i18next";

interface WinTickerProps {
  wins: Array<{ id: number; amount: number; displayAmount: string; currencySymbol: string; colorBg: string; colorBorder: string; colorNum: string }>;
}

export const WinTicker = ({ wins }: WinTickerProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);

  const mix = (base: string, other: string, ratio: number) => {
    const t = Math.max(0, Math.min(1, ratio));
    return `color-mix(in oklab, ${base} ${(1 - t) * 100}%, ${other} ${t * 100}%)`;
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    setIsDragging(true);
    setDragStartX(event.clientX);
    setScrollStartLeft(container.scrollLeft);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container || !isDragging) return;
    const deltaX = event.clientX - dragStartX;
    container.scrollLeft = scrollStartLeft - deltaX;
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="h-[40px] mx-4 mt-2 rounded-lg overflow-hidden"
      style={{
        background: "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 22%, var(--color-base-200)) 0%, var(--color-base-200) 60%)",
      }}
    >
      {wins.length === 0 && <div className="text-base-content/60 text-sm h-full flex items-center justify-center">🎮 {t("common:pleaseStartGame")}</div>}
      {/* 滚动列表 */}
      <div
        ref={containerRef}
        className={`flex items-center gap-1 px-2 py-2 overflow-x-auto overflow-y-hidden whitespace-nowrap ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        {wins.map((win) => {
          const border = mix(win.colorBorder, win.colorNum, 0.12);

          return (
            <div
              key={win.id}
              className="px-1.5 py-0.5 rounded-md text-xs font-bold animate-slide-in-left whitespace-nowrap border transition-all duration-300 shrink-0"
              style={{
                borderColor: border,
                background: `color-mix(in oklab, ${win.colorBg} 18%, transparent)`,
                color: win.colorNum,
              }}
            >
              +{win.displayAmount}
            </div>
          );
        })}
      </div>
    </div>
  );
};
