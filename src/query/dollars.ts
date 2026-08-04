import { useAuth } from "@/contexts/AuthContext";
import { useMqttService, useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { useUpdateSettlementCurrency } from "@/contexts/SettlementCurrencyContext";
import { AUTH_QUERY_KEYS, useUserBalance } from "@/hooks/api/useAuth.ts";
import { useBaseConfig } from "@/hooks/api/usePublic.ts";
import { getBonusWallet } from "@/services/auth/bonus";
import { useBoundStore } from "@/store";
import { hasAuth } from "@/utils/auth.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

export const useUserBonusWallet = () => {
  const user = useBoundStore((state) => state.user);

  // 基础配置数据
  const { data: baseConfig } = useBaseConfig();

  // 彩金钱包的总开关是否开启
  const bonus_switch = baseConfig?.data?.bonus_switch;
  const slot_bonus_wallet = !!bonus_switch && bonus_switch.slot_bonus_wallet !== 0;

  return useQuery({
    queryKey: ["bonusWallet"],
    queryFn: () => getBonusWallet(),
    enabled: !!user && hasAuth() && slot_bonus_wallet,
    refetchOnMount: true,
  });
};

/**
 * mqtt数据和彩金钱包数据融合
 */
export const useBonusWalletMqttSync = () => {
  const bonusQuery = useUserBonusWallet();

  const queryClient = useQueryClient();

  const user = useBoundStore((state) => state.user);

  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/bonus_wallet` : null);

  const latest = parsedMessages?.[0];

  useEffect(() => {
    const parsed_data = latest?.parsed;
    if (!parsed_data) return;

    queryClient.setQueryData(["bonusWallet"], (prev: any) => {
      const prevData = prev?.data ?? {};

      const extraData = parsed_data?.extra_data;
      const normalizedIncoming = {
        ...parsed_data,
        extra_data: typeof extraData === "string" ? extraData : extraData != null ? JSON.stringify(extraData) : extraData,
      };

      return {
        ...prev,
        data: {
          ...prevData,
          ...normalizedIncoming,
        },
      };
    });
  }, [latest?.timestamp, queryClient]);

  return bonusQuery;
};

/**
 * mqtt数据和用户余额变化数据融合
 */
export const useUserBalanceMqttSync = () => {
  const balanceQuery = useUserBalance();

  const queryClient = useQueryClient();

  const user = useBoundStore((state) => state.user);

  const status = useBoundStore((state) => state.status);
  const depositBalanceSync = useBoundStore((state) => state.depositBalanceSync);

  const setStatus = useBoundStore((s) => s.setStatus);
  const stopDepositBalanceSync = useBoundStore((state) => state.stopDepositBalanceSync);
  const baselineBalanceSignatureRef = useRef<string | null>(null);
  const latestStableBalanceSignatureRef = useRef<string | null>(null);

  // 主动更新用户个人信息
  const { refetchUser } = useAuth();

  // 主动更新结算币种
  const { updateSettlementCurrency } = useUpdateSettlementCurrency();

  // 存款通知 -> 用户存款成功时
  const { parsedMessages: parsedMessagesDeposit } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/deposit` : null);
  const { clearMessages } = useMqttService();

  /**
   * {
   *     "id": 714391,
   *     "team_id": 0,
   *     "user_id": 7272320065,
   *     "currency": "PHP",
   *     "balance": "1.52870780",
   *     "cashback_base": "0E-8",
   *     "updated_at": 1766995078,
   *     "created_at": 1766995078,
   *     "withdraw_able": "0E-8",
   *     "version": 9
   * }
   */

  // 账户余额变化详情
  const { parsedMessages: parsedMessagesBalance } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/balance_detail` : null);

  const latestParsedMessagesDeposit = parsedMessagesDeposit?.[0];
  const latestParsedMessagesBalance = parsedMessagesBalance?.[0];
  const balanceSignature = useMemo(() => {
    if (!Array.isArray(balanceQuery.data)) return null;

    // 把当前余额列表压成一个稳定字符串，用来判断“余额整体是否发生变化”。
    // 这里按 currency:balance 排序后再 join，避免数组顺序变化导致误判。
    return balanceQuery.data
      .map((item: any) => `${item?.currency ?? ""}:${item?.balance ?? ""}`)
      .sort()
      .join("|");
  }, [balanceQuery.data]);

  // mqtt数据和用户余额变化数据融合
  useEffect(() => {
    const parsed_data = latestParsedMessagesBalance?.parsed;
    if (!parsed_data) return;

    queryClient.setQueryData(AUTH_QUERY_KEYS.userBalance, (prev: any) => {
      if (!Array.isArray(prev)) return prev;

      const changes = Array.isArray(parsed_data?.changes) ? parsed_data.changes : [];
      if (changes.length === 0) return prev;

      // 把本次 mqtt 推送的余额变化整理成：currency -> balance(string)
      const BALANCE_MAP = new Map<string, any>();
      for (const item of changes) {
        const currency = item?.currency;
        const balanceAfter = item?.balance_after;
        if (currency && !Number.isNaN(Number(balanceAfter))) {
          BALANCE_MAP.set(currency, String(balanceAfter));
        }
      }

      // 以 currency 为唯一 key 重新组装数组，保证不会出现重复币种
      const CURRENCY_MAP = new Map<string, any>();
      for (const item of prev) {
        const key = item?.currency;
        if (typeof key === "string" && key) CURRENCY_MAP.set(key, item);
      }

      // 用 mqtt 推送的数据覆盖余额；不存在的币种会被补齐进去
      for (const [currency, balance] of BALANCE_MAP.entries()) {
        const existing = CURRENCY_MAP.get(currency);
        if (existing) {
          CURRENCY_MAP.set(currency, { ...existing, balance });
        } else {
          CURRENCY_MAP.set(currency, { id: `${currency}_${CURRENCY_MAP.size}`, currency, balance });
        }
      }

      return Array.from(CURRENCY_MAP.values()).map((item: any, idx: number) => ({
        ...item,
        id: item?.id ?? `${item?.currency}_${idx}`,
      }));
    });
  }, [latestParsedMessagesBalance?.timestamp, queryClient]);

  // 存款通知 -> 处理完毕后立即清理，避免脏数据在重连/重渲染时重复触发
  useEffect(() => {
    const parsed_data = latestParsedMessagesDeposit?.parsed;
    if (!parsed_data) return;

    // 更新余额
    void balanceQuery.refetch();

    // 更新用户的充值优惠信息，优惠用完需要清理；只标记失效，避免全局 Header 钱包同步主动请求。
    void queryClient.invalidateQueries({ queryKey: ["getPromoByPage"] });

    // 收到明确的存款完成通知后，立即结束这次充值余额同步窗口。
    stopDepositBalanceSync();

    // 新用户首存：更新个人信息 + 切换结算币种
    if (Number(status?.deposit_times ?? 0) < 1) {
      // 乐观更新
      setStatus((prev) => (prev ? { ...prev, deposit_times: 1 } : prev));

      // 终身首存用户：只标记失效，不在全局 Header 钱包同步里主动请求 getSummary。
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.tieredFirstDepositSummary });

      void updateSettlementCurrency(parsed_data.currency);
    }

    // 用完即清，防止 EMQX retained message 或重连后重复触发
    clearMessages(user?.id ? `user/${user.id}/deposit` : undefined);
  }, [
    latestParsedMessagesDeposit?.timestamp,
    status?.deposit_times,
    refetchUser,
    updateSettlementCurrency,
    clearMessages,
    stopDepositBalanceSync,
    queryClient,
    user?.id,
  ]);

  useEffect(() => {
    if (depositBalanceSync.active) return;
    if (!balanceSignature) return;

    // 仅在未开启充值同步窗口时更新“最近一次稳定余额”。
    // 后续开启同步窗口时，会拿这个值作为本次余额变化判断的优先基线。
    latestStableBalanceSignatureRef.current = balanceSignature;
  }, [depositBalanceSync.active, balanceSignature]);

  useEffect(() => {
    if (!depositBalanceSync.active) {
      // 同步窗口关闭后清空本次基线，避免下一轮充值沿用旧快照。
      baselineBalanceSignatureRef.current = null;
      return;
    }

    if (baselineBalanceSignatureRef.current) return;

    // 同步窗口刚开启时冻结一次基线：
    // 优先使用窗口外最近一次稳定余额；如果拿不到，再退化为当前余额签名。
    baselineBalanceSignatureRef.current = latestStableBalanceSignatureRef.current ?? balanceSignature;
  }, [depositBalanceSync.active, balanceSignature]);

  useEffect(() => {
    if (!depositBalanceSync.active || !depositBalanceSync.expiresAt) return;

    const remainingMs = depositBalanceSync.expiresAt - Date.now();
    if (remainingMs <= 0) {
      // 同步窗口已过期，直接收口，避免 active 状态悬挂。
      stopDepositBalanceSync();
      return;
    }

    const timer = window.setTimeout(() => {
      // 到达最长期待时间后仍无后续进展，按超时结束本次同步窗口。
      stopDepositBalanceSync();
    }, remainingMs);

    return () => window.clearTimeout(timer);
  }, [depositBalanceSync.active, depositBalanceSync.expiresAt, stopDepositBalanceSync]);

  useEffect(() => {
    if (!depositBalanceSync.active) return;
    if (!balanceSignature || !baselineBalanceSignatureRef.current) return;
    if (balanceSignature === baselineBalanceSignatureRef.current) return;

    // 当前余额签名和开启同步窗口前的基线不同，说明余额已经发生变化，
    // 即使没有明确的 deposit 完成消息，也可以提前结束这次同步等待。
    stopDepositBalanceSync();
  }, [depositBalanceSync.active, balanceSignature, stopDepositBalanceSync]);

  return balanceQuery;
};
