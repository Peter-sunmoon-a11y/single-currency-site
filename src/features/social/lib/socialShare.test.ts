// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { openSocialTarget } from "./socialNavigation";
import { shareTo } from "./socialShare";

vi.mock("./socialNavigation", () => ({
  openSocialTarget: vi.fn(),
}));

const mockedOpenSocialTarget = vi.mocked(openSocialTarget);

describe("shareTo", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("delegates branded share targets to the unified navigation layer", async () => {
    mockedOpenSocialTarget.mockResolvedValueOnce({
      status: "opened",
      mechanism: "new-tab",
    });

    const result = await shareTo("whatsapp", {
      url: "https://brand.example/invite?code=ABC123",
      text: "Join me",
    });

    expect(mockedOpenSocialTarget).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      handled: true,
      result: {
        status: "opened",
        mechanism: "new-tab",
      },
    });
  });

  it("marks instagram share as copied only after the copy path succeeds", async () => {
    mockedOpenSocialTarget.mockResolvedValueOnce({
      status: "opened",
      mechanism: "copy",
    });

    const result = await shareTo("instagram", {
      url: "https://brand.example/invite?code=ABC123",
      text: "Join me",
    });

    expect(result).toEqual({
      handled: true,
      copied: true,
      result: {
        status: "opened",
        mechanism: "copy",
      },
    });
  });

  it("returns handled false when no shareable url exists", async () => {
    const result = await shareTo("telegram", {
      url: "",
      text: "Join me",
    });

    expect(mockedOpenSocialTarget).not.toHaveBeenCalled();
    expect(result).toEqual({ handled: false });
  });

  it("rejects placeholder text that is not a valid shareable url", async () => {
    const result = await shareTo("telegram", {
      url: "🏃......",
      text: "Join me",
    });

    expect(mockedOpenSocialTarget).not.toHaveBeenCalled();
    expect(result).toEqual({ handled: false });
  });
});
