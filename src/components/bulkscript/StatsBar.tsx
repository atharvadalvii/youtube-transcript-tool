"use client";

import { TranscriptJob } from "@/types/bulkscript";
import { FileText, Clock, Hash, CheckCircle2, AlertCircle } from "lucide-react";

interface StatsBarProps {
  jobs: TranscriptJob[];
}

export default function StatsBar({ jobs }: StatsBarProps) {
  const totalQueued = jobs.length;
  const extracted = jobs.filter((j) => j.status === "done").length;
  const totalWords = jobs.reduce((acc, j) => acc + j.wordCount, 0);
  const processing = jobs.filter((j) => j.status === "processing").length;
  const pending = jobs.filter((j) => j.status === "pending").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  const noCaptionFails = jobs.filter(
    (j) => j.status === "failed" && j.failureReason === "no_captions",
  ).length;
  const estTimeRemaining =
    processing + pending > 0
      ? `~${Math.ceil((processing + pending) * 3.5)}s`
      : "—";

  const stats = [
    {
      icon: <Hash className="w-3.5 h-3.5" />,
      label: "Queued",
      value: totalQueued.toString().padStart(2, "0"),
    },
    {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: "Extracted",
      value: extracted.toString().padStart(2, "0"),
    },
    {
      icon: <FileText className="w-3.5 h-3.5" />,
      label: "Words",
      value: totalWords > 0 ? totalWords.toLocaleString() : "0",
    },
    {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "Est. remaining",
      value: estTimeRemaining,
    },
  ];

  if (failed > 0) {
    stats.push({
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      label: "Failed",
      value:
        noCaptionFails === failed
          ? `${failed} (no captions)`
          : noCaptionFails > 0
            ? `${failed} (${noCaptionFails} no captions)`
            : failed.toString().padStart(2, "0"),
    });
  }

  if (totalQueued === 0) return null;

  return (
    <div className="flex items-center border-b border-gray-200 dark:border-zinc-800 bg-gray-50/90 dark:bg-zinc-900/80 h-9 text-[11px] sm:text-xs">
      <div className="flex items-center gap-0 h-full overflow-x-auto">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-3 sm:px-4 h-full border-r border-gray-200 dark:border-zinc-800 whitespace-nowrap"
          >
            <span className="flex items-center text-gray-400 dark:text-zinc-500">
              {stat.icon}
            </span>
            <span className="tracking-wide text-gray-500 dark:text-zinc-400 font-medium uppercase">
              {stat.label}
            </span>
            <span className="tabular-nums font-semibold text-gray-900 dark:text-zinc-100">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 px-3 sm:px-4 border-l border-gray-200 dark:border-zinc-800 h-full">
        <span className="text-gray-400 dark:text-zinc-500 hidden sm:inline">
          Studio
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
          aria-hidden
        />
      </div>
    </div>
  );
}
