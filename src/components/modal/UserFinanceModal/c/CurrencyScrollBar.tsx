import {
  CurrencyIconPlaceholder,
} from "@/components/modal/UserFinanceModal/c/CurrencyIconPlaceholder.tsx";
import {
  useSupportedCurrencyV2Filter
} from "@/components/modal/UserFinanceModal/helper.ts";
import { SmallLoading } from "@/components/modal/UserFinanceModal/c/Loading.tsx";
import { useBoundStore } from "@/store";
import { cn } from "@/utils/cn.ts";
import { useEffect, useRef, useState, WheelEvent } from "react";

export const CurrencyScrollBar = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [a, b] = useState<boolean>(true)

  const { depositCrypto, setDepositCrypto } = useBoundStore();

  const [l1, currencies] = useSupportedCurrencyV2Filter("CRYPTO", "DEPOSIT");

  // 代币选择滚动
  const onScroll = (offset: { width: number, left: number }) => {
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
  };

  useEffect(() => {
    const container = ref.current;

    if (!container) return;

    let interval_id: NodeJS.Timeout | null = null;
    let closed = false;
    let retryCount = 0;
    const maxRetries = 20;

    const callback = () => {
      if (closed) return;

      const target = container.querySelector<HTMLElement>("#target") ?? null;

      if (!target) return;

      // 使用 interval 轮询确保获取到有效值
      interval_id = setInterval(() => {
        const rect = target.getBoundingClientRect();
        if (rect.width > 0) {
          onScroll({ width: rect.width, left: target.offsetLeft });
          observer.disconnect();
          if (interval_id) clearInterval(interval_id);
          closed = true;
        } else if (retryCount >= maxRetries) {
          // 超过最大重试次数，停止轮询
          if (interval_id) clearInterval(interval_id);
        }
        retryCount++;
      }, 50);
    };

    const observer = new MutationObserver(() => {
      if (interval_id) clearInterval(interval_id);
      retryCount = 0;
      callback();
    });

    observer.observe(container, { childList: true, subtree: true, attributes: true });

    callback();

    return () => {
      closed = true;
      observer.disconnect();
      if (interval_id) clearInterval(interval_id);
    };
  }, [l1, depositCrypto.network?.network]);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent the default vertical scrolling
      element.scrollLeft += e.deltaY as any; // Scroll horizontally
    };

    element.addEventListener("wheel", handleWheel as any, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel as any);
    };
  }, []);

  return (
    <div ref={ref} className="pt-0.5 relative overflow-x-auto gap-2 flex overflow-y-hidden md:mx-0 hide-scrollbar">
      <SmallLoading
        className="h-8 !rounded-lg w-full"
        loading={l1}
        content={currencies.map((item: Record<string, any>) => (
          <button
            key={item?.id}
            className={cn(
              "relative btn btn-sm btn-primary btn-soft flex items-center gap-1 text-base-content/50 px-2",
              !a && item?.currency === depositCrypto.currency?.currency ? "text-base-400 bg-primary" : ""
            )}
            id={!a && item?.currency === depositCrypto.currency?.currency ? "target" : ""}
            onClick={(e) => {
              const el = e.currentTarget;
              onScroll({ width: el.getBoundingClientRect().width, left: el.offsetLeft });
              setDepositCrypto({ currency: currencies.find((o: Record<string, any>) => o.currency === item?.currency) });
              b(false);
            }}
          >
            <CurrencyIconPlaceholder currency={item?.currency} />
            <span className="text-sm">{item?.currency}</span>
          </button>
        ))}
      />
    </div>
  );
};