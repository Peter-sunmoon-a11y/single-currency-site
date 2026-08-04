import {useMqttService, useMqttTopicMessagesReadonly} from "@/contexts/mqtt";
import {useCurrencyExchangeRate} from "@/hooks/api/usePublic.ts";
import {useChoicePromo} from "@/query/promo.tsx";
import {checkDetailPromo} from "@/services/auth/promo";
import {useBoundStore} from "@/store";
import {hasAuth} from "@/utils/auth.ts";
import {scheduleIdle, trackCustomEvent} from "@/utils/helper.ts";
import Decimal from "decimal.js";
import {PropsWithChildren, useCallback, useEffect, useRef} from "react";

// 余额临界值基数
const LIMIT_OFFER_THRESHOLD_USD = 0.1;

// 从 balance_detail 的 changes 中取出当前结算币种对应的那一项。
// 这里直接按原值比较，默认依赖后端和用户态使用同一套币种编码大小写。
const getBalanceChangeTarget = (changes: Array<Record<string, any>>, currency?: string) => {
  if (!currency) return null;
  return changes.find((change) => change?.currency === currency) ?? null;
};

// 把限时优惠阈值统一换算成当前结算币种，再判断余额是否低于阈值。
const isBalanceBelowLimitOfferThreshold = (
  {
    balanceAfter,
    exchangeRate,
    limitUsd = LIMIT_OFFER_THRESHOLD_USD,
  }: {
    balanceAfter?: string | number;
    exchangeRate?: string | number;
    limitUsd?: number;
  }) => {
  const rate = Number(exchangeRate || 0);
  if (!Number.isFinite(rate) || rate <= 0) return false;

  const balance = Number(balanceAfter || 0);
  return balance < Decimal(limitUsd).div(rate).toNumber();
};

/**
 * ⚠️ 存在多次弹出的时机, 非一次性
 * @param props
 * @constructor
 */
export const PromoGuard = (props: PropsWithChildren) => {
  const isCheckingPromoRef = useRef(false);
  const lastPromoTriggerAtRef = useRef(0);

  const user = useBoundStore((state) => state.user);
  const status = useBoundStore((state) => state.status);

  const {clearMessages} = useMqttService();

  const {mutate: choicePromo} = useChoicePromo();

  const {data: exchangeRate} = useCurrencyExchangeRate();

  const {parsedMessages: parsedMessagesDeposit} = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/deposit` : null);
  const {parsedMessages: parsedMessagesBalance} = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/balance_detail` : null);

  const openModal = useBoundStore((state) => state.openModal);

  const latestParsedMessagesDeposit = parsedMessagesDeposit?.[0];
  const latestParsedMessagesBalance = parsedMessagesBalance?.[0];

  // TODO: 激活优惠活动
  const handleLimitOfferTrigger = useCallback(async () => {
    if (!user?.id || !hasAuth()) return;

    const now = Date.now();
    // 并发保护：上一次检查未结束时，不重复发起请求。
    if (isCheckingPromoRef.current) return;
    // 节流保护：多种触发源可能短时间内连续命中，5 秒内只允许触发一次检查。
    if (now - lastPromoTriggerAtRef.current < 5000) return;

    isCheckingPromoRef.current = true;
    lastPromoTriggerAtRef.current = now;

    try {
      const response = await checkDetailPromo();
      if (response.code !== 0 && response.code !== 51005) return;
      if (response?.data?.id) {
        openModal("OPEN_LIMIT_OFFER_MODAL", response.data);

        choicePromo(response?.data?.id);

        // 清理副作用数据
        clearMessages(user?.id ? `user/${user!.id}/balance_detail` : undefined);
      }
    } catch (_error) {
      console.info(_error);
    } finally {
      isCheckingPromoRef.current = false;
    }
  }, [choicePromo, clearMessages, openModal, user?.id]);

  // TODO: 监听用户下注导致的余额变化,用于触发限时优惠
  useEffect(() => {
    const parsed_data = latestParsedMessagesBalance?.parsed;

    if (!parsed_data) return;

    const changes = Array.isArray(parsed_data?.changes) ? parsed_data.changes : [];
    const changeTarget = getBalanceChangeTarget(changes, user?.currency);

    // TODO: 和后端沟通过, 关注 _bet 事件即可
    if (
      changeTarget &&
      isBalanceBelowLimitOfferThreshold({
        balanceAfter: changeTarget?.balance_after,
        exchangeRate: exchangeRate?.data?.[user?.currency ?? ""],
      }) &&
      changeTarget?.reasons?.toString()?.includes("_bet")
    ) {
      // TODO: 激活优惠活动
      void handleLimitOfferTrigger();
    }
  }, [user?.currency, exchangeRate, handleLimitOfferTrigger, latestParsedMessagesBalance]);

  // TODO: 页面回到前台时补查限时优惠，避免因 EMQX 丢消息或前端重连漏掉触发
  useEffect(() => {
    if (!user?.id || !hasAuth()) return;

    // EMQX 丢消息或前端重连期间漏掉事件时，至少在用户回前台/切回页面时补查一次。
    const runFallbackCheck = () => {
      if (document.visibilityState !== "visible") return;
      void handleLimitOfferTrigger();
    };

    window.addEventListener("focus", runFallbackCheck);
    document.addEventListener("visibilitychange", runFallbackCheck);

    return () => {
      window.removeEventListener("focus", runFallbackCheck);
      document.removeEventListener("visibilitychange", runFallbackCheck);
    };
  }, [handleLimitOfferTrigger, user?.id]);

  useEffect(() => {
    if (!user?.id || !hasAuth()) return;
    // 登录态建立后放到浏览器空闲阶段补查一次，减少首页首屏阶段的竞争。
    // 组件重新挂载时会重新执行，配合 handleLimitOfferTrigger 内部节流即可。
    return scheduleIdle(() => {
      void handleLimitOfferTrigger();
    });
  }, [handleLimitOfferTrigger, user?.id]);

  useEffect(() => {
    const parsed_data = latestParsedMessagesDeposit?.parsed;

    if (!parsed_data) return;

    // GTM 记录推送
    trackCustomEvent("deposit", "userDeposit", parsed_data);

    trackCustomEvent("deposit_times", "userDepositTimes", {
      user_id: user?.id,
      username: user?.username,
      deposit_times: status?.deposit_times,
    });
  }, [user?.id, status?.deposit_times, latestParsedMessagesDeposit?.timestamp]);

  return props.children
};
