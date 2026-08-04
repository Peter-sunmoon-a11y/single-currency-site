import { cn } from "@/utils/cn.ts";
import { useMemo } from "react";
import qr from "qr.js";

interface TinyQRProps {
  value: string;
  size?: number;
  color?: string;
  bgColor?: string;
  className?: string;
  level?: "L" | "M" | "Q" | "H";
}

export const TinyQR = (
  {
    value,
    className,
    size = 128,
    level = "M",
    color = "#000",
    bgColor = "transparent"
  }: TinyQRProps) => {
  if (!value) {
    return (
      <div
        className={cn("bg-base-200 flex items-center justify-center", className)}
        style={{ width: size, height: size }}
      >
        <span className="text-xs">No QR</span>
      </div>
    );
  }

  const qrData = useMemo(() => {
    try {
      return qr(value, { errorCorrectionLevel: level });
    } catch (error) {
      return null;
    }
  }, [value, level]);

  if (!qrData) {
    return (
      <div
        className={cn("bg-base-200 flex items-center justify-center text-error", className)}
        style={{ width: size, height: size }}
      >
        <span className="text-xs">QR Error</span>
      </div>
    );
  }

  const { modules } = qrData;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${modules.length} ${modules.length}`}
      className={className}
    >
      <rect width={modules.length} height={modules.length} fill={bgColor} />
      {modules.map((row: boolean[], i: number) =>
        row.map((cell: boolean, j: number) =>
          cell ? (
            <rect
              key={`${i}-${j}`}
              x={j}
              y={i}
              width={1}
              height={1}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
};
