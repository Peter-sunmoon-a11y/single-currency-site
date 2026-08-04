import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState
} from "react";

dayjs.extend(duration);

interface CountdownProps {
  end: number;
  start?: number;
  endedText?: ReactNode;
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
}

const init = ["00", "00", "00", "00", "000"];
const Countdown = (
  {
    start,
    end,
    unit = ["d", "h", "m", "s"],
    interval = 1_000,
    showDay = false,
    showSeconds = true,
    showMilliseconds = false,
    millisecondsDivider = true,
    endedText,
    notStartText,
    deadlineText,
    ...props
  }: CountdownProps) => {
  const timerRef = useRef<any>(null);

  const [timeLabel, setTimeLabel] = useState<string>("");
  const [estimatedTime, setEstimatedTime] = useState<string[]>(init);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setEstimatedTime(() => init);
    }
    timerRef.current = null;
  };

  const startTimer = useCallback(() => {
    let diff = 0;

    props?.onFinished?.(false);

    timerRef.current = setInterval(function() {
      const current = dayjs().valueOf();

      if (start && current < start) {
        diff = dayjs(start).diff(current);
        setTimeLabel("notStartText");
      } else {
        diff = dayjs(end).diff(current);
        setTimeLabel("deadlineText");
      }

      if (diff <= 0) {
        stopTimer();
        setTimeLabel("endedText");
        props?.onFinished?.(true);

        return;
      }

      const duration = dayjs.duration?.(diff);
      const days = String(Math.floor(duration.asDays())).padStart(2, "0");
      const hours = String(Math.floor(duration.asHours()) % 24).padStart(2, "0");
      const minutes = String(Math.floor(duration.asMinutes()) % 60).padStart(2, "0");
      const seconds = String(Math.floor(duration?.asSeconds()) % 60).padStart(2, "0");
      const milliseconds = String(Math.floor(duration?.asMilliseconds()) % 1000).padStart(3, "0");

      setEstimatedTime(() => [
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      ]);
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

  return (
    <InnerWrap>
      {timeLabel === "notStartText" && notStartText && (
        <label>{notStartText}</label>
      )}
      {timeLabel === "deadlineText" && deadlineText && (
        <label>{deadlineText}</label>
      )}
      {timeLabel === "endedText" && endedText && (
        <label className='text-base-content/50'>{endedText}</label>
      )}
      {timeLabel !== 'endedText' && <>
        {Number(estimatedTime[0]) > 0 && <InnerItem value={estimatedTime[0]} label={unit?.[0]}/>}
        <InnerItem value={estimatedTime[1]} label={unit?.[1]} />:
        <InnerItem value={estimatedTime[2]} label={unit?.[2]} />:
        <InnerItem value={estimatedTime[3]} label={unit?.[3]} />
      </>}
    </InnerWrap>
  );
};

export default Countdown;

const InnerItem = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="">
      <span className="">{value}</span>
      <span className="">{label}</span>
    </div>
  );
};

const InnerWrap = (props: PropsWithChildren) => {
  return (
    <div className='flex text-[12px] gap-1 text-primary'>
      {props.children}
    </div>
  );
};
