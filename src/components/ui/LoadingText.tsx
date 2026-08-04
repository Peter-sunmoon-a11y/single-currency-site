import { useState, useEffect } from 'react';

interface LoadingTextProps {
  text?: string;
  textColor?: string;
  fontSize?: string;
  letterDelay?: number;
  springDuration?: number;
  letterImages?: string[];
  enableHover?: boolean;
  autoSweep?: boolean;
  sweepDuration?: number;
  sweepInterval?: number;
}

export function LoadingText({
  text = 'LOADING',
  textColor = 'text-primary',
  fontSize = 'text-6xl md:text-8xl',
  letterImages = [],
  enableHover = true,
  autoSweep = true,
  sweepDuration = 1.5,
  sweepInterval = 2,
}: LoadingTextProps) {
  const [showPulse, setShowPulse] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [sweepIndex, setSweepIndex] = useState<number>(-1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(true);
      if (autoSweep && letterImages.length > 0) {
        setSweepIndex(0);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [autoSweep, letterImages.length]);

  useEffect(() => {
    if (!autoSweep || !showPulse || letterImages.length === 0) return;
    const sweepTimer = setInterval(() => {
      setSweepIndex((prev) => {
        if (prev >= text.length - 1) return -1;
        return prev + 1;
      });
    }, (sweepDuration * 1000) / text.length);
    return () => clearInterval(sweepTimer);
  }, [autoSweep, showPulse, text.length, sweepDuration, letterImages.length]);

  useEffect(() => {
    if (sweepIndex === -1 && showPulse && autoSweep && letterImages.length > 0) {
      const pauseTimer = setTimeout(() => setSweepIndex(0), sweepInterval * 1000);
      return () => clearTimeout(pauseTimer);
    }
  }, [sweepIndex, showPulse, autoSweep, sweepInterval, letterImages.length]);

  const hasImages = letterImages.length > 0;

  const isImageVisible = (index: number) => {
    if (enableHover && hoveredIndex === index) return true;
    if (autoSweep && sweepIndex === index) return true;
    return false;
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex">
        {text.split('').map((letter, index) => {
          const showImage = isImageVisible(index);
          return (
            <span
              key={index}
              onMouseEnter={() => enableHover && hasImages && setHoveredIndex(index)}
              onMouseLeave={() => enableHover && setHoveredIndex(null)}
              className={`${fontSize} font-black tracking-tight relative overflow-hidden ${enableHover && hasImages ? 'cursor-pointer' : ''}`}
            >
              <span className={`absolute inset-0 ${textColor} transition-opacity duration-300 ${showImage ? 'opacity-0' : 'opacity-100'}`}>
                {letter}
              </span>
              {hasImages && (
                <span
                  className={`text-transparent bg-clip-text bg-cover bg-center bg-no-repeat transition-opacity duration-300 ${showImage ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {letter}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
