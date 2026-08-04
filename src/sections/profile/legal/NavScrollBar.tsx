import clsx from "clsx";
import { useRef, useState, useEffect, ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";

export type TBar =
  "aboutUs" |
  "responsibleGaming" |
  "termsOfService"

const Label = ({ name }: { name: TBar }) => {
  const { t } = useTranslation();
  return (t(`menu:${name}`));
};

const items: { value: TBar, label: ReactNode }[] = [
  {
    value: "aboutUs",
    label: <Label name="aboutUs" />
  },
  {
    value: "responsibleGaming",
    label: <Label name="responsibleGaming" />
  },
  {
    value: "termsOfService",
    label: <Label name="termsOfService" />
  }
];

export const NavScrollBar = ({ setNavIndex }: { setNavIndex: (v: TBar) => void }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [_navIndex, _setNavIndex] = useState<TBar>("aboutUs");

  /**
   * 选中则滚动
   */
  const onScroll = (offset?: { width: number; left: number }) => {
    const container = ref.current;

    if (container && offset) {
      const { width: w1 = 0, left = 0 } = offset;
      const { width: w2 } = container.getBoundingClientRect();

      const scrollLeft = left + (w1 - w2) / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth"
      });
    }

    // 处理该区域的鼠标滚动支持
    if (container) container.addEventListener("wheel", handleWheel);

    function handleWheel(this: HTMLDivElement, event: WheelEvent) {
      event.preventDefault();
      event.deltaY < 0 ? (this.scrollLeft -= 5) : (this.scrollLeft += 5);
    }
  };

  /**
   * 滚动到目标
   */
  useEffect(() => {
    const timer = setInterval(() => {
      const target = document.getElementById("LEGAL");
      if (target) {
        onScroll({ width: target.getBoundingClientRect().width, left: target.offsetLeft } as any);
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [_navIndex]);

  return (
    <div ref={ref} className="relative overflow-x-auto hide-scrollbar gap-2 flex overflow-hidden mb-4">
      {items.map((item: Record<string, any>) => (
        <button
          key={item?.value}
          className={clsx(
            "relative btn btn-md",
            item?.value === _navIndex ? "btn-primary btn-soft" : ""
          )}
          id={item?.value === _navIndex ? "LEGAL" : ""}
          onClick={(e) => {
            const el = e.currentTarget;
            onScroll({ width: el.getBoundingClientRect().width, left: el.offsetLeft });
            setNavIndex(item?.value);
            _setNavIndex(item?.value);
          }}>
          {item.label}
        </button>
      ))}
    </div>
  );
};
