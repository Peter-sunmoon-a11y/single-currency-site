import { uuidv4Generate } from "@/utils/helper";
import { createContext } from "react";
import type {
  IClientOptions,
  IClientPublishOptions,
  IClientSubscribeOptions,
  IClientUnsubscribeProperties,
  ISubscriptionMap,
  MqttClient,
} from "@/contexts/mqtt/types";

export type TyMqttClient = MqttClient | null;

export interface MqttMessage {
  payload: string;
  timestamp: number;
  topic: string;
}

export type MqttTopicListener = (message: MqttMessage) => void;

export interface MqttContextType {
  client: TyMqttClient;
  connected: boolean;
  publish: (topic: string, payload: string, opts?: IClientPublishOptions) => void;
  subscribe: (topic: string | string[] | ISubscriptionMap, opts?: IClientSubscribeOptions) => void;
  unsubscribe: (topic: string | string[], opts?: IClientUnsubscribeProperties) => void;
  addTopicListener: (topic: string, listener: MqttTopicListener) => () => void;
  messages: Map<string, MqttMessage[]>;
  getMessages: (topic: string) => MqttMessage[];
  clearMessages: (topic?: string) => void;
}

export interface Props {
  client: MqttContextType["client"];
  messages: Map<string, MqttMessage[]>;
  connected: MqttContextType["connected"];
}

export const initProps = {
  client: null,
  messages: new Map<string, MqttMessage[]>(),
  connected: false,
};

const generatePerTabMqttId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }

  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
};

const mqttDeviceId = uuidv4Generate();
const mqttPerTabId = generatePerTabMqttId();

export const getMqttClientId = () => `web_client_${mqttDeviceId}_${mqttPerTabId}`;

export const mqtt_options: IClientOptions = {
  clean: true,
  clientId: getMqttClientId(),
  connectTimeout: 10_000,
  reconnectPeriod: 3_000,
  keepalive: 60,
  reschedulePings: true,
  protocolId: "MQTT",
  protocolVersion: 4,
};

export const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MESSAGE_STORE_DENYLIST: Array<string | RegExp> = [
  /^user\/[^/]+\/lucky_spin$/,
  /^user\/[^/]+\/promo_code_result$/,
  /^user\/[^/]+\/free_spin$/,
  /^user\/[^/]+\/createFreespin$/,
];

export const MQTT_MESSAGE_STORE_MAX_PER_TOPIC = 10;

export const RECENT_DEDUP_MAX_KEYS = 20;

export const hash32 = (str: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
};

export const extractId = (payload: string) => {
  try {
    const parsed = JSON.parse(payload);
    return parsed?.id ?? parsed?.data?.id ?? parsed?.parsed?.id;
  } catch {
    return undefined;
  }
};

export const matchTopic = (topic: string, rule: string | RegExp) => {
  if (typeof rule === "string") return topic === rule;
  return rule.test(topic);
};

export const shouldStoreMessageForTopic = (topic: string) => {
  return !MESSAGE_STORE_DENYLIST.some((rule) => matchTopic(topic, rule));
};
