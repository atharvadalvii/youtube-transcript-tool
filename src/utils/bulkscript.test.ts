import { describe, expect, it } from "vitest";
import type { TranscriptSegment } from "@/types/bulkscript";
import {
  countWords,
  formatTimestamp,
  formatTranscript,
} from "./bulkscript";

function seg(
  partial: Partial<TranscriptSegment> & Pick<TranscriptSegment, "text" | "startSeconds">,
): TranscriptSegment {
  return {
    timestamp: partial.timestamp ?? "0:00",
    startSeconds: partial.startSeconds,
    text: partial.text,
    speaker: partial.speaker,
  };
}

describe("formatTimestamp", () => {
  it("formats mm:ss when under one hour", () => {
    expect(formatTimestamp(0)).toBe("0:00");
    expect(formatTimestamp(65)).toBe("1:05");
    expect(formatTimestamp(3599)).toBe("59:59");
  });

  it("formats h:mm:ss at or above one hour", () => {
    expect(formatTimestamp(3600)).toBe("1:00:00");
    expect(formatTimestamp(3661)).toBe("1:01:01");
  });
});

describe("countWords", () => {
  it("counts words across segments", () => {
    expect(
      countWords([
        seg({ startSeconds: 0, text: "hello world" }),
        seg({ startSeconds: 1, text: "three word phrase" }),
      ]),
    ).toBe(5);
  });

  it("handles empty and whitespace-only segments", () => {
    expect(countWords([])).toBe(0);
    expect(countWords([seg({ startSeconds: 0, text: "" })])).toBe(0);
    expect(countWords([seg({ startSeconds: 0, text: "   \n\t  " })])).toBe(0);
  });
});

describe("formatTranscript", () => {
  const segments: TranscriptSegment[] = [
    {
      timestamp: "0:00",
      startSeconds: 0,
      text: "First line",
    },
    {
      timestamp: "0:05",
      startSeconds: 5,
      text: "Second line",
      speaker: "Host",
    },
  ];

  it("TXT with timestamps includes brackets and optional speaker", () => {
    const out = formatTranscript(segments, "TXT", true, "T");
    expect(out).toContain("[0:00] First line");
    expect(out).toContain("[0:05] Host: Second line");
  });

  it("TXT without timestamps omits timestamps", () => {
    const out = formatTranscript(segments, "TXT", false, "T");
    expect(out).not.toContain("[0:00]");
    expect(out).toContain("Host: Second line");
  });

  it("JSON includes title and segment fields", () => {
    const out = formatTranscript(segments, "JSON", true, "My Video");
    const parsed = JSON.parse(out) as {
      title: string;
      segments: { text: string; speaker?: string }[];
    };
    expect(parsed.title).toBe("My Video");
    expect(parsed.segments).toHaveLength(2);
    expect(parsed.segments[1].speaker).toBe("Host");
  });

  it("SRT contains index and time range lines", () => {
    const out = formatTranscript(segments, "SRT", true, "T");
    expect(out).toMatch(/^1\n/);
    expect(out).toContain("-->");
    expect(out).toContain("First line");
  });

  it("CSV escapes quotes in text", () => {
    const withQuote = [
      {
        timestamp: "0:00",
        startSeconds: 0,
        text: 'Say "hello"',
      },
    ];
    const out = formatTranscript(withQuote, "CSV", true, "T");
    expect(out).toContain('""');
  });
});
