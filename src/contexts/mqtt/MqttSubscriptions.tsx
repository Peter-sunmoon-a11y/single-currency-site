import { useEffect, useMemo, useRef, useState } from "react";
import type { ISubscriptionMap } from "@/contexts/mqtt/types";
import { useMqttService } from "@/contexts/mqtt";
import { useBoundStore } from "@/store";

type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type Props = {
  subscriptions?: ISubscriptionMap | null;
};

export const MqttSubscriptions = ({ subscriptions }: Props) => {
  const { subscribe, unsubscribe } = useMqttService();
  const prevTopicsRef = useRef<string[]>([]);

  useEffect(() => {
    const prevTopics = prevTopicsRef.current;
    const nextTopics = subscriptions ? Object.keys(subscriptions) : [];

    // 切换订阅集合时，先清旧再上新
    if (prevTopics.length > 0) {
      unsubscribe(prevTopics);
    }

    // 切换订阅集合时，先清旧再上新
    if (subscriptions && nextTopics.length > 0) {
      subscribe(subscriptions);
    }

    prevTopicsRef.current = nextTopics;

    return () => {
      if (nextTopics.length > 0) {
        unsubscribe(nextTopics);
      }
      prevTopicsRef.current = [];
    };
  }, [subscribe, subscriptions, unsubscribe]);

  return null;
};

/**
 * Demo
 * ```tsx
 * import { useMemo } from "react";
 * import type { ISubscriptionMap } from "@/contexts/mqtt/types";
 *
 * const subscriptions: ISubscriptionMap | null = useMemo(() => {
 *   if (!user?.id) return null;
 *
 *   return {
 *     [`user/${user.id}/balance_detail`]: { qos: 1 },
 *     [`user/${user.id}/bonus_wallet`]: { qos: 0 }
 *   };
 * }, [user?.id]);
 *
 * <MqttSubscriptions subscriptions={subscriptions} />
 * ```
 */

export const MqttSubscriptionsEntry = () => {
  const user = useBoundStore((state) => state.user);
  const [shouldSubscribe, setShouldSubscribe] = useState(false);

  const subscriptions: ISubscriptionMap = useMemo(() => ({
    // 用户订阅 - 条件性添加
    ...(user?.id && { [`user/${user.id}/bonus_wallet`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/sports_bonus_wallet`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/balance_detail`]: { qos: 1 } }),
    ...(user?.id && { [`user/${user.id}/notification`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/promo_code_result`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/free_spin`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/deposit`]: { qos: 1 } }),
    ...(user?.id && { [`user/${user.id}/lucky_spin`]: { qos: 0 } }), // Lucky Spin 抽奖次数发放通知
    ...(user?.id && { [`user/${user.id}/big_win_share`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/createFreespin`]: { qos: 0 } }),
    ...(user?.id && { [`user/${user.id}/bounty_winner`]: { qos: 0 } }), // Bounty 中奖个人通知 (t110585)
    ...(user?.id && { [`user/${user.id}/joker_bonus`]: { qos: 0 } }),
  }), [user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const browserWindow = window as IdleWindow;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let idleId: number | undefined;

    const activate = () => {
      if (browserWindow.requestIdleCallback) {
        idleId = browserWindow.requestIdleCallback(() => setShouldSubscribe(true), { timeout: 3_000 });
      } else {
        timeoutId = setTimeout(() => setShouldSubscribe(true), 1_500);
      }
    };

    if (document.readyState === "complete") {
      activate();
    } else {
      window.addEventListener("load", activate, { once: true });
    }

    return () => {
      window.removeEventListener("load", activate);
      if (idleId !== undefined && browserWindow.cancelIdleCallback) {
        browserWindow.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!shouldSubscribe) return null;

  return <MqttSubscriptions subscriptions={subscriptions} />;
};
