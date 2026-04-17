/**
 * Map youtube-transcript / InnerTube errors to stable reasons and copy.
 * Library messages often look like: "[YoutubeTranscript] 🚨 …"
 */

import type { TranscriptFailureReason } from "@/types/bulkscript";

function stripLibraryPrefix(message: string): string {
  return message
    .replace(/^\[YoutubeTranscript\]\s*/i, "")
    .replace(/^[\uFE0F\s]*\uD83D\uDEA8\s*/, "") // optional VS16 + U+1F6A8 police light emoji
    .trim();
}

export function classifyTranscriptError(rawMessage: string): {
  reason: TranscriptFailureReason;
  userMessage: string;
} {
  const inner = stripLibraryPrefix(rawMessage);

  if (/too many requests|captcha/i.test(inner)) {
    return {
      reason: "rate_limited",
      userMessage:
        "YouTube temporarily limited transcript requests from this connection. Wait a minute, then use Retry, or extract fewer videos at once.",
    };
  }

  if (/no longer available/i.test(inner)) {
    return {
      reason: "video_unavailable",
      userMessage:
        "This video isn’t available (removed, private, or region-blocked), so we can’t load captions.",
    };
  }

  if (
    /transcript is disabled/i.test(inner) ||
    /no transcripts are available for this video/i.test(inner) ||
    /could not load captions/i.test(inner)
  ) {
    return {
      reason: "no_captions",
      userMessage:
        "This video doesn’t expose captions we can read. If none were uploaded, auto-captions are off, or the creator disabled them, we can’t build a transcript here. Try another video or a source that includes subtitles.",
    };
  }

  if (/no transcripts are available in/i.test(inner)) {
    return {
      reason: "language_unavailable",
      userMessage:
        "Captions exist on this video, but not in the language you selected. Open Settings and choose another language that matches an available track.",
    };
  }

  if (inner.length > 0 && inner.length < 280) {
    return { reason: "unknown", userMessage: inner };
  }

  return {
    reason: "unknown",
    userMessage: "Could not load captions for this video.",
  };
}

export function failureHeadline(reason: TranscriptFailureReason): string {
  switch (reason) {
    case "no_captions":
      return "No captions on this video";
    case "language_unavailable":
      return "Caption language not available";
    case "rate_limited":
      return "Temporarily rate limited";
    case "video_unavailable":
      return "Video unavailable";
    default:
      return "Transcript unavailable";
  }
}

export function failureQueueLabel(reason: TranscriptFailureReason): string {
  switch (reason) {
    case "no_captions":
      return "No captions";
    case "language_unavailable":
      return "Wrong language";
    case "rate_limited":
      return "Rate limited";
    case "video_unavailable":
      return "Unavailable";
    default:
      return "Failed";
  }
}
