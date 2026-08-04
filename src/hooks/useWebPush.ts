import { useAuth } from "@/contexts/AuthContext";
import authAxiosInstance from "@/lib/authAxios";
import publicAxiosInstance from "@/lib/publicAxios";
import { useBoundStore } from "@/store";
import { scheduleIdle } from "@/utils/helper";
import { useEffect } from "react";

/**
 * WebPush Subscribe utilities
 *
 * anonymous_id: a persistent device identifier stored in localStorage.
 * Used to link push subscriptions before the user logs in.
 */

const DISMISS_TS_KEY = "webpush.dismiss_ts";
const ANONYMOUS_ID_KEY = "webpush.anonymous_id";
const DISMISS_COUNT_KEY = "webpush.dismiss_count";
// Escalating cooldown after each dismiss. After MAX_DISMISS_COUNT the prompt
// stops auto-firing and must be re-triggered from a settings entry point.
const DISMISS_COOLDOWNS_MS = [
  24 * 60 * 60 * 1000, // 1st dismiss → 24h
  7 * 24 * 60 * 60 * 1000, // 2nd dismiss → 7d
];
const MAX_DISMISS_COUNT = DISMISS_COOLDOWNS_MS.length + 1;
const POST_TRIGGER_DELAY_MS = 1500;
const IDENTIFY_RETRY_BASE_DELAY_MS = 10 * 1000;
const IDENTIFY_RETRY_MAX_DELAY_MS = 5 * 60 * 1000;
const IDENTIFY_RETRY_MAX_ATTEMPTS = 5;

/** Generate a random UUID v4 */
function uuidv4(): string {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Get or create the anonymous device id */
export function getAnonymousId(): string {
  let id = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
  }
  return id;
}

/** Whether the browser supports WebPush */
export function isWebPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** How many times the user has dismissed the prompt */
export function getDismissCount(): number {
  return Number(localStorage.getItem(DISMISS_COUNT_KEY) || 0) || 0;
}

/** Whether the user has hit the auto-prompt cap and won't be prompted again */
export function isMaxDismissed(): boolean {
  return getDismissCount() >= MAX_DISMISS_COUNT;
}

/** Whether the cooldown after the most recent dismiss is still active */
export function isInDismissCooldown(): boolean {
  const ts = Number(localStorage.getItem(DISMISS_TS_KEY) || 0);
  if (!ts) return false;
  const count = getDismissCount();
  const cooldown = DISMISS_COOLDOWNS_MS[count - 1];
  if (!cooldown) return false;
  return Date.now() - ts < cooldown;
}

/** Record that the user dismissed the prompt; increments the count */
export function recordDismiss(): void {
  const next = getDismissCount() + 1;
  localStorage.setItem(DISMISS_COUNT_KEY, String(next));
  localStorage.setItem(DISMISS_TS_KEY, String(Date.now()));
}

/** Reset dismiss state (e.g. after a successful subscribe) */
export function resetDismiss(): void {
  localStorage.removeItem(DISMISS_COUNT_KEY);
  localStorage.removeItem(DISMISS_TS_KEY);
}

/**
 * Convert a base64-url-encoded VAPID public key to a Uint8Array
 * (required by PushManager.subscribe)
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Cache the brand's VAPID public key for the lifetime of the tab so we
// don't hammer /WebPush/vapidKey on every soft-prompt trigger. A "" string
// means "queried, brand is not configured for WebPush — don't prompt".
let vapidKeyPromise: Promise<string> | null = null;
let promptTimerId: ReturnType<typeof setTimeout> | null = null;
let identifiedUserId: string | null = null;
let identifyInflightUserId: string | null = null;
let identifyInflightPromise: Promise<void> | null = null;
let identifyRetryTimerId: ReturnType<typeof setTimeout> | null = null;
let identifyRetryUserId: string | null = null;
let identifyRetryAttempt = 0;

function fetchVapidKey(): Promise<string> {
  if (vapidKeyPromise) return vapidKeyPromise;
  vapidKeyPromise = publicAxiosInstance
    .get("/WebPush/vapidKey")
    .then((resp) => {
      const data = resp?.data;
      if (data?.code !== 0 || !data?.data?.vapid_public_key) return "";
      return String(data.data.vapid_public_key);
    })
    .catch((e) => {
      vapidKeyPromise = null;
      console.warn("[WebPush] vapidKey precheck failed:", e);
      // Transport errors are retryable; only cache an empty string when the
      // branch is genuinely not configured.
      return "";
    });
  return vapidKeyPromise;
}

/** Exposed for useWebPush.doSubscribe() to reuse the cached key. */
export function getCachedVapidKey(): Promise<string> {
  return fetchVapidKey();
}

function isLocallyEligible(): boolean {
  if (!isWebPushSupported()) return false;
  if (Notification.permission !== "default") return false;
  if (isMaxDismissed()) return false;
  return !isInDismissCooldown();
}

/**
 * Surface the soft-prompt modal shortly after a high-intent moment
 * (e.g. a successful bonus claim). The delay lets any in-flight
 * success toast or follow-up modal render first.
 *
 * No-op when WebPush is unsupported, permission is already granted/denied,
 * the user is in dismiss cooldown, has hit the max-dismiss cap, or the
 * brand has no VAPID public key configured (in which case the subscribe
 * flow would silently fail anyway — see /WebPush/vapidKey returning
 * code:1 "not configured" for unconfigured branches).
 */
export function tryShowNotificationPrompt(): void {
  if (!isLocallyEligible()) return;
  fetchVapidKey().then((vapidKey) => {
    if (!vapidKey) return;
    if (!isLocallyEligible()) return;
    if (promptTimerId) return;
    promptTimerId = setTimeout(() => {
      promptTimerId = null;
      if (!isLocallyEligible()) return;
      useBoundStore.getState().openModal("OPEN_NOTIFICATION_PROMPT_MODAL");
    }, POST_TRIGGER_DELAY_MS);
  });
}

// Delay before showing the soft prompt to a visitor who hasn't yet decided
// on notifications. Short enough that we catch the user before they leave
// (ops feedback 2026-05-14 t110966: 30s was too long, users left first).
const SOFT_PROMPT_DELAY_MS = 5 * 1000;

let subscribeInflight: Promise<void> | null = null;

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function getApplicationServerKeyBytes(subscription: PushSubscription): Uint8Array | null {
  const key = subscription.options?.applicationServerKey as BufferSource | null | undefined;
  if (!key) return null;

  if (key instanceof ArrayBuffer) {
    return new Uint8Array(key);
  }

  return new Uint8Array(key.buffer, key.byteOffset, key.byteLength);
}

export async function ensurePushSubscription(
  registration: ServiceWorkerRegistration,
  vapidKeyBytes: Uint8Array,
  onStaleSubscription?: (subscription: PushSubscription) => Promise<void>,
): Promise<PushSubscription> {
  let subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const existingKeyBytes = getApplicationServerKeyBytes(subscription);
    const isCurrentKey = existingKeyBytes !== null && bytesEqual(existingKeyBytes, vapidKeyBytes);

    if (!isCurrentKey) {
      if (onStaleSubscription) {
        await onStaleSubscription(subscription).catch(() => {
          /* best-effort: keep local resubscribe moving */
        });
      }
      try {
        await subscription.unsubscribe();
      } catch (e) {
        console.warn("[WebPush] unsubscribe stale subscription failed:", e);
      }
      subscription = null;
    }
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKeyBytes.buffer as ArrayBuffer,
    });
  }

  return subscription;
}

async function reportWebPushUnsubscribe(subscription: PushSubscription): Promise<void> {
  await publicAxiosInstance.post("/WebPush/unsubscribe", {
    anonymous_id: getAnonymousId(),
    endpoint: subscription.endpoint,
    language: navigator.language?.split("-")[0] || "en",
  });
}

async function doSubscribe(): Promise<void> {
  const vapidKey = await getCachedVapidKey();
  if (!vapidKey) {
    throw new Error("WebPush VAPID key is unavailable");
  }

  const vapidKeyBytes = urlBase64ToUint8Array(vapidKey);
  const registration = await navigator.serviceWorker.ready;
  const subscription = await ensurePushSubscription(registration, vapidKeyBytes, reportWebPushUnsubscribe);

  const key = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");
  if (!key || !auth) return;

  await publicAxiosInstance.post("/WebPush/subscribe", {
    anonymous_id: getAnonymousId(),
    endpoint: subscription.endpoint,
    p256dh: btoa(String.fromCharCode(...new Uint8Array(key))),
    auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
    language: navigator.language?.split("-")[0] || "en",
  });

  resetDismiss();
}

function runSubscribeFlow(): Promise<void> {
  if (subscribeInflight) return subscribeInflight;
  subscribeInflight = doSubscribe()
    .catch((e) => {
      console.warn("[WebPush] subscribe failed:", e);
      throw e;
    })
    .finally(() => {
      subscribeInflight = null;
    });
  return subscribeInflight;
}

/**
 * Trigger the notification permission prompt then subscribe. MUST be called
 * from a user gesture handler (browsers block requestPermission() outside one).
 *
 * Returns the resulting permission state so callers can branch on it (e.g.
 * to show a "blocked, go to browser settings" hint when 'denied').
 */
export async function requestWebPushSubscribe(): Promise<NotificationPermission> {
  if (!isWebPushSupported()) return "denied";
  if (Notification.permission === "granted") {
    await runSubscribeFlow();
    return "granted";
  }
  if (Notification.permission === "denied") return "denied";

  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    await runSubscribeFlow();
  }
  return permission;
}

/**
 * useWebPush — silent lifecycle hook:
 *
 * 1. If the user has already granted notification permission (returning
 *    visitor), re-subscribe silently to refresh the server-side record.
 * 2. On login, call /WebPush/identify to bind anonymous_id ↔ user_id.
 *
 * This hook never triggers the browser permission prompt. To request
 * permission, call requestWebPushSubscribe() from a user-gesture handler
 * (e.g. a "Notify Me" button inside NotificationPromptModal).
 */
export function useWebPushBootstrapEntry() {
  const { user } = useAuth();

  // #t111129: 落地页检测 SW 透传的 ?_crm_click=<task_id> 并上报 CTR（run once）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get("_crm_click");
    if (!taskId) return;

    // 清掉 _crm_click，避免刷新重复上报
    params.delete("_crm_click");
    const cleanQuery = params.toString();
    const cleanUrl = window.location.pathname + (cleanQuery ? "?" + cleanQuery : "") + window.location.hash;
    window.history.replaceState(null, "", cleanUrl);

    // 跟 subscribe 同款：publicAxiosInstance + 大写 W 路径 + getAnonymousId()
    publicAxiosInstance
      .post("/WebPush/click", {
        task_id: taskId, // 字符串透传，别 parseInt（Snowflake 19 位 > 2^53）
        anonymous_id: getAnonymousId(),
        clicked_at: Math.floor(Date.now() / 1000),
      })
      .catch(() => {
        /* best-effort 静默 */
      });
  }, []);
  useEffect(() => {
    if (!isWebPushSupported()) return;
    if (Notification.permission !== "granted") return;
    void runSubscribeFlow();
  }, []);

  // After a short delay on the site, surface the soft prompt for visitors
  // who haven't yet accepted/denied. Wait for a first user interaction so
  // the prompt is kept out of the initial paint/LCP path, and still defer
  // when the tab is hidden so we don't open the modal behind the user's back.
  useEffect(() => {
    if (!isWebPushSupported()) return;

    let timerId: ReturnType<typeof setTimeout> | null = null;
    let visibilityHandler: (() => void) | null = null;
    let started = false;

    const fire = () => {
      if (typeof document !== "undefined" && document.hidden) {
        visibilityHandler = () => {
          if (!document.hidden) {
            document.removeEventListener("visibilitychange", visibilityHandler!);
            visibilityHandler = null;
            tryShowNotificationPrompt();
          }
        };
        document.addEventListener("visibilitychange", visibilityHandler);
      } else {
        tryShowNotificationPrompt();
      }
    };

    const startTimer = () => {
      if (started) return;
      started = true;
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, startTimer);
      });
      timerId = setTimeout(fire, SOFT_PROMPT_DELAY_MS);
    };

    const interactionEvents: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "touchstart"];
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, startTimer, { passive: true, once: true });
    });

    return () => {
      if (timerId) clearTimeout(timerId);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, startTimer);
      });
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const uid = String(user.id);
    if (identifiedUserId === uid || identifyInflightUserId === uid) return;

    let cancelled = false;

    const runIdentify = async (attempt: number) => {
      try {
        identifyInflightUserId = uid;
        identifyInflightPromise = authAxiosInstance.post("/WebPush/identify", {
          anonymous_id: getAnonymousId(),
        });
        await identifyInflightPromise;
        if (!cancelled) {
          identifiedUserId = uid;
          identifyRetryAttempt = 0;
          identifyRetryUserId = null;
        }
      } catch (e) {
        console.warn("[WebPush] identify failed:", e);
        if (!cancelled) {
          identifyRetryAttempt = attempt + 1;
          identifyRetryUserId = uid;
          if (identifyRetryAttempt > IDENTIFY_RETRY_MAX_ATTEMPTS) return;
          const delay = Math.min(IDENTIFY_RETRY_BASE_DELAY_MS * 2 ** (identifyRetryAttempt - 1), IDENTIFY_RETRY_MAX_DELAY_MS);
          identifyRetryTimerId = setTimeout(() => {
            void runIdentify(identifyRetryAttempt);
          }, delay);
        }
      } finally {
        identifyInflightPromise = null;
        identifyInflightUserId = null;
      }
    };

    if (identifyRetryTimerId && identifyRetryUserId !== uid) {
      clearTimeout(identifyRetryTimerId);
      identifyRetryTimerId = null;
      identifyRetryUserId = null;
      identifyRetryAttempt = 0;
    }

    const cancelIdle = scheduleIdle(() => {
      if (cancelled) return;
      void runIdentify(0);
    });

    return () => {
      cancelled = true;
      cancelIdle();
      if (identifyRetryTimerId && identifyRetryUserId === uid) {
        clearTimeout(identifyRetryTimerId);
        identifyRetryTimerId = null;
      }
    };
  }, [user?.id]);
}
