import { useCallback, useEffect, useRef, useState } from "react";
import { jokerBonusService } from "./service";
import {
  firstDisplayableInstance,
  getJokerVisibleUntilMs,
  isTerminalReason,
  JOKER_STORAGE_EVENT,
  localStatusAfterApiStatus,
  readJokerState,
  removeJokerInstance,
  updateJokerInstance,
  upsertJokerPending,
  writeJokerState,
} from "./storage";
import type { JokerPendingInstance, JokerRewardPreview } from "./types";

type OverlayPhase = "idle" | "visible" | "clicked" | "box_selecting" | "opening" | "opened_reward" | "claiming" | "claimed" | "error";

interface Options {
  userId: number;
  active: boolean;
  page: string;
}

export function useJokerBonusOverlay({ userId, active, page }: Options) {
  const [activeInstance, setActiveInstance] = useState<JokerPendingInstance | null>(null);
  const [phase, setPhase] = useState<OverlayPhase>("idle");
  const [reward, setReward] = useState<JokerRewardPreview | null>(null);
  const currentFetchedRef = useRef(false);
  const reservingRef = useRef(false);
  const clickingRef = useRef(false);
  const displayConfirmingRef = useRef(new Set<number>());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxSelectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback((next: ReturnType<typeof readJokerState>, notify = true) => {
    writeJokerState(userId, next, notify);
  }, [userId]);

  const clearActive = useCallback((instanceId: number) => {
    if (boxSelectTimeoutRef.current) {
      clearTimeout(boxSelectTimeoutRef.current);
      boxSelectTimeoutRef.current = null;
    }
    const state = removeJokerInstance(readJokerState(userId), instanceId);
    persist(state);
    setActiveInstance(null);
    setPhase("idle");
    clickingRef.current = false;
  }, [persist, userId]);

  const refreshFromStorage = useCallback(() => {
    if (!active || !userId) {
      setActiveInstance(null);
      setPhase("idle");
      return;
    }
    const item = firstDisplayableInstance(readJokerState(userId));
    setActiveInstance(item);
    if (item?.status === "reserved_ready" || item?.status === "joker_visible") {
      setPhase("visible");
    }
  }, [active, userId]);

  const fetchCurrentOnce = useCallback(async (source: string) => {
    if (!active || !userId) return;
    try {
      const res = await jokerBonusService.current();
      const data = res.data;
      if (res.ok && data?.has_instance && data.instance_id) {
        const state = upsertJokerPending(readJokerState(userId), data, "current");
        persist(state);
      } else if (data?.reason && isTerminalReason(data.reason)) {
        persist(readJokerState(userId));
      }
    } catch {
      // current 是进入/恢复游戏的一次性兜底，失败不打断游戏。
    } finally {
      if (source === "entry") currentFetchedRef.current = true;
    }
  }, [active, persist, userId]);

  const reserveIfReady = useCallback(async () => {
    if (!active || !userId || reservingRef.current) return;
    const item = firstDisplayableInstance(readJokerState(userId));
    if (!item) return;
    if (["reserved_ready", "joker_visible"].includes(item.status)) {
      setActiveInstance(item);
      setPhase("visible");
      return;
    }

    reservingRef.current = true;
    persist(updateJokerInstance(readJokerState(userId), item.instance_id, { status: "reserving" }));
    try {
      const res = await jokerBonusService.reserve(item.instance_id, item.display_token, {
        page,
        source: "game_overlay",
      });
      if (!res.ok || !res.data) {
        if (isTerminalReason(res.reason)) clearActive(item.instance_id);
        return;
      }

      const now = Date.now();
      const next = updateJokerInstance(upsertJokerPending(readJokerState(userId), res.data, "current", now), item.instance_id, {
        status: localStatusAfterApiStatus(res.data.status) === "pending_stored" ? "joker_visible" : localStatusAfterApiStatus(res.data.status),
        display_token: res.data.display_token ?? "",
        reserved_at_ms: now,
      }, now);
      persist(next);
      const reserved = next.instances[String(item.instance_id)];
      setActiveInstance(reserved);
      setPhase(reserved?.status === "clicked" ? "box_selecting" : reserved?.status === "opened_reward" ? "opened_reward" : "visible");
    } catch {
      persist(updateJokerInstance(readJokerState(userId), item.instance_id, { status: "pending_stored", last_error: "reserve_failed" }));
    } finally {
      reservingRef.current = false;
    }
  }, [active, clearActive, page, persist, userId]);

  useEffect(() => {
    if (!active || !userId || currentFetchedRef.current) return;
    void fetchCurrentOnce("entry");
  }, [active, fetchCurrentOnce, userId]);

  useEffect(() => {
    if (!active || !userId) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchCurrentOnce("resume");
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [active, fetchCurrentOnce, userId]);

  useEffect(() => {
    if (!active || !userId) return;
    refreshFromStorage();
    const onChanged = () => refreshFromStorage();
    window.addEventListener(JOKER_STORAGE_EVENT, onChanged);
    window.addEventListener("storage", onChanged);
    return () => {
      window.removeEventListener(JOKER_STORAGE_EVENT, onChanged);
      window.removeEventListener("storage", onChanged);
    };
  }, [active, refreshFromStorage, userId]);

  useEffect(() => {
    if (!active || !userId) return;
    void reserveIfReady();
  }, [active, activeInstance?.instance_id, reserveIfReady, userId]);

  useEffect(() => {
    if (!active || !userId || !activeInstance || phase !== "visible") return;
    if (displayConfirmingRef.current.has(activeInstance.instance_id)) return;
    displayConfirmingRef.current.add(activeInstance.instance_id);
    const displayEventId = `joker-${activeInstance.instance_id}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    void (async () => {
      try {
        const res = await jokerBonusService.display(activeInstance.instance_id, activeInstance.display_token, displayEventId);
        if (!res.ok || !res.data) {
          if (isTerminalReason(res.reason)) clearActive(activeInstance.instance_id);
          return;
        }

        const now = Date.now();
        const state = updateJokerInstance(upsertJokerPending(readJokerState(userId), res.data, "current", now), activeInstance.instance_id, {
          status: "joker_visible",
          api_status: res.data.status,
          display_token: res.data.display_token ?? activeInstance.display_token,
          shown_at_ms: now,
        }, now);
        persist(state);
        setActiveInstance(state.instances[String(activeInstance.instance_id)] ?? null);
      } catch {
        displayConfirmingRef.current.delete(activeInstance.instance_id);
      }
    })();
  }, [active, activeInstance, clearActive, persist, phase, userId]);

  useEffect(() => {
    if (!activeInstance || phase !== "visible") return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const ms = Math.max(0, getJokerVisibleUntilMs(activeInstance) - Date.now());
    timeoutRef.current = setTimeout(() => clearActive(activeInstance.instance_id), ms);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [activeInstance, clearActive, phase]);

  useEffect(() => () => {
    if (boxSelectTimeoutRef.current) clearTimeout(boxSelectTimeoutRef.current);
  }, []);

  const clickJoker = useCallback(async () => {
    if (!activeInstance) return;
    if (clickingRef.current || boxSelectTimeoutRef.current) return;
    clickingRef.current = true;
    setPhase("clicked");
    const res = await jokerBonusService.click(activeInstance.instance_id, activeInstance.display_token);
    if (!res.ok) {
      if (isTerminalReason(res.reason)) clearActive(activeInstance.instance_id);
      else {
        clickingRef.current = false;
        setPhase("visible");
      }
      return;
    }
    const now = Date.now();
    const state = updateJokerInstance(readJokerState(userId), activeInstance.instance_id, {
      status: "clicked",
      api_status: res.data.status,
      clicked_at_ms: now,
    }, now);
    persist(state, false);
    setActiveInstance({
      ...activeInstance,
      status: "clicked",
      api_status: res.data.status,
      clicked_at_ms: now,
    });
    setPhase("clicked");
    boxSelectTimeoutRef.current = setTimeout(() => {
      boxSelectTimeoutRef.current = null;
      clickingRef.current = false;
      setPhase("box_selecting");
    }, 2000);
  }, [activeInstance, clearActive, persist, userId]);

  const openBox = useCallback(async (boxIndex: number) => {
    if (!activeInstance) return;
    setPhase("opening");
    const res = await jokerBonusService.open(activeInstance.instance_id, boxIndex, activeInstance.display_token);
    if (!res.ok) {
      if (isTerminalReason(res.reason)) clearActive(activeInstance.instance_id);
      return;
    }
    const rewardPreview = res.data.reward_preview ?? null;
    const state = updateJokerInstance(readJokerState(userId), activeInstance.instance_id, {
      status: "opened_reward",
      api_status: res.data.status,
      selected_box_index: boxIndex,
      reward: rewardPreview,
    });
    persist(state, false);
    setActiveInstance({
      ...activeInstance,
      status: "opened_reward",
      api_status: res.data.status,
      selected_box_index: boxIndex,
      reward: rewardPreview,
    });
    setReward(rewardPreview);
    setPhase("opened_reward");
  }, [activeInstance, clearActive, persist, userId]);

  const claim = useCallback(async (claimCurrency = "") => {
    if (!activeInstance) return;
    setPhase("claiming");
    const res = await jokerBonusService.claim(activeInstance.instance_id, activeInstance.display_token, claimCurrency);
    if (!res.ok) {
      if (isTerminalReason(res.reason)) clearActive(activeInstance.instance_id);
      else setPhase("opened_reward");
      return;
    }
    clearActive(activeInstance.instance_id);
    setPhase("claimed");
  }, [activeInstance, clearActive]);

  return {
    activeInstance,
    phase,
    reward,
    clickJoker,
    openBox,
    claim,
    dismissClaimed: () => setPhase("idle"),
  };
}
