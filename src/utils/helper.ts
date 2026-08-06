import { readIDBValueByKey, writeIDBValueByKey } from "@/components/firebase/IndexDB";
import { buildConfig, promotionConfig } from "@/lib/env";
import { useBoundStore } from "@/store";
import { DEVICE_STORAGE_KEY } from "@/utils/storageKeys";
import { v4 as uuidv4 } from "uuid";

let uuidIDBLoadPromise: Promise<void> | null = null;
let uuidIDBCachedValue: string | null | undefined = undefined;

const ensureUUIDIDBLoaded = () => {
  if (uuidIDBLoadPromise) return;
  uuidIDBLoadPromise = (async () => {
    try {
      const val = await readIDBValueByKey<string>(DEVICE_STORAGE_KEY.uuid);
      uuidIDBCachedValue = val ?? null;
    } catch {
      uuidIDBCachedValue = null;
    }
  })();
};

// 独立的异常上报函数
export const rumException = (name: string, error: unknown, user?: Record<string, any>) => {
  if (window.RumSDK?.default) {
    const ArmsRum = window.RumSDK.default;
    const err = error instanceof Error ? error : new Error(String(error));

    ArmsRum.sendException({
      name,
      stack: err?.stack,
      message: err?.message,
      user: {
        name: user?.username,
        tags: user?.id,
      },
      properties: {
        trace_id: uuidv4Generate(),
        user_tags: user?.id,
        event_name: name,
        request_api: (error as any)?.config?.url,
      },
    });
  }
};

// 独立的资源上报函数
export const rumResource = (params: Record<string, any>, user?: Record<string, any>) => {
  if (window.RumSDK?.default) {
    const ArmsRum = window.RumSDK.default;
    ArmsRum.sendResource({
      type: "js", // 资源类型，例如：css、javascript、xmlhttprequest、fetch、api、image、font、other。
      name: params?.name, // API请求相关
      url: params?.url, // API请求相关
      method: params?.name, // API请求相关
      success: 0, // 请求成功状态：1：成功 0：失败 -1：未知
      message: "", // 请求消息
      duration: 0, // 请求耗时
      trace_id: uuidv4Generate(), // 链路追踪ID
      status_code: 0, // 请求状态码
      /**
       * 自定义的 user: rum控制台日志记录中的可以看到user字段的自定义数据
       */
      user: {
        name: user?.nickname || user?.username,
        tags: user?.id,
      },
      properties: {
        trace_id: uuidv4Generate(), // 链路追踪ID,
        user_tags: user?.id,
        event_name: params?.event,
        request_api: params?.url, // API请求相关
      },
    });
  }
};

// 独立的自定义上报
export const rumCustomLog = (name: string, payload: any, user?: Record<string, any>) => {
  if (window.RumSDK?.default) {
    const ArmsRum = window.RumSDK.default;
    ArmsRum.sendCustom({
      name,
      type: name,
      /**
       * 自定义的 user: rum控制台日志记录中的可以看到user字段的自定义数据
       */
      user: {
        name: user?.nickname || user?.username,
        tags: user?.id,
      },
      properties: {
        trace_id: uuidv4Generate(), // 链路追踪ID,
        user_tags: user?.id,
        event_name: name,
        request_api: payload?.url, // API请求相关
      },
    });
  }
};

export const useRumSdkUserLog = () => {
  const user = useBoundStore((state) => state.user);

  const rumSetConfig = () => {
    if (window.RumSDK?.default) {
      const versionRaw = String(buildConfig.version ?? "");
      const versionMs = versionRaw ? Number(versionRaw) : null;
      const ArmsRum = window.RumSDK.default;
      const config = ArmsRum.getConfig();
      ArmsRum.setConfig({
        ...config,
        env: location.origin,
        uid: String(user?.id),
        version: versionMs,
      });
    }
  };

  const handleRumCustomLog = (name: string, payload: any) => {
    rumCustomLog(name, payload, user || undefined);
  };

  const handleRumException = (name: string, error: unknown) => {
    rumException(name, error, user || undefined);
  };

  const handleRumResource = (params: Record<string, any>) => {
    rumResource(params, user || undefined);
  };

  return {
    rumResource: handleRumResource,
    rumCustomLog: handleRumCustomLog,
    rumException: handleRumException,
    rumSetConfig,
  };
};

/**
 * 区域禁止 结算币禁止
 * @param regions
 * @param country_code
 */
export const fn_regions = (regions: string, country_code: string) => {
  return regions != "" && regions != "ALL" && country_code && !regions.toLowerCase()?.includes(country_code?.toLowerCase());
};

/**
 * 区域禁止 结算币禁止
 * @param ban_regions
 * @param country_code
 */
export const fn_ban_regions = (ban_regions: string, country_code: string) => {
  return ban_regions != "" && country_code && ban_regions.toLowerCase()?.includes(country_code?.toLowerCase());
};

/**
 * 区域禁止 结算币禁止
 * @param support_settlement_currencies
 * @param currency
 */
export const fn_support_settlement_currencies = (support_settlement_currencies: string, currency: string) => {
  const currency_lower = currency?.toLowerCase();
  const final_currency_lower = currency_lower === "usdt" ? "usd" : currency_lower;
  return (
    final_currency_lower &&
    support_settlement_currencies != "" &&
    support_settlement_currencies != "ALL" &&
    !support_settlement_currencies.toLowerCase()?.includes(final_currency_lower)
  );
};

/**
 * 区域禁止 结算币禁止
 * @param ban_support_settlement_currencies
 * @param currency
 */
export const fn_ban_support_settlement_currencies = (ban_support_settlement_currencies: string, currency: string) => {
  const currency_lower = currency?.toLowerCase();
  const final_currency_lower = currency_lower === "usdt" ? "usd" : currency_lower;
  return (
    final_currency_lower &&
    ban_support_settlement_currencies != "" &&
    ban_support_settlement_currencies.toLowerCase()?.includes(final_currency_lower)
  );
};

// FIXME: PWA 应用更新消息，需要用户确认是否更新
export function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel("pwa-update");
}

/**
 * TODO: 生成设备标识，即使一个浏览器登录了多个用户也认为是同一个人，放弃 fingerprint
 */
export const uuidv4Generate = () => {
  const isLocalStorageAvailable = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  const generateUUID = () => {
    try {
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    } catch {
      // ignore
    }

    try {
      return uuidv4();
    } catch {
      return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
    }
  };

  const safeGetLocalUUID = () => {
    try {
      if (isLocalStorageAvailable()) return window.localStorage.getItem(DEVICE_STORAGE_KEY.uuid);
    } catch {
      // ignore
    }

    return null;
  };

  const safeSetLocalUuid = (uuid: string) => {
    try {
      if (isLocalStorageAvailable()) window.localStorage.setItem(DEVICE_STORAGE_KEY.uuid, uuid);
    } catch {
      // ignore
    }
  };

  const local_uuid_value = safeGetLocalUUID();

  if (local_uuid_value) return local_uuid_value;

  if (uuidIDBCachedValue === undefined) ensureUUIDIDBLoaded();
  if (uuidIDBCachedValue) return uuidIDBCachedValue;

  const uuid = generateUUID();

  uuidIDBCachedValue = uuid;

  safeSetLocalUuid(uuid);

  void writeIDBValueByKey(DEVICE_STORAGE_KEY.uuid, uuid);

  return uuid;
};

/**
 * 检查 value 是否为空。
 * 支持 null, undefined, boolean, number, string, array, object, Map, Set。
 * @param {*} value 要检查的值。
 * @returns {boolean} 如果 value 为空，返回 true，否则返回 false。
 */
export function isEmpty(value: any) {
  // 1. 处理 null 和 undefined
  if (value == null) {
    // 使用 == 可以同时检查 null 和 undefined
    return true;
  }

  // 2. 处理具有 length 属性的类数组对象和字符串
  // 包括：arguments, array, string。注意：function 没有 length
  if (typeof value === "object" || typeof value === "string") {
    if (Array.isArray(value) || typeof value === "string" || (typeof value === "object" && value.hasOwnProperty("length"))) {
      return value.length === 0;
    }
  }

  // 3. 处理 Map 和 Set (现代JS类型)
  // 检查是否存在 size 属性，这是 Map 和 Set 的特征
  if ((typeof Map !== "undefined" && value instanceof Map) || (typeof Set !== "undefined" && value instanceof Set)) {
    return value.size === 0;
  }

  // 4. 处理普通对象 (POJO)
  // 对象通过检查其可枚举的自身属性数量来判断
  if (typeof value === "object") {
    // Object.keys() 返回一个包含所有给定对象自身可枚举字符串键属性的数组
    // 如果数组长度为 0，则视为空对象
    return Object.keys(value).length === 0;
  }

  // 5. 处理布尔值和数字（Lodash 认为它们总是“空”的，因为它们不是集合或对象）
  // 这是一个与原生JS直觉不同的地方，但符合 Lodash 的设计
  if (typeof value === "boolean" || typeof value === "number" || typeof value === "symbol") {
    return true;
  }

  // 默认情况下返回 false（例如对于 Function 等其他类型）
  return false;
}

/*
 * 设置图片的压缩参数
 *
 * w: 图宽
 * q: 质量
 * dpr: 分辨率
 *
 * @param url
 */
export function getImgCompressParams(
  url: string,
  w: string | number = 140,
  q = 0,
  h?: number,
  network: "4g" | "3g" | "slow-2g" | "2g" = "4g",
  dpr: number | "auto" = 1,
) {
  const resolvedDpr = dpr === "auto" ? getImageDpr(network) : dpr;
  const scaleQ = (base: number) => base;
  const crop = h ? `&h=${h}&fit=crop&crop=center` : "";
  let params = "";
  switch (network) {
    case "2g":
    case "slow-2g":
      params = "w=100&auto=compress&fm=webp&q=1";
      break;
    case "3g":
      params = `w=${w}&auto=compress&fm=webp&q=${q || 15}${crop}`;
      break;
    case "4g":
      params = `w=${w}&dpr=${resolvedDpr}&auto=compress&fm=webp&q=${scaleQ(q || 30)}${crop}`;
      break;
    default:
      params = `w=${w}&dpr=${resolvedDpr}&auto=compress&fm=webp&q=${scaleQ(q || 40)}${crop}`;
      break;
  }

  const _url = url?.replace(/(1stgame\.imgix\.net|images?\.1st\.game|image\.betfrom\.com)/g, "cdn-a.imgix.net");
  return hasAnySearchParams(_url) ? `${_url}&${params}` : `${_url}?${params}`;
}

function getImageDpr(network: "4g" | "3g" | "slow-2g" | "2g") {
  if (typeof window === "undefined") return 1;

  const rawDpr = Number(window.devicePixelRatio) || 1;
  const maxDpr = network === "4g" ? 2 : 1.5;

  return Math.max(1, Math.min(Number(rawDpr.toFixed(2)), maxDpr));
}

export function getNetworkType(): "4g" | "3g" | "slow-2g" | "2g" {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    return (navigator as any)?.connection?.effectiveType ?? "4g";
  }
  return "4g";
}

function hasAnySearchParams(url: string | undefined) {
  if (!url) return false;

  try {
    const parse_url = new URL(url);
    return parse_url.search.length > 0;
  } catch (_e) {
    return false;
  }
}

/*
 * 旧浏览器不支持 requestIdleCallback 时的 fallback
 * setTimeout(cb, 0) 将任务放入事件队列，尽快执行但不阻塞当前渲染
 * 实际效果
 * 现代浏览器：在主线程空闲时执行（通常是渲染完成后）
 * 旧浏览器：放入下一个事件循环，不阻塞当前渲染
 * 超时保护：确保任务不会无限期延迟
 * @param cb
 */
export const scheduleIdle = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const w = window as any;
  if (typeof w.requestIdleCallback === "function") {
    const idleId = w.requestIdleCallback(cb, { timeout: 1500 });
    return () => {
      if (typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleId);
      }
    };
  }
  const timeoutId = window.setTimeout(cb, 0);
  return () => window.clearTimeout(timeoutId);
};

export const isROIBEST = () => {
  const model = promotionConfig.model;
  const appid = promotionConfig.folder;
  return appid && model === "roibest";
};

export const getPathInROIBEST = () => {
  const appid = promotionConfig.folder;
  return isROIBEST() ? `/${appid}` : "";
};

// GTM 记录推送
// type: 事件类型, 用户监听方的事件匹配
export const trackCustomEvent = (type: string, eventName: string, data: any) => {
  const nativeEvent = new CustomEvent(`app_track_${type}`, {
    detail: { eventName, data },
  });
  window?.dispatchEvent?.(nativeEvent);
};

export const pickImageWithEnv = (envName: string, defaultImg: string) => process.env[envName] || defaultImg;
