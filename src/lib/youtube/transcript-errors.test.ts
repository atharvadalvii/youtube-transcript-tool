import { describe, expect, it } from "vitest";
import {
  classifyTranscriptError,
  failureHeadline,
  failureQueueLabel,
} from "./transcript-errors";

describe("classifyTranscriptError", () => {
  it("maps rate limit / captcha messages", () => {
    const a = classifyTranscriptError(
      "[YoutubeTranscript] 🚨 YouTube is receiving too many requests from this IP and now requires solving a captcha to continue",
    );
    expect(a.reason).toBe("rate_limited");
    expect(a.userMessage).toMatch(/limited transcript requests/i);
  });

  it("maps video unavailable", () => {
    const a = classifyTranscriptError(
      "[YoutubeTranscript] 🚨 The video is no longer available (PRIVATE)",
    );
    expect(a.reason).toBe("video_unavailable");
    expect(a.userMessage).toMatch(/isn’t available/i);
  });

  it("maps transcript disabled", () => {
    const a = classifyTranscriptError(
      "[YoutubeTranscript] 🚨 Transcript is disabled on this video (abc)",
    );
    expect(a.reason).toBe("no_captions");
    expect(a.userMessage).toMatch(/doesn’t expose captions/i);
  });

  it("maps no transcripts for video (not language-specific)", () => {
    const a = classifyTranscriptError(
      "[YoutubeTranscript] 🚨 No transcripts are available for this video (xyz)",
    );
    expect(a.reason).toBe("no_captions");
  });

  it("maps language-specific unavailability before generic phrasing", () => {
    const a = classifyTranscriptError(
      "[YoutubeTranscript] 🚨 No transcripts are available in en this video (id). Available languages: es, fr",
    );
    expect(a.reason).toBe("language_unavailable");
    expect(a.userMessage).toMatch(/language you selected/i);
  });

  it("maps internal could not load captions fallback", () => {
    const a = classifyTranscriptError("Could not load captions for this video.");
    expect(a.reason).toBe("no_captions");
  });

  it("returns unknown with short raw message preserved", () => {
    const a = classifyTranscriptError("Something odd happened.");
    expect(a.reason).toBe("unknown");
    expect(a.userMessage).toBe("Something odd happened.");
  });

  it("returns generic unknown for very long opaque messages", () => {
    const long = "x".repeat(300);
    const a = classifyTranscriptError(long);
    expect(a.reason).toBe("unknown");
    expect(a.userMessage).toBe("Could not load captions for this video.");
  });

  it("strips library prefix without emoji", () => {
    const a = classifyTranscriptError("[YoutubeTranscript] Transcript is disabled on this video (1)");
    expect(a.reason).toBe("no_captions");
  });
});

describe("failureHeadline / failureQueueLabel", () => {
  it("returns stable UI strings per reason", () => {
    expect(failureHeadline("no_captions")).toBe("No captions on this video");
    expect(failureQueueLabel("no_captions")).toBe("No captions");
    expect(failureQueueLabel("language_unavailable")).toBe("Wrong language");
    expect(failureQueueLabel("rate_limited")).toBe("Rate limited");
    expect(failureQueueLabel("video_unavailable")).toBe("Unavailable");
    expect(failureQueueLabel("unknown")).toBe("Failed");
  });
});
