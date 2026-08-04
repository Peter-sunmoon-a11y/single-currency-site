import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { PropsWithChildren, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

dayjs.extend(duration);

interface CountdownProps {
  end: number;
  start?: number;
  notStartText?: string;
  deadlineText?: string;
  interval?: number;
  showDay?: boolean;
  showSeconds?: boolean;
  showMilliseconds?: boolean;
  millisecondsDivider?: boolean;
  unit?: string[];
  extraNode?: React.ReactNode;
  onFinished?: (p: boolean) => void;
  onProgress?: (p: string) => void;
}

const init = ["0"];

const getRemainingSeconds = (end: number, start?: number) => {
  const current = dayjs();
  const diff = start && current.valueOf() < start
    ? dayjs(start).diff(current, "millisecond")
    : dayjs(end).diff(current, "millisecond");

  if (diff <= 0) return init;

  const remaining = dayjs.duration(diff);
  return [String(remaining.seconds())];
};

const Countdown = (
  {
    start,
    end,
    unit = ["d", "hr", "min", "sec"],
    interval = 1_000,
    showDay = false,
    showSeconds = true,
    showMilliseconds = false,
    millisecondsDivider = true,
    ...props
  }: CountdownProps) => {
  const timerRef = useRef<any>(null);

  const [estimatedTime, setEstimatedTime] = useState<string[]>(() => getRemainingSeconds(end, start));

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = null;
  };

  const startTimer = useCallback(() => {
    props?.onFinished?.(false);
    setEstimatedTime(getRemainingSeconds(end, start));

    timerRef.current = setInterval(function() {
      const current = dayjs().valueOf();
      const diff = start && current < start
        ? dayjs(start).diff(dayjs(), "millisecond")
        : dayjs(end).diff(dayjs(), "millisecond");

      if (diff <= 0) {
        stopTimer();
        setEstimatedTime(init);

        if (current >= end) props?.onFinished?.(true);

        return;
      }

      const duration = dayjs.duration?.(diff);
      const seconds = String(duration.seconds())

      setEstimatedTime(() => [seconds]);
    }, interval);
  }, [end, start]);

  useLayoutEffect(() => {
    if (!timerRef.current && end) {
      startTimer();
    }
    return () => {
      stopTimer();
    };
  }, [end]);

  const progress = useMemo(() => {
    const diff = dayjs(end).diff(dayjs());
    return diff > 0 ? ((Number(estimatedTime[5]) * 1000) / diff) * 100 : 0;
  }, [end, estimatedTime[5]]);

  useEffect(() => {
    const p = Number(progress) === 0 || 100 - progress <= 0 ? "0" : (100 - progress).toFixed(4);
    props?.onProgress?.(p);
  }, [props?.onProgress, progress]);

  return (
    <InnerWrap>
      <InnerItem value={estimatedTime[0]} label="s" />
    </InnerWrap>
  );
};

export default Countdown;

const InnerItem = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="text-primary">
      <span className="">{value}</span>
      <span className="">{label}</span>
    </div>
  );
};

const InnerWrap = (props: PropsWithChildren) => {
  return (
    <div>
      {props.children}
    </div>
  );
};
