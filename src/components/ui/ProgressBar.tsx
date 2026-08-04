import { cn } from "@/utils/cn";

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  height?: "sm" | "md" | "lg"; // h-1.5, h-2, h-3
  showStripes?: boolean; // 是否在progress为0时显示条纹
  animated?: boolean; // 是否添加动画效果
}

export function ProgressBar({ 
  progress, 
  className, 
  height = "md", 
  showStripes = true,
  animated = false 
}: ProgressBarProps) {
  const heightClasses = {
    sm: "h-1.5",
    md: "h-2", 
    lg: "h-3"
  };

  const progressBarHeight = heightClasses[height];

  return (
    <div 
      className={cn(
        "w-full bg-base-300 rounded-full relative overflow-hidden",
        progressBarHeight,
        className
      )}
      style={progress === 0 && showStripes ? {
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          oklch(from var(--color-base-content) l c h / 0.05) 0px,
          oklch(from var(--color-base-content) l c h / 0.05) 5px,
          oklch(from var(--color-base-content) l c h / 0.1) 5px,
          oklch(from var(--color-base-content) l c h / 0.1) 10px
        )`
      } : {}}
    >
      <div
        className={cn(
          "bg-primary rounded-full transition-all duration-300",
          progressBarHeight,
          animated && "animate-pulse"
        )}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
}

interface ProgressWithLabelProps extends ProgressBarProps {
  label?: string;
  showPercentage?: boolean;
  labelClassName?: string;
  percentageClassName?: string;
}

export function ProgressWithLabel({
  progress,
  label = "Progress",
  showPercentage = true,
  labelClassName,
  percentageClassName,
  ...progressBarProps
}: ProgressWithLabelProps) {
  return (
    <div className="flex-1">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && (
            <span className={cn("text-sm text-base-content/50 font-semibold", labelClassName)}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={cn("text-sm font-semibold text-base-content/50", percentageClassName)}>
              {progress}%
            </span>
          )}
        </div>
      )}
      <ProgressBar progress={progress} {...progressBarProps} />
    </div>
  );
}