"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { TranscriptJob } from "@/types/bulkscript";
import { Search, X } from "lucide-react";

interface GlobalSearchProps {
  jobs: TranscriptJob[];
  onSelectJob: (id: string, startSeconds: number) => void;
  open: boolean;
  onClose: () => void;
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

export default function GlobalSearch({ jobs, onSelectJob, open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

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

  function highlightText(text: string): React.ReactNode {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    const matchRe = new RegExp(`^${escaped}$`, "i");
    return parts.map((part, i) =>
      matchRe.test(part) ? (
        <mark key={i} className="bg-emerald-200/80 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 rounded px-0.5">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
          <Search className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="Search across all transcripts…"
            className="flex-1 text-sm outline-none bg-transparent text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          />
          {query ? (
            <span className="text-xs text-gray-400 dark:text-zinc-500 tabular-nums shrink-0">
              {results.length}{results.length >= 50 ? "+" : ""} results
            </span>
          ) : (
            <kbd className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-gray-400 dark:text-zinc-500">
              Esc
            </kbd>
          )}
          <button type="button" onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {query.length >= 2 && results.length > 0 && (
          <div className="max-h-80 overflow-y-auto">
            {results.map((result, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelectJob(result.jobId, result.startSeconds);
                  onClose();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectJob(result.jobId, result.startSeconds);
                    onClose();
                  }
                }}
                className="flex items-start gap-3 px-4 py-2.5 cursor-pointer border-b border-gray-100 dark:border-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <img src={result.thumbnailUrl} alt="" className="w-10 h-7 object-cover flex-shrink-0 mt-0.5 rounded border border-gray-200 dark:border-zinc-700" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{result.timestamp}</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400 truncate">{result.jobTitle}</span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                    {highlightText(result.text)}
                  </p>
                </div>
              </div>
            ))}
            {results.length >= 50 && (
              <div className="px-4 py-2 text-center border-t border-gray-100 dark:border-zinc-800">
                <span className="text-xs text-gray-400 dark:text-zinc-500">Showing first 50 results</span>
              </div>
            )}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && (
          <div className="px-4 py-6 text-center">
            <span className="text-xs text-gray-400 dark:text-zinc-500">No matches for &ldquo;{query}&rdquo;</span>
          </div>
        )}

        {!query && (
          <div className="px-4 py-4 text-center">
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              {jobs.filter(j => j.status === "done").length === 0
                ? "Add a transcript first to search"
                : `Search across ${jobs.filter(j => j.status === "done").length} transcript${jobs.filter(j => j.status === "done").length !== 1 ? "s" : ""}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
