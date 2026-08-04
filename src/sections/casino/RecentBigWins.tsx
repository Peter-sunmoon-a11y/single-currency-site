import { Marquee } from "@/components/ui/Marquee";
import { CurrencyIcon } from "@/components/ui/CurrencyIcon";
import { GameImage } from "@/components/ui/GameImage";
import { useDisplayCurrencyFormatter } from "@/contexts/DisplayCurrencyContext";
import { useBoundStore } from "@/store";
import { useGreatestGameOrder } from "@/hooks/api/usePublic";
import { useEffect, useMemo, memo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { useBannedGameCheck } from "@/hooks/useBannedGameCheck.ts";
import { RecentBigWinsSkeleton } from "@/sections/casino/RecentBigWinsSkeleton";

const INIT_RENDER_COUNT = 10;
const MAX_RENDER_COUNT = 30;

export const RecentBigWins = memo(() => {
  const { t } = useTranslation();

  const { data: greatestGameOrder, isLoading } = useGreatestGameOrder();

  const { formatWithConversion } = useDisplayCurrencyFormatter();

  const openModal = useBoundStore((state) => state.openModal);

  // 使用自定义 hook 检查游戏是否被禁止
  const isGameBanned = useBannedGameCheck(false);

  const displayOrders = useMemo(() => {
    const orders = greatestGameOrder?.data ?? [];
    return orders.filter((order: any) => !isGameBanned(order) && order?.image && order.image.trim() !== "").slice(0, MAX_RENDER_COUNT);
  }, [greatestGameOrder?.data, isGameBanned]);

  const [renderCount, setRenderCount] = useState(INIT_RENDER_COUNT);

  useEffect(() => {
    setRenderCount(INIT_RENDER_COUNT);
    if (displayOrders.length <= INIT_RENDER_COUNT) return;

    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const renderRest = () => setRenderCount(MAX_RENDER_COUNT);

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(renderRest, { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(renderRest, 800);
    }

    return () => {
      if (idleId !== undefined) win.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [displayOrders.length]);

  const visibleOrders = useMemo(() => displayOrders.slice(0, renderCount), [displayOrders, renderCount]);

  return (
    <div className="flex flex-col gap-1 w-full min-h-[124px]">
      <div className="flex items-center gap-1.5">
        <span className="text-sm leading-none">🔥</span>
        <p
          className="text-base font-bold text-primary">
          {t("casino:recentBigWins")}
        </p>
      </div>

      {isLoading ? (
        <RecentBigWinsSkeleton sample />
      ) : (
        <Marquee speed={60} pauseOnHover className="p-1">
          {visibleOrders.map((order: any) => (
            <div
              key={order.id}
              className="flex flex-col items-center gap-1 select-none"
              onClick={() => {
                openModal("OPEN_BET_SLIP_MODAL", { order });
              }}
            >
              <div className="relative w-16 cursor-pointer">
                <GameImage
                  sample
                  src={order.image}
                  alt={order.name}
                  size={60}
                  data={order}
                  imageLoading="lazy"
                  imageDecoding="async"
                  className="object-cover origin-center hover:scale-110 transition-all duration-300"
                  containerClassName="rounded-lg"
                />
              </div>
              <p
                className="text-[12px] font-bold text-base-content/60 max-w-16 truncate text-center">{order?.nickname}</p>
              <div className="flex items-center max-w-16">
                <CurrencyIcon
                  currency={order.real_currency}
                  className="w-4 h-4"
                />
                <p className="flex-1 text-[12px] font-extrabold text-primary truncate uppercase">
                  {
                    formatWithConversion(
                      order.real_win_amount,
                      order.real_currency,
                      { compact: true, showCode: false }
                    ).formatted
                  }
                </p>
              </div>
            </div>
          ))}
        </Marquee>
      )}
    </div>
  );
});
