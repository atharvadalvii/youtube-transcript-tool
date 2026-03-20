"use client";

import React, { useState, useMemo } from "react";
import { TranscriptJob } from "@/types/bulkscript";
import { Search, X } from "lucide-react";

interface GlobalSearchProps {
  jobs: TranscriptJob[];
  onSelectJob: (id: string) => void;
}

interface SearchResult {
  jobId: string;
  jobTitle: string;
  channelName: string;
  thumbnailUrl: string;
  timestamp: string;
  startSeconds: number;
  text: string;
  videoId: string;
}

export default function GlobalSearch({ jobs, onSelectJob }: GlobalSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo((): SearchResult[] => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const out: SearchResult[] = [];
    for (const job of jobs) {
      if (job.status !== "done") continue;
      for (const seg of job.transcript) {
        if (seg.text.toLowerCase().includes(q)) {
          out.push({
            jobId: job.id,
            jobTitle: job.title,
            channelName: job.channelName,
            thumbnailUrl: job.thumbnailUrl,
            timestamp: seg.timestamp,
            startSeconds: seg.startSeconds,
            text: seg.text,
            videoId: job.videoId,
          });
          if (out.length >= 50) break;
        }
      }
      if (out.length >= 50) break;
    }
    return out;
  }, [query, jobs]);

  const completedCount = jobs.filter((j) => j.status === "done").length;

  function highlightText(text: string): React.ReactNode {
    if (!query.trim()) return text;
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} style={{ backgroundColor: "#C8FF0040", color: "#C8FF00" }}>
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  if (completedCount === 0) return null;

  return (
    <div
      className="border-b font-space"
      style={{ backgroundColor: "#0A0C11", borderColor: "#2A2D35" }}
    >
      <div className="px-4 py-2.5 flex items-center gap-3">
        <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#8A8D95" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search across ${completedCount} transcript${completedCount !== 1 ? "s" : ""}...`}
          className="flex-1 text-xs outline-none font-mono-jet bg-transparent"
          style={{ color: "#F0EDE6" }}
        />
        {query && (
          <>
            <span className="text-xs font-mono-jet" style={{ color: "#8A8D95" }}>
              {results.length} results
            </span>
            <button
              onClick={() => setQuery("")}
              style={{ color: "#8A8D95" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Results Dropdown */}
      {query.length >= 2 && results.length > 0 && (
        <div
          className="border-t max-h-60 overflow-y-auto bs-scroll"
          style={{ borderColor: "#2A2D35" }}
        >
          {results.map((result, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectJob(result.jobId);
                setQuery("");
              }}
              className="flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors"
              style={{ borderBottom: "1px solid #1E2028" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1A1D24";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <img
                src={result.thumbnailUrl}
                alt=""
                className="w-10 h-7 object-cover flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-xs font-mono-jet"
                    style={{ color: "#C8FF00" }}
                  >
                    {result.timestamp}
                  </span>
                  <span className="text-xs truncate" style={{ color: "#8A8D95" }}>
                    {result.jobTitle}
                  </span>
                </div>
                <p className="text-xs font-mono-jet line-clamp-2" style={{ color: "#C4C1BA" }}>
                  {highlightText(result.text)}
                </p>
              </div>
            </div>
          ))}
          {results.length >= 50 && (
            <div className="px-4 py-2 text-center">
              <span className="text-xs" style={{ color: "#8A8D95" }}>
                Showing first 50 results
              </span>
            </div>
          )}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && (
        <div
          className="px-4 py-3 border-t text-center"
          style={{ borderColor: "#2A2D35" }}
        >
          <span className="text-xs font-mono-jet" style={{ color: "#3A3D45" }}>
            No matches found for "{query}"
          </span>
        </div>
      )}
    </div>
  );
}
