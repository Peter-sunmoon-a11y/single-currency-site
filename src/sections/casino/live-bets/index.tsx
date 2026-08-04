import { SmoothTabs } from "@/components/ui/SmoothTabs";
import { MqttSubscriptions } from "@/contexts/mqtt/MqttSubscriptions";
import type { ISubscriptionMap } from "@/contexts/mqtt/types";
import { Suspense, lazy, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { BetRowSkeleton } from "@/sections/casino/live-bets/components.tsx";

const LatestWins = lazy(() =>
  import("@/sections/casino/live-bets/LatestWins.tsx").then((m) => ({ default: m.LatestWins }))
);
const GreatestBets = lazy(() =>
  import("@/sections/casino/live-bets/GreatestBets.tsx").then((m) => ({ default: m.GreatestBets }))
);

export const LiveBets = () => {
  const { t } = useTranslation();

  const [category, setCategory] = useState<string>("latestWins");
  const [mountedTabs, setMountedTabs] = useState<Record<string, boolean>>({
    latestWins: true,
    greatestBets: false
  });

  const tabs = useMemo(
    () => [
      {
        id: "latestWins",
        label: (
          <span className="flex items-center gap-2">
            {t("casino:latestWins")}
          </span>
        )
      },
      {
        id: "greatestBets",
        label: (
          <span className="flex items-center gap-2">
            {t("casino:greatestBets")}
          </span>
        )
      }
    ],
    [t]
  );

  const suspenseFallback = useMemo(
    () => (
      <>
        {Array.from({ length: 10 }).map((_, i) => (
          <BetRowSkeleton key={`live-bets-suspense-skeleton-${i}`} />
        ))}
      </>
    ),
    []
  );

  const subscriptions = useMemo<ISubscriptionMap>(() => ({
    "public/order/latest_win": { qos: 0 },
    "public/order/greatest": { qos: 0 },
    // "public/order/latest_bet": { qos: 0 },
  }), []);

  const handleSelect = (value: string) => {
    setCategory(value);
    setMountedTabs((prev) => (prev[value] ? prev : { ...prev, [value]: true }));
  };

  return (
    <div className="flex flex-col w-full">
      <MqttSubscriptions subscriptions={subscriptions} />
      <SmoothTabs
        items={tabs}
        value={category}
        onChange={handleSelect}
        size="sm"
        className="bg-base-200"
      />

      {/* 列标题 */}
      <div
        className="grid grid-cols-[0.75fr_0.75fr_0.5fr_1fr] gap-4 px-2 py-2 text-[12px] font-bold text-base-content/60">
        <div>{t("casino:game")}</div>
        <div>{t("casino:user")}</div>
        <div className="">{t("casino:multiplier")}</div>
        <div className="text-end">{t("casino:profit")}</div>
      </div>

      {/* 内容 */}
      <div style={{ overflowAnchor: "none" }}>
        {[
          { key: "latestWins", Component: LatestWins },
          { key: "greatestBets", Component: GreatestBets }
        ].map(({ key, Component }) =>
          mountedTabs[key] ? (
            <div key={key} className={category === key ? "block" : "hidden"}>
              <Suspense fallback={suspenseFallback}>
                <Component />
              </Suspense>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};
