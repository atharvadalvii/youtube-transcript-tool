"use client";

import { useState, useMemo } from "react";
import { TranscriptJob, TranscriptSegment, ExportFormat } from "@/types/bulkscript";
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
}

export default function TranscriptPane({
  job,
  exportFormat,
  includeTimestamps,
}: TranscriptPaneProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [embeddedTimestamp, setEmbeddedTimestamp] = useState<number | null>(
    null
  );
  const [showEmbed, setShowEmbed] = useState(false);

  const filteredSegments = useMemo(() => {
    if (!job) return [];
    if (!searchQuery.trim()) return job.transcript;
    return job.transcript.filter((seg) =>
      seg.text.toLowerCase().includes(searchQuery.toLowerCase())
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
      job.title
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
      job.title
    );
    const ext = exportFormat.toLowerCase();
    downloadFile(content, `${job.title}.${ext}`, getMimeType(exportFormat));
  }

  function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{ backgroundColor: "#C8FF0040", color: "#C8FF00" }}
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  if (!job) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: "#0F1117" }}
      >
        <div
          className="w-16 h-16 flex items-center justify-center mb-6"
          style={{ border: "1px solid #2A2D35" }}
        >
          <Play className="w-6 h-6 ml-1" style={{ color: "#3A3D45" }} />
        </div>
        <p
          className="text-sm tracking-widest uppercase font-space"
          style={{ color: "#3A3D45" }}
        >
          No transcript selected
        </p>
        <p className="text-xs mt-1 font-space" style={{ color: "#3A3D45" }}>
          Complete a job and click to view transcript
        </p>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col animate-fade-in"
      style={{ backgroundColor: "#0F1117" }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: "#2A2D35", backgroundColor: "#0A0C11" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold truncate font-space"
              style={{ color: "#F0EDE6" }}
            >
              {job.title}
            </h3>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs font-space" style={{ color: "#8A8D95" }}>
                {job.channelName}
              </span>
              <span
                className="text-xs font-mono-jet"
                style={{ color: "#C8FF00" }}
              >
                {job.wordCount.toLocaleString()} words
              </span>
              <span
                className="text-xs font-mono-jet"
                style={{ color: "#8A8D95" }}
              >
                {job.transcript.length} segments
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all"
              style={{
                border: "1px solid #2A2D35",
                color: copied ? "#C8FF00" : "#8A8D95",
                borderColor: copied ? "#C8FF0040" : "#2A2D35",
              }}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "COPIED" : "COPY"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all hover:opacity-80"
              style={{
                backgroundColor: "#C8FF00",
                color: "#0F1117",
                fontWeight: 700,
              }}
            >
              <Download className="w-3 h-3" />
              {exportFormat}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: "#8A8D95" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcript..."
            className="w-full pl-9 pr-8 py-2 text-xs outline-none font-mono-jet"
            style={{
              backgroundColor: "#1A1D24",
              border: "1px solid #2A2D35",
              color: "#F0EDE6",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: "#8A8D95" }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs mt-1.5 font-mono-jet" style={{ color: "#8A8D95" }}>
            {filteredSegments.length} matches
          </p>
        )}
      </div>

      {/* Embedded Player */}
      {showEmbed && embeddedTimestamp !== null && (
        <div
          className="flex-shrink-0 border-b"
          style={{ borderColor: "#2A2D35", backgroundColor: "#1A1D24" }}
        >
          <div className="relative">
            <button
              onClick={() => setShowEmbed(false)}
              className="absolute top-2 right-2 z-10 p-1 transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#0F1117", color: "#8A8D95" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${job.videoId}?start=${Math.floor(embeddedTimestamp)}&autoplay=1`}
              className="w-full"
              style={{ height: "200px" }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Transcript Segments */}
      <div className="flex-1 overflow-y-auto bs-scroll p-0">
        {filteredSegments.map((seg, idx) => (
          <div
            key={idx}
            className="group px-5 py-3 transition-colors"
            style={{
              borderBottom: "1px solid #1E2028",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1A1D24";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div className="flex items-start gap-3">
              {/* Timestamp */}
              <button
                onClick={() => handleTimestampClick(seg)}
                className="flex-shrink-0 font-mono-jet text-xs pt-0.5 transition-colors hover:opacity-80 group-hover:underline"
                style={{ color: "#C8FF00", minWidth: "52px" }}
                title="Click to open embedded player"
              >
                {seg.timestamp}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {seg.speaker && (
                  <span
                    className="text-xs font-bold tracking-wider mr-2"
                    style={{ color: "#00D4FF" }}
                  >
                    {seg.speaker}:
                  </span>
                )}
                <span
                  className="text-sm font-mono-jet leading-relaxed"
                  style={{ color: "#C4C1BA" }}
                >
                  {highlightText(seg.text, searchQuery)}
                </span>
              </div>

              {/* Open in YouTube */}
              <button
                onClick={() => openInYouTube(seg)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                style={{ color: "#8A8D95" }}
                title="Open in YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredSegments.length === 0 && searchQuery && (
          <div className="py-12 text-center">
            <p className="text-xs font-space" style={{ color: "#3A3D45" }}>
              No matches for "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
