import type { ApiResponse } from "@/types/auth";
import { getAggregationPayload, type AggregationPayload } from "@/hooks/api/usePublic";

// 订单类 topic 目前共用同一套 provider 白名单规则。
// 未来如果只是继续扩订单类 topic，直接往这里加即可。
const ORDER_TOPICS = new Set([
  "public/order/greatest",
  "public/order/latest_win",
  "public/order/latest_bet"
]);

// 所有 MQTT 入库过滤规则共享的上下文。
// 这里只放“预先准备好的配置/白名单”，不要放每条消息现算的数据，
// 这样 handleMessages 里的高频路径只需要读 ref + 做轻量判断。
export interface MessageStoreFilterContext {
  // null 表示“不过滤，保持旧行为”，不是“全部拦截”。
  displayProviders: ReadonlySet<string> | null;

  // 扩展示例：
  // 如果未来某类 topic 要按 game_integration 过滤，可以在这里追加上下文字段。
  // displayIntegrations?: ReadonlySet<string> | null;

  // 扩展示例：
  // 如果未来某类 topic 要按语言过滤，也可以继续往这里加预计算配置。
  // currentLanguage?: string | null;
}

const normalizeProvider = (value: unknown) => {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  return normalized || null;
};

// 订单数据在不同来源里字段名可能不完全一致。
// 这里集中做 provider 提取，避免 MQTT 入库过滤和 UI 展示过滤各写一套字段兼容逻辑。
const resolveOrderProvider = (value: any) => {
  return normalizeProvider(
    value?.game_provider
    ?? value?.provider
    ?? value?.vendor
    ?? value?.publisher
    ?? value?.brand
    ?? value?.data?.game_provider
    ?? value?.parsed?.game_provider
  );
};

const getProviderWhitelistData = (aggregationResponse?: ApiResponse<any> | AggregationPayload | null) => {
  const aggregationPayload = getAggregationPayload(aggregationResponse);
  const providerConfig = (aggregationPayload as Record<string, ApiResponse<any> | undefined> | null)
    ?.enabled_game_providers_for_display;

  return providerConfig?.data;
};

// 从 MQTT payload 中提取 provider。
// 订单类 topic 一旦启用 provider 白名单但 payload 又无法解析，
// 当前策略是“保守拦截”，避免非目标 provider 混入前端缓存。
const extractMessageProvider = (payload: string) => {
  try {
    const parsed = JSON.parse(payload);

    return resolveOrderProvider(parsed);
  } catch {
    return null;
  }
};

export const buildDisplayProviderWhitelist = (
  aggregationResponse?: ApiResponse<any> | AggregationPayload | null
) => {
  const providers = getProviderWhitelistData(aggregationResponse);

  // 空白名单按需求保持“不限制”，因此这里返回 null 而不是空 Set。
  // 后续新增其他白名单时，建议也沿用这个约定，避免调用方区分两套语义。
  if (!Array.isArray(providers) || providers.length === 0) {
    return null;
  }

  const whitelist = new Set<string>();

  for (const provider of providers) {
    const normalized = normalizeProvider(provider);
    if (normalized) whitelist.add(normalized);
  }

  return whitelist.size > 0 ? whitelist : null;
};

export const isOrderTopic = (topic: string) => ORDER_TOPICS.has(topic);

// 扩展示例：
// 某类 jackpot topic 如果未来要按 integration 白名单过滤，可以按同样方式定义 matcher。
// const JACKPOT_TOPICS = new Set([
//   "public/jackpot/latest",
//   "public/jackpot/history"
// ]);
//
// export const isJackpotTopic = (topic: string) => JACKPOT_TOPICS.has(topic);

// 单条规则函数只处理一种业务语义。
// 当前这条规则只关心“订单 topic 是否按 provider 白名单允许入库”，
// 不负责 topic 路由、也不负责 UI 展示层的数据合并。
const shouldStoreOrderTopicMessage = (
  payload: string,
  providerWhitelist: ReadonlySet<string> | null | undefined
) => {
  if (!providerWhitelist || providerWhitelist.size === 0) return true;

  const provider = extractMessageProvider(payload);
  if (!provider) return false;

  return providerWhitelist.has(provider);
};

// 扩展示例：
// 某类新 topic 如果改成按 game_integration 白名单过滤，建议新增独立规则函数，
// 不要把 provider 逻辑和 integration 逻辑揉在一起。
// const shouldStoreJackpotTopicMessage = (
//   payload: string,
//   integrationWhitelist: ReadonlySet<string> | null | undefined
// ) => {
//   if (!integrationWhitelist || integrationWhitelist.size === 0) return true;
//
//   const integration = extractMessageIntegration(payload);
//   if (!integration) return false;
//
//   return integrationWhitelist.has(integration);
// };

// 每种 topic 类型都映射到一个规则函数。
// 后续如果新增例如 jackpot / tournament / chat 等 topic 过滤，
// 建议保持“新增 matcher + 新增 rule”的方式，不要把所有逻辑堆进统一入口里。
type TopicMessageFilter = (payload: string, context: MessageStoreFilterContext) => boolean;

const ORDER_TOPIC_FILTER: TopicMessageFilter = (payload, context) => {
  return shouldStoreOrderTopicMessage(payload, context.displayProviders);
};

// topic -> filter 的分发表。
// 顺序有意义：如果未来有更具体的 topic 规则和更宽泛的规则重叠，
// 应把更具体的 matcher 放前面，避免被通用规则提前命中。
const TOPIC_MESSAGE_FILTERS: Array<[(topic: string) => boolean, TopicMessageFilter]> = [
  [isOrderTopic, ORDER_TOPIC_FILTER],
  // 扩展示例：
  // [
  //   isJackpotTopic,
  //   (payload, context) => shouldStoreJackpotTopicMessage(payload, context.displayIntegrations)
  // ]
];

export const shouldStoreTopicMessage = (
  topic: string,
  payload: string,
  context: MessageStoreFilterContext
) => {
  for (const [matchTopic, filter] of TOPIC_MESSAGE_FILTERS) {
    // 命中第一条规则后立即返回，避免同一条消息被多个规则重复处理。
    if (matchTopic(topic)) {
      return filter(payload, context);
    }
  }

  // 未显式配置规则的 topic 默认放行。
  // 这样新增 topic 时，即使还没接入过滤，也不会意外阻断现有业务。
  return true;
};

export const shouldDisplayOrderItem = (
  item: unknown,
  providerWhitelist: ReadonlySet<string> | null | undefined
) => {
  // UI 层也复用同一套 provider 判断，确保“MQTT 入库过滤”和“API 兜底展示过滤”行为一致。
  if (!providerWhitelist || providerWhitelist.size === 0) return true;

  const provider = resolveOrderProvider(item);
  if (!provider) return false;

  return providerWhitelist.has(provider);
};
