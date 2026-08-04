import type {
  JokerCurrentData,
  JokerInstancePayload,
  JokerLocalStatus,
  JokerMqttPayload,
  JokerPendingInstance,
  JokerPendingState,
  JokerRewardPreview,
} from "./types";

export const JOKER_STORAGE_VERSION = 1 as const;
export const JOKER_STORAGE_EVENT = "joker_bonus_pending_changed";
const MAX_PENDING_INSTANCES = 3;
const TERMINAL_API_STATUSES = new Set([1, 3, 4, 5, 6, 7]);

export function jokerStorageKey(userId: number | string) {
  return `joker_bonus.pending.v1.${userId}`;
}

export function notifyJokerStorageChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(JOKER_STORAGE_EVENT));
}

export function emptyJokerState(userId: number, nowMs = Date.now()): JokerPendingState {
  return {
    version: JOKER_STORAGE_VERSION,
    user_id: userId,
    updated_at_ms: nowMs,
    instances: {},
  };
}

export function parseJokerState(raw: string | null, userId: number, nowMs = Date.now()): JokerPendingState {
  if (!raw) return emptyJokerState(userId, nowMs);
  try {
    const parsed = JSON.parse(raw) as JokerPendingState;
    if (parsed.version !== JOKER_STORAGE_VERSION || parsed.user_id !== userId || typeof parsed.instances !== "object") {
      return emptyJokerState(userId, nowMs);
    }
    return pruneJokerState(parsed, nowMs);
  } catch {
    return emptyJokerState(userId, nowMs);
  }
}

export function pruneJokerState(state: JokerPendingState, nowMs = Date.now()): JokerPendingState {
  const nowSec = Math.floor(nowMs / 1000);
  const instances = Object.fromEntries(
    Object.entries(state.instances)
      .filter(([, item]) => item && item.instance_id > 0 && item.expires_at > nowSec && !TERMINAL_API_STATUSES.has(item.api_status))
      .sort((a, b) => b[1].received_at_ms - a[1].received_at_ms)
      .slice(0, MAX_PENDING_INSTANCES),
  );

  return {
    ...state,
    updated_at_ms: nowMs,
    instances,
  };
}

export function readJokerState(userId: number, nowMs = Date.now()): JokerPendingState {
  if (typeof window === "undefined") return emptyJokerState(userId, nowMs);
  const key = jokerStorageKey(userId);
  const state = parseJokerState(window.sessionStorage.getItem(key), userId, nowMs);
  window.sessionStorage.setItem(key, JSON.stringify(state));
  return state;
}

export function writeJokerState(userId: number, state: JokerPendingState, notify = true) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(jokerStorageKey(userId), JSON.stringify(pruneJokerState(state)));
  if (notify) notifyJokerStorageChanged();
}

export function clearJokerState(userId: number, notify = true) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(jokerStorageKey(userId));
  if (notify) notifyJokerStorageChanged();
}

export function upsertJokerPending(
  state: JokerPendingState,
  payload: JokerMqttPayload | JokerCurrentData | JokerInstancePayload,
  source: "mqtt" | "current",
  nowMs = Date.now(),
): JokerPendingState {
  const instancePayload = payload as JokerInstancePayload | JokerCurrentData;
  const instanceId = Number(payload.instance_id ?? 0);
  const expiresAt = Number(payload.expires_at ?? 0);
  if (!instanceId || !expiresAt) return pruneJokerState(state, nowMs);

  const apiStatus = Number((payload as JokerMqttPayload).api_status ?? payload.status ?? 2);
  if (TERMINAL_API_STATUSES.has(apiStatus)) {
    return removeJokerInstance(state, instanceId, nowMs);
  }

  const existing = state.instances[String(instanceId)];
  const next: JokerPendingInstance = {
    instance_id: instanceId,
    status: existing?.status ?? "pending_stored",
    api_status: apiStatus as JokerPendingInstance["api_status"],
    source,
    received_at_ms: existing?.received_at_ms ?? nowMs,
    created_at: Number(payload.created_at ?? existing?.created_at ?? 0),
    expires_at: expiresAt,
    display_visible_seconds: Number(payload.display_visible_seconds ?? existing?.display_visible_seconds ?? 30),
    box_count: normalizeBoxCount(Number(payload.box_count ?? existing?.box_count ?? 3)),
    display_token: String(instancePayload.display_token ?? existing?.display_token ?? ""),
    reserved_at_ms: existing?.reserved_at_ms ?? 0,
    shown_at_ms: existing?.shown_at_ms ?? 0,
    clicked_at_ms: existing?.clicked_at_ms ?? 0,
    selected_box_index: existing?.selected_box_index ?? null,
    reward: (instancePayload.reward_preview as JokerRewardPreview | undefined) ?? existing?.reward ?? null,
    last_error: null,
  };

  return pruneJokerState({
    ...state,
    updated_at_ms: nowMs,
    instances: {
      ...state.instances,
      [String(instanceId)]: next,
    },
  }, nowMs);
}

export function updateJokerInstance(
  state: JokerPendingState,
  instanceId: number,
  patch: Partial<JokerPendingInstance>,
  nowMs = Date.now(),
): JokerPendingState {
  const existing = state.instances[String(instanceId)];
  if (!existing) return pruneJokerState(state, nowMs);
  return pruneJokerState({
    ...state,
    updated_at_ms: nowMs,
    instances: {
      ...state.instances,
      [String(instanceId)]: {
        ...existing,
        ...patch,
      },
    },
  }, nowMs);
}

export function removeJokerInstance(state: JokerPendingState, instanceId: number, nowMs = Date.now()): JokerPendingState {
  const next = { ...state.instances };
  delete next[String(instanceId)];
  return {
    ...state,
    updated_at_ms: nowMs,
    instances: next,
  };
}

export function firstDisplayableInstance(state: JokerPendingState, nowMs = Date.now()): JokerPendingInstance | null {
  const nowSec = Math.floor(nowMs / 1000);
  const candidates = Object.values(state.instances)
    .filter((item) => item.expires_at > nowSec && !TERMINAL_API_STATUSES.has(item.api_status))
    .sort((a, b) => a.received_at_ms - b.received_at_ms);

  return candidates[0] ?? null;
}

export function getJokerVisibleUntilMs(item: JokerPendingInstance, nowMs = Date.now()): number {
  const shownAt = item.shown_at_ms || nowMs;
  return shownAt + item.display_visible_seconds * 1000;
}

export function isTerminalReason(reason: string | undefined) {
  return [
    "expired",
    "missed",
    "cancelled",
    "no_candidate",
    "not_owner",
    "token_mismatch",
    "switch_closed",
    "invalid_status",
    "already_reserved",
    "already_claimed",
  ].includes(reason ?? "");
}

export function localStatusAfterApiStatus(apiStatus: number): JokerLocalStatus {
  if (apiStatus === 3) return "clicked";
  if (apiStatus === 4) return "opened_reward";
  return "pending_stored";
}

function normalizeBoxCount(value: number) {
  if (!Number.isFinite(value)) return 3;
  return Math.max(1, Math.min(12, Math.floor(value)));
}
