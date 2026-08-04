interface FloatSlot {
  x: number;
  y: number;
  size: number;
  dur: string;
  delay: string;
}

const DEFAULT_SLOTS: FloatSlot[] = [
  { x: 120, y: 90,  size: 64, dur: "2.2s", delay: "0s"    },
  { x: 34,  y: 42,  size: 40, dur: "2.6s", delay: "0.35s" },
  { x: 196, y: 36,  size: 46, dur: "1.9s", delay: "0.7s"  },
  { x: 24,  y: 140, size: 34, dur: "2.4s", delay: "1.1s"  },
  { x: 206, y: 138, size: 38, dur: "2.0s", delay: "0.5s"  },
  { x: 108, y: 162, size: 50, dur: "2.7s", delay: "0.85s" },
  { x: 170, y: 88,  size: 30, dur: "1.8s", delay: "0.2s"  },
];

interface GuestGuideProps {
  images: string[];
  label: string;
  onAction?: () => void;
}

export const GuestGuide = ({ images, label, onAction }: GuestGuideProps) => {
  const slots = DEFAULT_SLOTS;

  return (
    <div className="flex flex-col justify-center items-center py-4 gap-8">
      {images.length > 0 && (
        <div style={{ position: "relative", width: 240, height: 180 }}>
          {images.slice(0, slots.length).map((src, i) => {
            const s = slots[i];
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: s.x,
                  top: s.y,
                  width: s.size,
                  height: s.size,
                  transform: "translate(-50%,-50%)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    animation: `crypto-float ${s.dur} ease-in-out ${s.delay} infinite`,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "color-mix(in oklch, var(--color-primary) 28%, transparent)",
                  }}
                >
                  <img src={src} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <span
        className="font-bold text-primary uppercase text-sm cursor-pointer"
        onClick={onAction}
      >
        {label}
      </span>
    </div>
  );
};
