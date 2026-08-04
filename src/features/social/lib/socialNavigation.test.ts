// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isIOS, isPwa } from "@/utils/browser";
import { isTelegramWebApp, openExternalUrl } from "@/utils/telegramWebApp";
import type { SocialTarget } from "./socialTargets";
import { openSocialTarget } from "./socialNavigation";

vi.mock("@/utils/browser", () => ({
  isIOS: vi.fn(),
  isPwa: vi.fn(),
}));

vi.mock("@/utils/telegramWebApp", () => ({
  isTelegramWebApp: vi.fn(),
  openExternalUrl: vi.fn(),
}));

const mockedIsIOS = vi.mocked(isIOS);
const mockedIsPwa = vi.mocked(isPwa);
const mockedIsTelegramWebApp = vi.mocked(isTelegramWebApp);
const mockedOpenExternalUrl = vi.mocked(openExternalUrl);

describe("openSocialTarget", () => {
  const originalOpen = window.open;

  beforeEach(() => {
    mockedIsIOS.mockReturnValue(false);
    mockedIsPwa.mockReturnValue(false);
    mockedIsTelegramWebApp.mockReturnValue(false);
    mockedOpenExternalUrl.mockReturnValue(false);
    window.open = vi.fn(() => ({ closed: false } as unknown as Window));
  });

  afterEach(() => {
    window.open = originalOpen;
    vi.clearAllMocks();
  });

  it("never falls back to in-place navigation when Telegram external open fails", async () => {
    mockedIsTelegramWebApp.mockReturnValue(true);
    mockedOpenExternalUrl.mockReturnValue(false);

    const target: SocialTarget = {
      kind: "official-channel",
      platform: "instagram",
      url: "https://www.instagram.com/gameon",
    };

    const result = await openSocialTarget(target);

    expect(mockedOpenExternalUrl).toHaveBeenCalledWith(target.url);
    expect(window.open).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "failed",
      reason: "telegram-open-failed",
    });
  });

  it("uses the Telegram in-app link path for Telegram share targets inside Mini Apps", async () => {
    mockedIsTelegramWebApp.mockReturnValue(true);
    mockedOpenExternalUrl.mockReturnValue(true);

    const target: SocialTarget = {
      kind: "share-target",
      platform: "telegram",
      url: "https://t.me/share/url?url=https%3A%2F%2Fbrand.example%2Finvite%3Fcode%3DABC123&text=Join",
    };

    const result = await openSocialTarget(target);

    expect(mockedOpenExternalUrl).toHaveBeenCalledWith(target.url);
    expect(window.open).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "opened",
      mechanism: "telegram",
    });
  });

  it("opens official https links in a new tab for standalone-style browser contexts", async () => {
    const target: SocialTarget = {
      kind: "official-channel",
      platform: "youtube",
      url: "https://www.youtube.com/@gameon",
    };

    const result = await openSocialTarget(target);

    expect(window.open).toHaveBeenCalledWith(
      target.url,
      "_blank",
      "noopener,noreferrer"
    );
    expect(result).toEqual({
      status: "opened",
      mechanism: "new-tab",
    });
  });

  it("uses the top browsing context instead of _blank for iOS standalone PWAs", async () => {
    mockedIsIOS.mockReturnValue(true);
    mockedIsPwa.mockReturnValue(true);

    const target: SocialTarget = {
      kind: "official-channel",
      platform: "youtube",
      url: "https://www.youtube.com/@gameon",
    };

    const result = await openSocialTarget(target);

    expect(window.open).toHaveBeenCalledWith(target.url, "_top");
    expect(result).toEqual({
      status: "opened",
      mechanism: "top-context",
    });
  });

  it("does not treat a null window handle as failure for noopener new-tab opens", async () => {
    window.open = vi.fn(() => null);

    const target: SocialTarget = {
      kind: "official-channel",
      platform: "facebook",
      url: "https://www.facebook.com/gameon",
    };

    const result = await openSocialTarget(target);

    expect(result).toEqual({
      status: "opened",
      mechanism: "new-tab",
    });
  });

  it("uses https fallback for official-channel custom schemes instead of opening the scheme directly", async () => {
    const target: SocialTarget = {
      kind: "official-channel",
      platform: "whatsapp",
      url: "whatsapp://send?phone=123456",
      fallbackUrl: "https://api.whatsapp.com/",
    };

    const result = await openSocialTarget(target);

    expect(window.open).toHaveBeenCalledWith(
      target.fallbackUrl,
      "_blank",
      "noopener,noreferrer"
    );
    expect(result).toEqual({
      status: "opened",
      mechanism: "new-tab",
    });
  });

  it("copies copy-only targets instead of trying to navigate", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const target: SocialTarget = {
      kind: "share-target",
      platform: "instagram",
      copyText: "https://brand.example/invite?code=ABC123",
    };

    const result = await openSocialTarget(target);

    expect(writeText).toHaveBeenCalledWith(target.copyText);
    expect(window.open).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "opened",
      mechanism: "copy",
    });
  });

  it("falls back to execCommand copy when clipboard api is unavailable or denied", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const execCommand = vi.fn(() => true);

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
    });

    const target: SocialTarget = {
      kind: "share-target",
      platform: "instagram",
      copyText: "https://brand.example/invite?code=ABC123",
    };

    const result = await openSocialTarget(target);

    expect(writeText).toHaveBeenCalledWith(target.copyText);
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result).toEqual({
      status: "opened",
      mechanism: "copy",
    });
  });

  it("falls back to execCommand copy when clipboard api is missing entirely", async () => {
    const execCommand = vi.fn(() => true);

    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(document, "execCommand", {
      value: execCommand,
      configurable: true,
    });

    const target: SocialTarget = {
      kind: "share-target",
      platform: "instagram",
      copyText: "https://brand.example/invite?code=ABC123",
    };

    const result = await openSocialTarget(target);

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(result).toEqual({
      status: "opened",
      mechanism: "copy",
    });
  });
});
