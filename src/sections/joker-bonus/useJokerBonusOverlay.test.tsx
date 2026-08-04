// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useJokerBonusOverlay } from "./useJokerBonusOverlay";
import { jokerStorageKey } from "./storage";
import { jokerBonusService } from "./service";
import type { JokerPendingState } from "./types";

vi.mock("./service", () => ({
  jokerBonusService: {
    current: vi.fn(),
    reserve: vi.fn(),
    display: vi.fn(),
    click: vi.fn(),
    open: vi.fn(),
    claim: vi.fn(),
  },
}));

const userId = 1670128577;
const nowSec = Math.floor(Date.now() / 1000);

function installMemoryStorage(name: "localStorage" | "sessionStorage") {
  const store = new Map<string, string>();
  Object.defineProperty(window, name, {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
  });
}

function writeVisibleInstance() {
  const state: JokerPendingState = {
    version: 1,
    user_id: userId,
    updated_at_ms: Date.now(),
    instances: {
      "123": {
        instance_id: 123,
        status: "joker_visible",
        api_status: 2,
        source: "current",
        received_at_ms: Date.now(),
        created_at: nowSec,
        expires_at: nowSec + 3600,
        display_visible_seconds: 30,
        box_count: 3,
        display_token: "display-token",
        reserved_at_ms: Date.now(),
        shown_at_ms: Date.now(),
        clicked_at_ms: 0,
        selected_box_index: null,
        reward: null,
        last_error: null,
      },
    },
  };
  window.sessionStorage.setItem(jokerStorageKey(userId), JSON.stringify(state));
}

describe("useJokerBonusOverlay click transition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installMemoryStorage("localStorage");
    installMemoryStorage("sessionStorage");
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.mocked(jokerBonusService.current).mockResolvedValue({ ok: true, data: { has_instance: false } });
    vi.mocked(jokerBonusService.reserve).mockReset();
    vi.mocked(jokerBonusService.display).mockReset();
    vi.mocked(jokerBonusService.display).mockResolvedValue({
      ok: true,
      data: { instance_id: 123, status: 2, expires_at: nowSec + 3600, display_token: "display-token" },
    });
    vi.mocked(jokerBonusService.click).mockReset();
    vi.mocked(jokerBonusService.open).mockReset();
    vi.mocked(jokerBonusService.claim).mockReset();
    writeVisibleInstance();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps clicked animation visible for about two seconds before gift boxes", async () => {
    vi.mocked(jokerBonusService.click).mockResolvedValue({
      ok: true,
      data: { instance_id: 123, status: 3, expires_at: nowSec + 3600 },
    });
    const { result } = renderHook(() => useJokerBonusOverlay({ userId, active: true, page: "test" }));

    await act(async () => undefined);
    expect(result.current.phase).toBe("visible");

    await act(async () => {
      await result.current.clickJoker();
    });

    expect(result.current.phase).toBe("clicked");
    expect(jokerBonusService.click).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(1999));
    expect(result.current.phase).toBe("clicked");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.phase).toBe("box_selecting");
  });

  it("does not send duplicate click requests while the transition is locked", async () => {
    vi.mocked(jokerBonusService.click).mockResolvedValue({
      ok: true,
      data: { instance_id: 123, status: 3, expires_at: nowSec + 3600 },
    });
    const { result } = renderHook(() => useJokerBonusOverlay({ userId, active: true, page: "test" }));

    await act(async () => undefined);
    expect(result.current.phase).toBe("visible");

    await act(async () => {
      const first = result.current.clickJoker();
      const second = result.current.clickJoker();
      await Promise.all([first, second]);
    });

    expect(jokerBonusService.click).toHaveBeenCalledTimes(1);
    expect(result.current.phase).toBe("clicked");
  });

  it("does not restore clicked or opened instances from pending storage", async () => {
    const clickedState: JokerPendingState = {
      version: 1,
      user_id: userId,
      updated_at_ms: Date.now(),
      instances: {
        "123": {
          instance_id: 123,
          status: "clicked",
          api_status: 3,
          source: "current",
          received_at_ms: Date.now(),
          created_at: nowSec,
          expires_at: nowSec + 3600,
          display_visible_seconds: 30,
          box_count: 3,
          display_token: "display-token",
          reserved_at_ms: Date.now(),
          shown_at_ms: Date.now(),
          clicked_at_ms: Date.now(),
          selected_box_index: null,
          reward: null,
          last_error: null,
        },
      },
    };
    window.sessionStorage.setItem(jokerStorageKey(userId), JSON.stringify(clickedState));

    const { result } = renderHook(() => useJokerBonusOverlay({ userId, active: true, page: "test" }));

    await act(async () => undefined);

    expect(result.current.activeInstance).toBeNull();
    expect(result.current.phase).toBe("idle");
    expect(jokerBonusService.reserve).not.toHaveBeenCalled();
  });

  it("restores the visible joker when click fails with a non-terminal reason", async () => {
    vi.mocked(jokerBonusService.click).mockResolvedValue({ ok: false, reason: "network_error", data: {} as never });
    const { result } = renderHook(() => useJokerBonusOverlay({ userId, active: true, page: "test" }));

    await act(async () => undefined);
    expect(result.current.phase).toBe("visible");

    await act(async () => {
      await result.current.clickJoker();
    });

    expect(result.current.phase).toBe("visible");
  });

  it("confirms display once when the joker is actually visible", async () => {
    const { result } = renderHook(() => useJokerBonusOverlay({ userId, active: true, page: "test" }));

    await act(async () => undefined);

    expect(result.current.phase).toBe("visible");
    expect(jokerBonusService.display).toHaveBeenCalledTimes(1);
    expect(jokerBonusService.display).toHaveBeenCalledWith(123, "display-token", expect.stringMatching(/^joker-123-/));

    await act(async () => undefined);
    expect(jokerBonusService.display).toHaveBeenCalledTimes(1);
  });
});
