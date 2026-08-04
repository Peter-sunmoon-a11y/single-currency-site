import { useContext, useEffect, useMemo } from "react";
import { MqttContext } from "@/contexts/mqtt/context";
import type { IClientSubscribeOptions } from "@/contexts/mqtt/types";
import type { MqttMessage } from "@/contexts/mqtt/context";

export { MqttServiceProvider } from "@/contexts/mqtt/provider";
export * from "@/contexts/mqtt/context";

export const useMqttService = () => {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error("useMqttService must be used within a MqttProvider");
  }
  return context;
};

export const useMqttTopicMessages = <TParsed = unknown>(
  topic: string | null | undefined,
  opts?: IClientSubscribeOptions,
  parser?: (payload: string) => TParsed
) => {
  const { subscribe, unsubscribe, getMessages } = useMqttService();

  useEffect(() => {
    if (!topic) return;
    subscribe(topic, opts);
    return () => {
      unsubscribe(topic);
    };
  }, [opts, subscribe, topic, unsubscribe]);

  const messages = useMemo(() => {
    if (!topic) return [];
    return getMessages(topic);
  }, [getMessages, topic]);

  const parsedMessages = useMemo(() => {
    const effectiveParser: (payload: string) => TParsed = (parser ?? (JSON.parse as unknown as (payload: string) => TParsed));
    return messages.map((msg) => {
      try {
        return { ...msg, parsed: effectiveParser(msg.payload) };
      } catch {
        return { ...msg, parsed: undefined };
      }
    });
  }, [messages, parser]);

  return { parsedMessages };
};

// 单点订阅、多点消费
export const useMqttTopicMessagesReadonly = <TParsed = unknown>(
  topic: string | null | undefined,
  parser?: (payload: string) => TParsed
) => {
  const { getMessages } = useMqttService();

  const messages = useMemo(() => {
    if (!topic) return [];
    return getMessages(topic);
  }, [getMessages, topic]);

  const parsedMessages = useMemo(() => {
    const effectiveParser: (payload: string) => TParsed = (parser ?? (JSON.parse as unknown as (payload: string) => TParsed));
    return messages.map((msg) => {
      try {
        return { ...msg, parsed: effectiveParser(msg.payload) };
      } catch {
        return { ...msg, parsed: undefined };
      }
    });
  }, [messages, parser]);

  return { parsedMessages };
};

export const useMqttEvent = <TParsed = unknown>(
  topic: string | null | undefined,
  handler: (message: MqttMessage & { parsed: TParsed | undefined }) => void,
  parser?: (payload: string) => TParsed
) => {
  const { addTopicListener } = useMqttService();

  useEffect(() => {
    if (!topic) return;

    const effectiveParser: (payload: string) => TParsed = (parser ?? (JSON.parse as unknown as (payload: string) => TParsed));

    return addTopicListener(topic, (message) => {
      try {
        handler({ ...message, parsed: effectiveParser(message.payload) });
      } catch {
        handler({ ...message, parsed: undefined });
      }
    });
  }, [addTopicListener, handler, parser, topic]);
};

/**
 * 多个组件/业务同时订阅同一个 topic
 * 如果 A、B 两个地方都 subscribe('t')
 * 其中一个组件卸载时调用 unsubscribe('t')
 * 另一个组件还在使用这个 topic
 * 在 MQTT 协议层面通常是“客户端对 topic 的订阅状态”，不是“按组件计数”的——这时你很难做到既不影响 B 又让 A 完全“清理干净”

 推荐用法:
 顶层集中订阅（唯一订阅点）一个更靠上的组件里统一订阅
 const topic = xxx ? `xxx/xxx/xxx` : null;
 useMqttTopicMessages(topic, { qos: 1 }); // 这里只负责订阅即可

 业务组件只读消费（不订阅）
 const topic = xxx ? `xxx/xxx/xxx` : null;
 const { parsedLatest } = useMqttTopicMessagesReadonly(topic);
 */
