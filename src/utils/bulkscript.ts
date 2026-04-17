import { TranscriptSegment, ExportFormat } from "@/types/bulkscript";
import { getYoutubeThumbnailUrl } from "@/lib/youtube/url";

export {
  detectUrlType,
  extractPlaylistId,
  extractVideoId,
  normalizeYoutubeUrl,
} from "@/lib/youtube/url";

export function getThumbnailUrl(videoId: string): string {
  return getYoutubeThumbnailUrl(videoId);
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function countWords(segments: TranscriptSegment[]): number {
  return segments.reduce(
    (acc, seg) => acc + seg.text.split(/\s+/).filter(Boolean).length,
    0,
  );
}

export function formatTranscript(
  segments: TranscriptSegment[],
  format: ExportFormat,
  includeTimestamps: boolean,
  title: string,
): string {
  switch (format) {
    case "TXT":
      if (includeTimestamps) {
        return segments
          .map(
            (s) =>
              `[${s.timestamp}] ${s.speaker ? `${s.speaker}: ` : ""}${s.text}`,
          )
          .join("\n");
      }
      return segments
        .map((s) => `${s.speaker ? `${s.speaker}: ` : ""}${s.text}`)
        .join("\n");

    case "SRT":
      return segments
        .map((s, i) => {
          const start = formatSrtTime(s.startSeconds);
          const end = formatSrtTime(s.startSeconds + 5);
          return `${i + 1}\n${start} --> ${end}\n${s.text}\n`;
        })
        .join("\n");

    case "JSON":
      return JSON.stringify(
        {
          title,
          segments: segments.map((s) => ({
            timestamp: s.timestamp,
            startSeconds: s.startSeconds,
            text: s.text,
            ...(s.speaker ? { speaker: s.speaker } : {}),
          })),
        },
        null,
        2,
      );

    case "CSV": {
      const headers = ["Timestamp", "Start Seconds", "Speaker", "Text"];
      const rows = segments.map((s) =>
        [
          `"${s.timestamp}"`,
          s.startSeconds,
          `"${s.speaker || ""}"`,
          `"${s.text.replace(/"/g, '""')}"`,
        ].join(","),
      );
      return [headers.join(","), ...rows].join("\n");
    }

    default:
      return segments.map((s) => s.text).join("\n");
  }
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getMimeType(format: ExportFormat): string {
  const map: Record<ExportFormat, string> = {
    TXT: "text/plain",
    SRT: "text/plain",
    JSON: "application/json",
    CSV: "text/csv",
  };
  return map[format];
}
