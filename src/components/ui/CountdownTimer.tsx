import { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
  expireTime: number; // 过期时间戳（秒）
  className?: string;
}

export const CountdownTimer = ({ expireTime, className = "" }: CountdownTimerProps) => {
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

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <div>
        <span className="countdown font-mono">
          {/*<span style={{ '--value': timeLeftRef.current.days } as React.CSSProperties} aria-live="polite">*/}
          {timeLeftRef.current.days}
          {/*</span>*/}
        </span>
        d
      </div>
      <div>
        <span className="countdown font-mono">
          {/*<span style={{ '--value': timeLeftRef.current.hours } as React.CSSProperties} aria-live="polite">*/}
          {timeLeftRef.current.hours}
          {/*</span>*/}
        </span>
        h
      </div>
      <div>
        <span className="countdown font-mono">
          {/*<span style={{ '--value': timeLeftRef.current.minutes } as React.CSSProperties} aria-live="polite">*/}
          {timeLeftRef.current.minutes}
          {/*</span>*/}
        </span>
        m
      </div>
      <div>
        <span className="countdown font-mono">
          {/*<span style={{ '--value': timeLeftRef.current.seconds } as React.CSSProperties} aria-live="polite">*/}
          {timeLeftRef.current.seconds}
          {/*</span>*/}
        </span>
        s
      </div>
    </div>
  );
};

interface CountdownTimerPropsStatic {
  expireTime: number; // 过期时间戳（秒）
  className?: string;
  timeClassName?: string;
  isEndFun?: () => void;
}

interface CountdownTimeProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const isGreaterThanOneDay = (time: CountdownTimeProps) => {
  if (time.days && time.days > 0) return true;
  if (time.hours && time.hours >= 24) return true;
  return false;
};

const isGreaterThanOneHour = (time: CountdownTimeProps) => {
  if (time.days && time.days > 0) return true;
  if (time.hours && time.hours > 0) return true;
  return false;
};

const isGreaterThanOneMinute = (time: CountdownTimeProps) => {
  if (time.days && time.days > 0) return true;
  if (time.hours && time.hours > 0) return true;
  if (time.minutes && time.minutes > 0) return true;
  return false;
};

const isGreaterThanOneSecond = (time: CountdownTimeProps) => {
  if (time.days && time.days > 0) return true;
  if (time.hours && time.hours > 0) return true;
  if (time.minutes && time.minutes > 0) return true;
  if (time.seconds && time.seconds > 0) return true;
  return false;
};

export const CountdownTimerThree = ({ expireTime, className = "", timeClassName = "", isEndFun }: CountdownTimerPropsStatic) => {
  // 使用 useRef 存储倒计时值避免重新渲染
  const timeLeftRef = useRef({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const expireTimeRef = useRef<number>(expireTime);
  const endedRef = useRef(false);
  const isEndFunRef = useRef<CountdownTimerPropsStatic["isEndFun"]>(isEndFun);

  const [timeLeft, setTimeLeft] = useState<CountdownTimeProps>(timeLeftRef.current);

  // 处理倒计时
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | undefined;

    const updateRemainingTime = () => {
      const target = expireTimeRef.current;
      if (!target) {
        const next = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        const prev = timeLeftRef.current;
        if (prev.days !== 0 || prev.hours !== 0 || prev.minutes !== 0 || prev.seconds !== 0) {
          timeLeftRef.current = next;
          setTimeLeft((current) => {
            if (current.days === next.days && current.hours === next.hours && current.minutes === next.minutes && current.seconds === next.seconds) return current;
            return next;
          });
        }
        timerId = setTimeout(updateRemainingTime, 1000);
        return;
      }

      const now = new Date().getTime() / 1000;
      const difference = target - now;

      if (difference <= 0) {
        if (!endedRef.current) {
          endedRef.current = true;
          const next = { days: 0, hours: 0, minutes: 0, seconds: 0 };
          timeLeftRef.current = next;
          setTimeLeft((current) => {
            if (current.days === next.days && current.hours === next.hours && current.minutes === next.minutes && current.seconds === next.seconds) return current;
            return next;
          });
          isEndFunRef.current?.();
        }
        return;
      }

      endedRef.current = false;

      const days = Math.floor(difference / (60 * 60 * 24));
      const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((difference % (60 * 60)) / 60);
      const seconds = Math.floor(difference % 60);

      const next = { days, hours, minutes, seconds };
      const prev = timeLeftRef.current;
      if (prev.days !== next.days || prev.hours !== next.hours || prev.minutes !== next.minutes || prev.seconds !== next.seconds) {
        timeLeftRef.current = next;
        setTimeLeft((current) => {
          if (current.days === next.days && current.hours === next.hours && current.minutes === next.minutes && current.seconds === next.seconds) return current;
          return next;
        });
      }

      timerId = setTimeout(updateRemainingTime, 1000);
    };

    timerId = setTimeout(updateRemainingTime, 0);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    expireTimeRef.current = expireTime;
  }, [expireTime]);

  useEffect(() => {
    isEndFunRef.current = isEndFun;
  }, [isEndFun]);

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {isGreaterThanOneDay(timeLeft) && (
        <div className={timeClassName}>
          <span className="countdown">
              {timeLeft.days}
          </span>
          d
        </div>
      )}
      {isGreaterThanOneHour(timeLeft) && (
        <div className={timeClassName}>
          <span className="countdown">
              {timeLeft.hours}
          </span>
          h
        </div>
      )}
      {isGreaterThanOneMinute(timeLeft) && (
        <div className={timeClassName}>
          <span className="countdown">
              {timeLeft.minutes}
          </span>
          m
        </div>
      )}
      {isGreaterThanOneSecond(timeLeft) && (
        <div className={timeClassName}>
          <span className="countdown">
              {timeLeft.seconds}
          </span>
          s
        </div>
      )}
    </div>
  );
};