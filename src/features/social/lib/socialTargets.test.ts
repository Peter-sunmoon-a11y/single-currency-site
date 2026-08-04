// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  buildOfficialChannelTarget,
  buildShareTarget,
} from "./socialTargets";

describe("buildOfficialChannelTarget", () => {
  it("normalizes bare domains to https urls", () => {
    const target = buildOfficialChannelTarget({
      platform: "instagram",
      rawUrl: "instagram.com/gameon",
    });

    expect(target).toMatchObject({
      kind: "official-channel",
      platform: "instagram",
      url: "https://instagram.com/gameon",
    });
  });

  it("converts whatsapp send schemes into concrete web click-to-chat urls", () => {
    const target = buildOfficialChannelTarget({
      platform: "whatsapp",
      rawUrl: "whatsapp://send?phone=%2B123456&text=hello%20there",
    });

    expect(target).toEqual({
      kind: "official-channel",
      platform: "whatsapp",
      url: "https://wa.me/123456?text=hello+there",
    });
  });
});

describe("buildShareTarget", () => {
  it("builds whatsapp share as an https share target instead of a custom scheme", () => {
    const target = buildShareTarget("whatsapp", {
      canonicalUrl: "https://brand.example/invite?code=ABC123",
      text: "Join me",
    });

    expect(target.url).toContain("https://");
    expect(target.url).toContain("whatsapp");
    expect(target).not.toHaveProperty("fallbackUrl");
  });

  it("builds instagram share as copy-only data", () => {
    const target = buildShareTarget("instagram", {
      canonicalUrl: "https://brand.example/invite?code=ABC123",
      text: "Join me",
    });

    expect(target).toEqual({
      kind: "share-target",
      platform: "instagram",
      copyText: "https://brand.example/invite?code=ABC123",
    });
  });
});
