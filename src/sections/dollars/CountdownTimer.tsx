import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface CountdownTimerProps {
  expireTime: number; // 过期时间戳（秒）
  className?: string;
  onFinished?: (v: boolean) => void;
}

const renderUnit = (value: number, unit: string, size?: string) => (
  <span className={clsx("px-1 font-mono tabular-nums min-w-[32px] bg-primary text-neutral text-center rounded-xs",{ "min-w-[36px]": size === 'large' })}>
    {String(value).padStart(2, "0")}
    {unit}
  </span>
);

export const CountdownTimer = ({ onFinished, expireTime, className = "" }: CountdownTimerProps) => {
  // 使用 useRef 存储倒计时值避免重新渲染
  const timeLeftRef = useRef({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // 使用 useState 仅用于触发重新渲染
  const [, setForceUpdate] = useState<number>(0);

  // 处理倒计时
  useEffect(() => {
    if (!expireTime) return;

    let timerId: NodeJS.Timeout;

    // 计算并更新剩余时间的函数
    const updateRemainingTime = () => {
      const now = new Date().getTime() / 1000; // 转换为秒
      const difference = expireTime - now;

      if (difference <= 0) {
        // 倒计时结束
        clearTimeout(timerId);
        timeLeftRef.current = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        setForceUpdate(prev => prev + 1);
        onFinished?.(true);
        return;
      }

      // 计算剩余时间
      const days = Math.floor(difference / (60 * 60 * 24));
      const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((difference % (60 * 60)) / 60);
      const seconds = Math.floor(difference % 60);

      timeLeftRef.current = { days, hours, minutes, seconds };
      setForceUpdate(prev => prev + 1);

      // 每秒更新一次
      timerId = setTimeout(updateRemainingTime, 1000);
    };

    // 立即执行一次，确保初始值是准确的
    updateRemainingTime();

    return () => {
      clearTimeout(timerId);
    };
  }, [expireTime]);

  const { days, hours, minutes, seconds } = timeLeftRef.current;
  const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;

  // 紧张感分级：始终有颜色，越少越红越动
  const timerClass =
    totalSeconds <= 0
      ? "text-base-content/40"
      : totalSeconds <= 300   // ≤ 5 min：红 + 脉冲
        ? "text-error animate-pulse"
        : totalSeconds <= 3600  // ≤ 1 h：橙红
          ? "text-error/100"
          : totalSeconds <= 86400 // ≤ 24 h：警告黄
            ? "text-warning"
            : "text-primary";     // > 24 h：主色，始终可见

  return (
    <div className={`flex items-center justify-center gap-0.5 ${timerClass} ${className}`}>
      {days > 0 && (
        renderUnit(days, "d")
      )}
      {(days > 0 || hours > 0) && (
        renderUnit(hours, "h")
      )}
      {(days > 0 || hours > 0 || minutes > 0) && (
        renderUnit(minutes, "m")
      )}
      {renderUnit(seconds, "s")}
    </div>
  );
};
