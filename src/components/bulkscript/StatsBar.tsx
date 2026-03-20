"use client";

import { TranscriptJob } from "@/types/bulkscript";
import { FileText, Clock, Hash, CheckCircle2 } from "lucide-react";

interface StatsBarProps {
  jobs: TranscriptJob[];
}

export default function StatsBar({ jobs }: StatsBarProps) {
  const totalQueued = jobs.length;
  const extracted = jobs.filter((j) => j.status === "done").length;
  const totalWords = jobs.reduce((acc, j) => acc + j.wordCount, 0);
  const processing = jobs.filter((j) => j.status === "processing").length;
  const pending = jobs.filter((j) => j.status === "pending").length;
  const estTimeRemaining =
    processing + pending > 0
      ? `~${Math.ceil((processing + pending) * 3.5)}s`
      : "—";

  const stats = [
    {
      icon: <Hash className="w-3.5 h-3.5" />,
      label: "QUEUED",
      value: totalQueued.toString().padStart(2, "0"),
    },
    {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: "EXTRACTED",
      value: extracted.toString().padStart(2, "0"),
    },
    {
      icon: <FileText className="w-3.5 h-3.5" />,
      label: "WORDS CAPTURED",
      value:
        totalWords > 0
          ? totalWords.toLocaleString()
          : "0",
    },
    {
      icon: <Clock className="w-3.5 h-3.5" />,
      label: "EST. REMAINING",
      value: estTimeRemaining,
    },
  ];

  return (
    <div
      className="flex items-center border-b font-space"
      style={{
        backgroundColor: "#0A0C11",
        borderColor: "#2A2D35",
        height: "36px",
      }}
    >
      <div className="flex items-center gap-0 h-full" style={{ borderColor: "#2A2D35" }}>
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-4 h-full border-r"
            style={{ borderColor: "#2A2D35" }}
          >
            <span style={{ color: "#8A8D95" }} className="flex items-center">
              {stat.icon}
            </span>
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: "#8A8D95" }}
            >
              {stat.label}
            </span>
            <span
              className="font-mono-jet text-xs font-semibold"
              style={{ color: "#C8FF00" }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <span className="text-xs font-mono-jet" style={{ color: "#8A8D95" }}>
          BULKSCRIPT
        </span>
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: "#C8FF00" }}
        />
      </div>
    </div>
  );
}
