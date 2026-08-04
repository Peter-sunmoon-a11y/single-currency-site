"use client";
import React from "react";
import { cn } from "@/utils/cn";

interface BackgroundGradientProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: BackgroundGradientProps) => {
  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-r from-primary via-secondary to-accent opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200",
          animate && "animate-tilt"
        )}
      />
      <div
        className={cn(
          "relative bg-base-100 rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};