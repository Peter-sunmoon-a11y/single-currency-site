import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from "clsx";

export interface CountdownProps {
  /** Target timestamp (in seconds or milliseconds) or Date object */
  target: Date | number;
  /** Whether the target is a duration (true) or absolute time (false) */
  isDuration?: boolean;
  /** Callback when countdown reaches zero */
  onComplete?: () => void;
  /** Custom className for styling */
  className?: string;
  /** Custom render function for the countdown display */
  renderCustom?: (time: { days: number; hours: number; minutes: number; seconds: number }) => React.ReactNode;
}

export const Countdown = ({
  target,
  isDuration = false,
  onComplete,
  className,
  renderCustom,
}: CountdownProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Calculate target timestamp
  const getTargetTime = useCallback((targetValue: Date | number): number => {
    if (isDuration) {
      // If it's a duration, add to current time
      const now = Date.now();
      const durationMs = typeof targetValue === 'number' ? targetValue * 1000 : targetValue.getTime() - now;
      return now + durationMs;
    } else {
      // If it's absolute time
      if (typeof targetValue === 'number') {
        // Auto-detect if timestamp is in seconds or milliseconds
        const timestampInSeconds = targetValue < 4102444800;
        return timestampInSeconds ? targetValue * 1000 : targetValue;
      } else {
        return targetValue.getTime();
      }
    }
  }, [isDuration]);

  // Calculate remaining time
  const calculateTimeRemaining = useCallback((targetTime: number) => {
    const now = Date.now();
    const difference = Math.max(0, targetTime - now);

    const seconds = Math.floor(difference / 1000) % 60;
    const minutes = Math.floor(difference / (1000 * 60)) % 60;
    const hours = Math.floor(difference / (1000 * 60 * 60)) % 24;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
  }, []);

  // Update timer logic
  const updateTimer = useCallback(() => {
    const targetTime = getTargetTime(target);
    const newTime = calculateTimeRemaining(targetTime);
    const isComplete = newTime.days === 0 && newTime.hours === 0 &&
      newTime.minutes === 0 && newTime.seconds === 0;

    setTime(newTime);

    if (isComplete) {
      onComplete?.();
      return;
    }

    timerRef.current = setTimeout(updateTimer, 1000);
  }, [target, getTargetTime, calculateTimeRemaining, onComplete]);

  // Initialize and cleanup timer
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    updateTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [updateTimer]);

  // const pad = (num: number) => String(num).padStart(2, '0');

  // If custom render function is provided, use it
  if (renderCustom) {
    return <>{renderCustom(time)}</>;
  }

  return (
    <div className={clsx("text-2xl flex items-baseline gap-x-1 rtl:flex-row-reverse", className)}>
      <span className="flex items-baseline gap-x-0.5 rtl:flex-row-reverse">
        <span className="countdown overflow-hidden">
          {/*<span style={{ '--value': time.days } as React.CSSProperties}>*/}
            {time.days}
          {/*</span>*/}
        </span>
        <span>d</span>
      </span>
      <span className="flex items-baseline gap-x-0.5 rtl:flex-row-reverse">
        <span className="countdown overflow-hidden">
          {/*<span style={{ '--value': time.hours } as React.CSSProperties}>*/}
            {time.hours}
          {/*</span>*/}
        </span>
        <span>h</span>
      </span>
      <span className="flex items-baseline gap-x-0.5 rtl:flex-row-reverse">
        <span className="countdown overflow-hidden">
          {/*<span style={{ '--value': time.minutes } as React.CSSProperties}>*/}
            {time.minutes}
          {/*</span>*/}
        </span>
        <span>m</span>
      </span>
      <span className="flex items-baseline gap-x-0.5 rtl:flex-row-reverse">
        <span className="countdown overflow-hidden">
          {/*<span style={{ '--value': time.seconds } as React.CSSProperties}>*/}
            {time.seconds}
          {/*</span>*/}
        </span>
        <span>s</span>
      </span>
    </div>
  );
};

export default Countdown;
