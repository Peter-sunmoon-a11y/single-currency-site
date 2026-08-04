import { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { useBoundStore } from "@/store";
import { useMqttService, useMqttTopicMessagesReadonly } from "@/contexts/mqtt";

/**
 * BigWinGuard
 *
 * 职责：监听大赢 MQTT 消息，在合适时机控制分享弹窗的显示。
 *
 * 规则：
 * - 游戏进行中（isPlaying=true）→ 关闭弹窗 + 清除旧数据，避免脏数据
 * - 游戏结束（isPlaying=false）且有大赢数据 → 打开弹窗
 */

interface BigWinGuardProps extends PropsWithChildren {
  isPlaying: boolean;
}

export const BigWinGuard = ({ isPlaying, children }: BigWinGuardProps) => {
  const user = useBoundStore((state) => state.user);

  const bigWinTopic = user?.id ? `user/${user.id}/big_win_share` : undefined;

  const { clearMessages } = useMqttService();

  const { parsedMessages } = useMqttTopicMessagesReadonly(bigWinTopic ?? null);

  const openModal = useBoundStore((state) => state.openModal);
  const closeModal = useBoundStore((state) => state.closeModal);
  const wasPlayingRef = useRef(isPlaying);

  // 取倍率最高的一条大赢记录
  const latest = useMemo(() => {
    if (!parsedMessages?.length) return null;
    return parsedMessages.reduce((max: any, msg: any) => {
      if (!max) return msg.parsed;
      return (msg.parsed?.multiplier ?? 0) > (max.multiplier ?? 0) ? msg.parsed : max;
    }, null);
  }, [parsedMessages]);

  // 仅在进入游戏时清掉旧消息，避免游戏内新到的大赢消息被立刻清空。
  useEffect(() => {
    if (isPlaying && !wasPlayingRef.current) {
      closeModal("OPEN_REFERRAL_SHARE_BIG_WIN_MODAL");
      clearMessages(bigWinTopic);
    }

    wasPlayingRef.current = isPlaying;
  }, [bigWinTopic, clearMessages, closeModal, isPlaying]);

  // 游戏结束后再根据缓存的大赢消息触发分享弹窗。
  useEffect(() => {
    if (!isPlaying && latest) {
      openModal("OPEN_REFERRAL_SHARE_BIG_WIN_MODAL");
    }
  }, [isPlaying, latest, openModal]);

  return <>{children}</>;
};
