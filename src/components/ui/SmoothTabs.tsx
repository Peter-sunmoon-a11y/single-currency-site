import * as React from "react";
import { cn } from "@/utils/cn";

export interface TabItem {
  id: string;
  label: React.ReactNode;
}

type TabSize = "xs" | "sm" | "md" | "lg" | "xl";

interface SmoothTabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  layoutId?: string;
  orientation?: "horizontal" | "vertical";
  activeColor?: string;
  size?: TabSize;
}

const sizeClasses: Record<TabSize, string> = {
  xs: "h-6 min-h-6 text-xs",
  sm: "h-8 min-h-8 text-sm",
  md: "h-10 min-h-10 text-base",
  lg: "h-12 min-h-12 text-lg",
  xl: "h-14 min-h-14 text-xl",
};

export function SmoothTabs({
  items,
  value,
  onChange,
  className,
  layoutId: _layoutId = "smooth-tabs",
  orientation = "horizontal",
  activeColor = "bg-primary/5 !opacity-[1]",
  size = "md",
}: SmoothTabsProps) {
  const isVertical = orientation === "vertical";
  const sizeClass = sizeClasses[size];

  const handleTabClick = (tabId: string) => {
    onChange(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tabId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabClick(tabId);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Smooth tabs"
      className={cn(
        "relative p-1 rounded-lg",
        isVertical ? "flex flex-col space-y-1" : "flex items-center",
        className
      )}
    >
      {items.map((item) => {
        const isSelected = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={`panel-${item.id}`}
            id={`tab-${item.id}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => handleTabClick(item.id)}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            className={cn(
              "relative z-10 flex items-center justify-center rounded-lg transition-colors duration-200 px-2  sm:px-4 bg-transparent border-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-bold",
              sizeClass,
              isVertical ? "w-full" : "flex-1",
              isSelected
                ? "text-primary"
                : "text-base-content/70 hover:text-primary"
            )}
          >
            {isSelected && (
              <div className={cn("absolute inset-0 rounded-lg", activeColor)} />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
