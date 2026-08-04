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

export type TyMqttClient = MqttClient | null

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
  // 可选的消息管理功能
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
  connected: false
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

// 设备维度沿用已有持久化 UUID，便于排查同一设备问题；
// 标签页维度使用仅存在于当前 JS realm 的随机 ID，避免多标签共用同一个 clientId 互踢。
const mqttDeviceId = uuidv4Generate();
const mqttPerTabId = generatePerTabMqttId();

export const getMqttClientId = () => `web_client_${mqttDeviceId}_${mqttPerTabId}`;

export const mqtt_options: IClientOptions = {
  clean: true,                                    // 清理会话，不保留离线消息
  clientId: getMqttClientId(),                    // 设备维度 + 标签页维度，避免同浏览器多标签互踢
  connectTimeout: 10_000,                         // 增加连接超时到10秒
  reconnectPeriod: 3_000,                         // 重连间隔3秒
  keepalive: 60,                                  // 心跳间隔60秒
  reschedulePings: true,                          // 重新调度ping
  protocolId: "MQTT",                             // MQTT协议标识
  protocolVersion: 4                              // MQTT 3.1.1
};

export const MqttContext = createContext<MqttContextType | undefined>(undefined);

// 控制哪些 topic 的消息需要存储到 Context（用于 UI 展示/调试等）
// - denylist: 匹配则不存储
// 说明：这只影响“存储”，不会影响 subscribe / 实际消息接收。
export const MESSAGE_STORE_DENYLIST: Array<string | RegExp> = [
  // /^user\/[^/]+\/bonus_wallet$/
  /^user\/[^/]+\/lucky_spin$/,
  /^user\/[^/]+\/promo_code_result$/,
  /^user\/[^/]+\/free_spin$/,
  /^user\/[^/]+\/createFreespin$/,
];

export const MQTT_MESSAGE_STORE_MAX_PER_TOPIC = 10;

// 去重窗口大小：每个 topic 只保留最近 N 个去重 key（用于阻止短时间内重复消息，并控制内存增长）
export const RECENT_DEDUP_MAX_KEYS = 20;

// 轻量非加密哈希（FNV-1a 32-bit）：用于对 payload 生成指纹（去重用），性能好但不具备加密安全性
export const hash32 = (str: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
};

// 从 payload(JSON 字符串)中提取业务唯一 id；兼容不同数据结构，提取失败则返回 undefined
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
  return !MESSAGE_STORE_DENYLIST.some((r) => matchTopic(topic, r));
};
