import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  IClientPublishOptions,
  IClientSubscribeOptions,
  IClientUnsubscribeProperties,
  ISubscriptionMap,
} from "@/contexts/mqtt/types";
import { useAggregationConfig, useBaseConfig } from "@/hooks/api/usePublic.ts";
import {
  extractId,
  hash32,
  initProps,
  MQTT_MESSAGE_STORE_MAX_PER_TOPIC,
  MqttContext,
  type MqttMessage,
  type MqttTopicListener,
  type Props,
  RECENT_DEDUP_MAX_KEYS,
  shouldStoreMessageForTopic,
  type TyMqttClient,
} from "@/contexts/mqtt/context";
import {
  buildDisplayProviderWhitelist,
  type MessageStoreFilterContext,
  shouldStoreTopicMessage,
} from "@/contexts/mqtt/messageStoreFilters";

export const MqttServiceProvider = ({ children }: { children: ReactNode }) => {
  const clientRef = useRef<TyMqttClient>(null);
  const clientPromiseRef = useRef<Promise<TyMqttClient> | null>(null);
  const recentDedupKeysRef = useRef<Map<string, { order: string[]; set: Set<string> }>>(new Map());
  const topicListenersRef = useRef<Map<string, Set<MqttTopicListener>>>(new Map());
  const pendingSubscriptionsRef = useRef<Map<string, IClientSubscribeOptions | undefined>>(new Map());
  const messageStoreFilterContextRef = useRef<MessageStoreFilterContext>({
    displayProviders: null,
  });

  const [service, setService] = useState<Props>(initProps);
  const { data: baseConf } = useBaseConfig();
  const { data: aggregationResponse } = useAggregationConfig();

  const displayProviderWhitelist = useMemo(
    () => buildDisplayProviderWhitelist(aggregationResponse),
    [aggregationResponse]
  );

  useEffect(() => {
    messageStoreFilterContextRef.current = {
      displayProviders: displayProviderWhitelist,
    };
  }, [displayProviderWhitelist]);

  const queuePendingSubscribe = useCallback((topic: string | string[] | ISubscriptionMap, opts?: IClientSubscribeOptions) => {
    if (typeof topic === "string") {
      pendingSubscriptionsRef.current.set(topic, opts);
      return;
    }

    if (Array.isArray(topic)) {
      for (const nextTopic of topic) pendingSubscriptionsRef.current.set(nextTopic, opts);
      return;
    }

    for (const [nextTopic, nextOpts] of Object.entries(topic)) {
      if (nextOpts === false) continue;
      pendingSubscriptionsRef.current.set(nextTopic, nextOpts === true ? undefined : nextOpts);
    }
  }, []);

  const flushPendingSubscriptions = useCallback(() => {
    const mqttClient = clientRef.current;
    if (!mqttClient) return;

    const pending = pendingSubscriptionsRef.current;
    if (pending.size === 0) return;

    const topics = Array.from(pending.keys());
    const subscriptionMap: ISubscriptionMap = {};

    for (const [topic, opts] of pending.entries()) {
      subscriptionMap[topic] = ({ qos: 0, ...(opts ?? {}) } as unknown) as IClientSubscribeOptions;
    }

    pendingSubscriptionsRef.current = new Map();

    mqttClient.subscribe(subscriptionMap, (err) => {
      if (!err) {
        console.info("WSS", topics.join(" | "), "✅");
      }
    });
  }, []);

  const handleConnect = useCallback(() => {
    setService((value) => ({ ...value, connected: true }));
    flushPendingSubscriptions();
  }, [flushPendingSubscriptions]);

  const handleMessages = useCallback((topic: string, rawMessage: any) => {
    const messageText = rawMessage.toString();
    const incomingId = extractId(messageText);
    const dedupKey = incomingId != null
      ? `id:${String(incomingId)}`
      : `hash:${hash32(messageText)}:${messageText.length}`;
    const bucket = recentDedupKeysRef.current.get(topic) ?? { order: [], set: new Set<string>() };

    if (bucket.set.has(dedupKey)) return;

    bucket.set.add(dedupKey);
    bucket.order.unshift(dedupKey);

    while (bucket.order.length > RECENT_DEDUP_MAX_KEYS) {
      const removed = bucket.order.pop();
      if (removed) bucket.set.delete(removed);
    }

    recentDedupKeysRef.current.set(topic, bucket);

    const message: MqttMessage = {
      topic,
      payload: messageText,
      timestamp: Date.now(),
    };

    const listeners = topicListenersRef.current.get(topic);
    if (listeners?.size) {
      for (const listener of listeners) {
        listener(message);
      }
    }

    if (!shouldStoreMessageForTopic(topic)) return;
    if (!shouldStoreTopicMessage(topic, messageText, messageStoreFilterContextRef.current)) return;

    setService((value) => {
      const nextMessages = new Map(value.messages);
      const previousList = nextMessages.get(topic) || [];
      nextMessages.set(topic, [message, ...previousList].slice(0, MQTT_MESSAGE_STORE_MAX_PER_TOPIC));
      return { ...value, messages: nextMessages };
    });
  }, []);

  const handleDisconnect = useCallback((_err?: any) => {
    setService((value) => ({ ...value, connected: false }));
  }, []);

  const ensureMqttClient = useCallback(() => {
    if (clientRef.current) return Promise.resolve(clientRef.current);
    if (clientPromiseRef.current) return clientPromiseRef.current;

    if (!baseConf?.data?.emqx_r_host || !baseConf?.data?.emqx_r_pass || !baseConf?.data?.emqx_r_user) {
      return Promise.resolve(null);
    }

    const host = baseConf.data.emqx_r_host;
    const user = baseConf.data.emqx_r_user;
    const pass = baseConf.data.emqx_r_pass;

    clientPromiseRef.current = import(
      /* webpackChunkName: "mqtt-client", webpackMode: "lazy" */
      "./client"
    ).then(async ({ createMqttClient }) => {
      if (clientRef.current) return clientRef.current;

      const mqttClient = await createMqttClient({ host, pass, user });

      clientRef.current = mqttClient;
      setService((value) => ({ ...value, client: mqttClient }));

      mqttClient.on("error", (err) => {
        handleDisconnect(err);
      });
      mqttClient.on("close", handleDisconnect);
      mqttClient.on("connect", handleConnect);
      mqttClient.on("message", handleMessages);

      return mqttClient;
    }).catch((err) => {
      clientPromiseRef.current = null;
      handleDisconnect(err);
      return null;
    });

    return clientPromiseRef.current;
  }, [
    baseConf?.data?.emqx_r_host,
    baseConf?.data?.emqx_r_pass,
    baseConf?.data?.emqx_r_user,
    handleConnect,
    handleDisconnect,
    handleMessages,
  ]);

  useEffect(() => {
    if (pendingSubscriptionsRef.current.size > 0) {
      void ensureMqttClient();
    }
  }, [ensureMqttClient]);

  useEffect(() => {
    return () => {
      if (!clientRef.current) return;

      pendingSubscriptionsRef.current = new Map();
      clientPromiseRef.current = null;

      clientRef.current.off("error", handleDisconnect);
      clientRef.current.off("close", handleDisconnect);
      clientRef.current.off("connect", handleConnect);
      clientRef.current.off("message", handleMessages);
      clientRef.current.end();
      clientRef.current = null;

      setService(initProps);
    };
  }, [handleConnect, handleDisconnect, handleMessages]);

  const publish = useCallback((topic: string, message: string, opts?: IClientPublishOptions) => {
    const publishMessage = (mqttClient: NonNullable<TyMqttClient>) => {
      mqttClient.publish(topic, message, opts, (err) => {
        if (err) {
          console.error("Failed to publish message:", err);
        }
      });
    };

    if (clientRef.current) {
      publishMessage(clientRef.current);
      return;
    }

    void ensureMqttClient().then((mqttClient) => {
      if (mqttClient) publishMessage(mqttClient);
    });
  }, [ensureMqttClient]);

  const subscribe = useCallback((topic: string | string[] | ISubscriptionMap, opts?: IClientSubscribeOptions) => {
    if (!clientRef.current || !service.connected) {
      queuePendingSubscribe(topic, opts);
      void ensureMqttClient();
      return;
    }

    clientRef.current.subscribe(topic, opts, () => {});
  }, [ensureMqttClient, queuePendingSubscribe, service.connected]);

  const unsubscribe = useCallback((topic: string | string[], opts?: IClientUnsubscribeProperties) => {
    if (!clientRef.current || !service.connected) {
      const topics = Array.isArray(topic) ? topic : [topic];
      for (const nextTopic of topics) pendingSubscriptionsRef.current.delete(nextTopic);
      return;
    }

    clientRef.current.unsubscribe(topic, opts, () => {});
  }, [service.connected]);

  const getMessages = useCallback((topic: string): MqttMessage[] => {
    return service.messages.get(topic) || [];
  }, [service.messages]);

  const addTopicListener = useCallback((topic: string, listener: MqttTopicListener) => {
    const listeners = topicListenersRef.current.get(topic) ?? new Set<MqttTopicListener>();
    listeners.add(listener);
    topicListenersRef.current.set(topic, listeners);

    return () => {
      const current = topicListenersRef.current.get(topic);
      if (!current) return;
      current.delete(listener);
      if (current.size === 0) {
        topicListenersRef.current.delete(topic);
      }
    };
  }, []);

  const clearMessages = useCallback((topic?: string) => {
    setService((value) => {
      const nextMessages = new Map(value.messages);
      if (topic) {
        nextMessages.delete(topic);
      } else {
        nextMessages.clear();
      }
      return { ...value, messages: nextMessages };
    });
  }, []);

  return (
    <MqttContext.Provider
      value={{
        client: service.client,
        publish,
        connected: service.connected,
        subscribe,
        unsubscribe,
        addTopicListener,
        messages: service.messages,
        getMessages,
        clearMessages,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};
