// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTelegramInitData, isTelegramWebApp, openExternalUrl, requestTelegramFullscreen } from "./telegramWebApp";

describe("telegramWebApp disabled adapter", () => {
  beforeEach(() => {
    window.open = vi.fn();
  });

  it("treats Telegram as disabled", async () => {
    expect(isTelegramWebApp()).toBe(false);
    expect(getTelegramInitData()).toBe("");
    await expect(requestTelegramFullscreen()).resolves.toBe(false);
  });

  it("opens external urls with the browser fallback", () => {
    const result = openExternalUrl("https://example.com");

    expect(result).toBe(true);
    expect(window.open).toHaveBeenCalledWith("https://example.com", "_blank", "noopener,noreferrer");
  });
});
