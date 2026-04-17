import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./oembed", () => ({
  fetchVideoOEmbed: vi.fn(),
}));

vi.mock("./data-api", () => ({
  hasYouTubeDataApiKey: vi.fn(),
  fetchPlaylistVideos: vi.fn(),
  fetchPlaylistSnippet: vi.fn(),
  resolveChannelUploadsPlaylistId: vi.fn(),
  fetchVideoSnippetById: vi.fn(),
}));

import { resolveYoutubeInput } from "./resolve";
import { fetchVideoOEmbed } from "./oembed";
import { hasYouTubeDataApiKey, fetchVideoSnippetById } from "./data-api";

const VID = "dQw4w9WgXcQ";

describe("resolveYoutubeInput (mocked network)", () => {
  beforeEach(() => {
    vi.mocked(fetchVideoOEmbed).mockReset();
    vi.mocked(hasYouTubeDataApiKey).mockReset();
    vi.mocked(fetchVideoSnippetById).mockReset();
    vi.mocked(hasYouTubeDataApiKey).mockReturnValue(false);
  });

  it("rejects invalid / non-YouTube URLs", async () => {
    const r = await resolveYoutubeInput("https://example.com/watch?v=" + VID);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Not a YouTube URL/);
  });

  it("rejects unsupported YouTube paths", async () => {
    const r = await resolveYoutubeInput("https://www.youtube.com/feed/subscriptions");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Unsupported YouTube link/);
  });

  it("resolves VIDEO via oEmbed when mocked", async () => {
    vi.mocked(fetchVideoOEmbed).mockResolvedValue({
      title: "Test title",
      channelName: "Test channel",
      thumbnailUrl: "https://i.ytimg.com/vi/default.jpg",
    });

    const r = await resolveYoutubeInput(`https://www.youtube.com/watch?v=${VID}`);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.urlType).toBe("VIDEO");
      expect(r.videos).toHaveLength(1);
      expect(r.videos[0].id).toBe(VID);
      expect(r.videos[0].title).toBe("Test title");
      expect(r.detected.channelName).toBe("Test channel");
    }
    expect(fetchVideoOEmbed).toHaveBeenCalledWith(
      `https://www.youtube.com/watch?v=${VID}`,
    );
  });

  it("falls back to Data API when oEmbed fails and a key is configured", async () => {
    vi.mocked(fetchVideoOEmbed).mockRejectedValue(
      new Error("Video not found or cannot be embedded."),
    );
    vi.mocked(hasYouTubeDataApiKey).mockReturnValue(true);
    vi.mocked(fetchVideoSnippetById).mockResolvedValue({
      title: "API title",
      channelName: "API channel",
      thumbnailUrl: "https://i.ytimg.com/vi/hq.jpg",
    });

    const r = await resolveYoutubeInput(`https://youtu.be/${VID}`);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.videos[0].title).toBe("API title");
      expect(r.videos[0].channelName).toBe("API channel");
    }
    expect(fetchVideoSnippetById).toHaveBeenCalledWith(VID);
  });

  it("returns API hint for PLAYLIST when Data API key is missing", async () => {
    const list = "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf";
    const r = await resolveYoutubeInput(
      `https://www.youtube.com/playlist?list=${list}`,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/YOUTUBE_API_KEY/);
  });

  it("returns API hint for CHANNEL when Data API key is missing", async () => {
    const r = await resolveYoutubeInput("https://www.youtube.com/@SomeCreator");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/YOUTUBE_API_KEY/);
  });
});
