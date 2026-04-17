"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  TranscriptJob,
  TranscriptSegment,
  ExportFormat,
} from "@/types/bulkscript";
import { failureHeadline } from "@/lib/youtube/transcript-errors";
import { formatTranscript, downloadFile, getMimeType } from "@/utils/bulkscript";
import {
  Search,
  ExternalLink,
  Play,
  Copy,
  Check,
  X,
  Download,
} from "lucide-react";

interface TranscriptPaneProps {
  job: TranscriptJob | null;
  exportFormat: ExportFormat;
  includeTimestamps: boolean;
  scrollToSeconds?: number | null;
  onScrollHandled?: () => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  const matchRe = new RegExp(`^${escaped}$`, "i");
  return parts.map((part, i) =>
    matchRe.test(part) ? (
      <mark
        key={i}
        className="bg-emerald-200/80 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function TranscriptPane({
  job,
  exportFormat,
  includeTimestamps,
  scrollToSeconds,
  onScrollHandled,
}: TranscriptPaneProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [embeddedTimestamp, setEmbeddedTimestamp] = useState<number | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [highlightedSeconds, setHighlightedSeconds] = useState<number | null>(null);
  const segmentRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (scrollToSeconds == null || !job) return;
    // Find the closest segment at or before the target timestamp
    const target = job.transcript.reduce<TranscriptSegment | null>((best, seg) => {
      if (seg.startSeconds > scrollToSeconds) return best;
      if (!best || seg.startSeconds > best.startSeconds) return seg;
      return best;
    }, null);
    if (!target) return;
    const el = segmentRefs.current.get(target.startSeconds);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedSeconds(target.startSeconds);
      setTimeout(() => setHighlightedSeconds(null), 2000);
    }
    onScrollHandled?.();
  }, [scrollToSeconds, job, onScrollHandled]);

  const filteredSegments = useMemo(() => {
    if (!job) return [];
    if (!searchQuery.trim()) return job.transcript;
    return job.transcript.filter((seg) =>
      seg.text.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [job, searchQuery]);

  function handleTimestampClick(seg: TranscriptSegment) {
    if (!job) return;
    setEmbeddedTimestamp(seg.startSeconds);
    setShowEmbed(true);
  }

  function openInYouTube(seg: TranscriptSegment) {
    if (!job) return;
    const url = `https://www.youtube.com/watch?v=${job.videoId}&t=${Math.floor(seg.startSeconds)}s`;
    window.open(url, "_blank");
  }

  function handleCopy() {
    if (!job) return;
    const content = formatTranscript(
      job.transcript,
      exportFormat,
      includeTimestamps,
      job.title,
    );
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!job) return;
    const content = formatTranscript(
      job.transcript,
      exportFormat,
      includeTimestamps,
      job.title,
    );
    const ext = exportFormat.toLowerCase();
    downloadFile(content, `${job.title}.${ext}`, getMimeType(exportFormat));
  }

  if (!job) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-950">
        <div className="w-16 h-16 flex items-center justify-center mb-6 rounded-2xl border border-gray-200 dark:border-zinc-800">
          <Play className="w-6 h-6 ml-1 text-gray-300 dark:text-zinc-600" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-gray-400 dark:text-zinc-500 uppercase">
          No transcript selected
        </p>
        <p className="text-xs mt-1 text-gray-400 dark:text-zinc-500 text-center max-w-xs">
          Click a completed job to read its transcript, or a failed one for details
        </p>
      </div>
    );
  }

  if (job.status === "failed") {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
        <div className="px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/40 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">
            {job.title}
          </h3>
          <p className="text-xs mt-1 text-gray-500 dark:text-zinc-400">
            {job.channelName}
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50">
            {failureHeadline(job.failureReason ?? "unknown")}
          </p>
          <p className="text-xs mt-2 text-gray-500 dark:text-zinc-400 max-w-md leading-relaxed">
            {job.errorMessage ||
              "We couldn’t load a transcript for this video."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
      <div className="px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/40 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold truncate text-gray-900 dark:text-zinc-50">
              {job.title}
            </h3>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-gray-500 dark:text-zinc-400">
              <span>{job.channelName}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                {job.wordCount.toLocaleString()} words
              </span>
              <span className="tabular-nums">
                {job.transcript.length} segments
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                copied
                  ? "border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
                  : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800"
              }`}
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
            >
              <Download className="w-3 h-3" />
              {exportFormat}
            </button>
          </div>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript…"
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg outline-none bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {searchQuery ? (
          <p className="text-xs mt-1.5 text-gray-400 dark:text-zinc-500">
            {filteredSegments.length} matches
          </p>
        ) : null}
      </div>

      {showEmbed && embeddedTimestamp !== null && (
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmbed(false)}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black/90 transition-colors"
              aria-label="Close player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${job.videoId}?start=${Math.floor(embeddedTimestamp)}&autoplay=1`}
              className="w-full h-[200px]"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Embedded video"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-0">
        {filteredSegments.map((seg, idx) => (
          <div
            key={idx}
            ref={(el) => {
              if (el) segmentRefs.current.set(seg.startSeconds, el);
              else segmentRefs.current.delete(seg.startSeconds);
            }}
            className={`group px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-zinc-800/80 transition-colors ${
              highlightedSeconds === seg.startSeconds
                ? "bg-emerald-50 dark:bg-emerald-950/30"
                : "hover:bg-gray-50/80 dark:hover:bg-zinc-900/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => handleTimestampClick(seg)}
                className="flex-shrink-0 text-xs font-mono pt-0.5 min-w-[52px] text-left text-emerald-600 dark:text-emerald-400 hover:underline"
                title="Open embedded player"
              >
                {seg.timestamp}
              </button>

              <div className="flex-1 min-w-0">
                {seg.speaker && (
                  <span className="text-xs font-semibold tracking-wide mr-2 text-sky-600 dark:text-sky-400">
                    {seg.speaker}:
                  </span>
                )}
                <span className="text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
                  {highlightText(seg.text, searchQuery)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => openInYouTube(seg)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-200"
                title="Open in YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredSegments.length === 0 && searchQuery && (
          <div className="py-12 text-center">
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              No matches for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
