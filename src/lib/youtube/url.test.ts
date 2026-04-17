import { describe, expect, it } from "vitest";
import {
  detectUrlType,
  extractChannelRef,
  extractPlaylistId,
  extractVideoId,
  normalizeYoutubeUrl,
  getYoutubeThumbnailUrl,
} from "./url";

/** Stable public test video id (Rick Roll) — 11 chars, valid YouTube id shape */
const VID = "dQw4w9WgXcQ";

describe("normalizeYoutubeUrl", () => {
  it("trims and adds https when missing", () => {
    expect(normalizeYoutubeUrl(`  www.youtube.com/watch?v=${VID}  `)).toBe(
      `https://www.youtube.com/watch?v=${VID}`,
    );
  });

  it("strips wrapping quotes", () => {
    expect(normalizeYoutubeUrl(`"https://youtu.be/${VID}"`)).toBe(
      `https://youtu.be/${VID}`,
    );
  });

  it("preserves youtu.be host (does not force www)", () => {
    const out = normalizeYoutubeUrl(`https://youtu.be/${VID}`);
    expect(out).toContain("youtu.be");
    expect(out).toContain(VID);
  });

  it("normalizes m.youtube.com to www.youtube.com", () => {
    const out = normalizeYoutubeUrl(`https://m.youtube.com/watch?v=${VID}`);
    expect(out).toMatch(/^https:\/\/www\.youtube\.com\//);
  });

  it("throws on empty input", () => {
    expect(() => normalizeYoutubeUrl("   ")).toThrow("Empty URL");
  });

  it("throws on non-YouTube host", () => {
    expect(() => normalizeYoutubeUrl("https://example.com/watch?v=" + VID)).toThrow(
      "Not a YouTube URL",
    );
  });
});

describe("detectUrlType", () => {
  it("classifies standard watch URL as VIDEO", () => {
    expect(detectUrlType(`https://www.youtube.com/watch?v=${VID}`)).toBe("VIDEO");
  });

  it("classifies watch URL with list param as PLAYLIST (combined link)", () => {
    expect(
      detectUrlType(
        `https://www.youtube.com/watch?v=${VID}&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf`,
      ),
    ).toBe("PLAYLIST");
  });

  it("classifies /playlist as PLAYLIST", () => {
    expect(
      detectUrlType("https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"),
    ).toBe("PLAYLIST");
  });

  it("classifies youtu.be as VIDEO", () => {
    expect(detectUrlType(`https://youtu.be/${VID}`)).toBe("VIDEO");
  });

  it("classifies shorts, embed, live paths as VIDEO", () => {
    expect(detectUrlType(`https://www.youtube.com/shorts/${VID}`)).toBe("VIDEO");
    expect(detectUrlType(`https://www.youtube.com/embed/${VID}`)).toBe("VIDEO");
    expect(detectUrlType(`https://www.youtube.com/live/${VID}`)).toBe("VIDEO");
  });

  it("classifies channel-style paths as CHANNEL", () => {
    expect(detectUrlType("https://www.youtube.com/@SomeChannel")).toBe("CHANNEL");
    expect(detectUrlType("https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx")).toBe(
      "CHANNEL",
    );
    expect(detectUrlType("https://www.youtube.com/c/CustomName")).toBe("CHANNEL");
    expect(detectUrlType("https://www.youtube.com/user/LegacyUser")).toBe("CHANNEL");
  });

  it("returns null for garbage", () => {
    expect(detectUrlType("not a url")).toBe(null);
    expect(detectUrlType("https://www.youtube.com/feed/trending")).toBe(null);
  });

  it("returns null when watch page has no valid v= id", () => {
    expect(detectUrlType("https://www.youtube.com/watch?v=short")).toBe(null);
  });
});

describe("extractVideoId", () => {
  it("extracts from watch, youtu.be, shorts, embed, live", () => {
    expect(extractVideoId(`https://www.youtube.com/watch?v=${VID}`)).toBe(VID);
    expect(extractVideoId(`https://youtu.be/${VID}`)).toBe(VID);
    expect(extractVideoId(`https://www.youtube.com/shorts/${VID}`)).toBe(VID);
    expect(extractVideoId(`https://www.youtube.com/embed/${VID}`)).toBe(VID);
    expect(extractVideoId(`https://www.youtube.com/live/${VID}`)).toBe(VID);
  });

  it("returns null for invalid or missing id", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=bad")).toBe(null);
    expect(extractVideoId("https://www.youtube.com/playlist?list=PLabc")).toBe(null);
  });
});

describe("extractPlaylistId", () => {
  it("reads list= from watch or playlist URLs", () => {
    const pl = "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf";
    expect(extractPlaylistId(`https://www.youtube.com/watch?v=${VID}&list=${pl}`)).toBe(
      pl,
    );
    expect(extractPlaylistId(`https://www.youtube.com/playlist?list=${pl}`)).toBe(pl);
  });

  it("returns null when no list param", () => {
    expect(extractPlaylistId(`https://www.youtube.com/watch?v=${VID}`)).toBe(null);
  });
});

describe("extractChannelRef", () => {
  it("parses UC channel id", () => {
    const r = extractChannelRef("https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw");
    expect(r).toEqual({ kind: "uc", channelId: "UCuAXFkgsw1L7xaCfnd5JJOw" });
  });

  it("parses @handle", () => {
    expect(extractChannelRef("https://www.youtube.com/@RickAstleyYT")).toEqual({
      kind: "handle",
      handle: "RickAstleyYT",
    });
  });
});

describe("getYoutubeThumbnailUrl", () => {
  it("builds mqdefault thumbnail URL", () => {
    expect(getYoutubeThumbnailUrl(VID)).toBe(
      `https://img.youtube.com/vi/${VID}/mqdefault.jpg`,
    );
  });
});
