"use client";

import { useState } from "react";
import JSZip from "jszip";
import { ExportFormat, TranscriptJob } from "@/types/bulkscript";
import { formatTranscript, downloadFile, getMimeType } from "@/utils/bulkscript";
import { Archive } from "lucide-react";

interface ExportToolbarProps {
  exportFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  completedJobs: TranscriptJob[];
  canBulkExport: boolean;
  includeTimestamps: boolean;
  selectionCount: number;
}

export default function ExportToolbar({
  exportFormat,
  onFormatChange,
  completedJobs,
  canBulkExport,
  includeTimestamps,
  selectionCount,
}: ExportToolbarProps) {
  const formats: ExportFormat[] = ["TXT", "SRT", "JSON", "CSV"];
  const [zipping, setZipping] = useState(false);

  async function handleBulkExport() {
    if (!canBulkExport || zipping) return;
    const ext = exportFormat.toLowerCase();

    if (exportFormat === "TXT") {
      const parts = completedJobs.map((job, idx) => {
        const header = `=== ${idx + 1}/${completedJobs.length} | ${job.title} ===`;
        const body = formatTranscript(job.transcript, exportFormat, includeTimestamps, job.title);
        return `${header}\n${body}`;
      });
      downloadFile(parts.join("\n\n"), `bulk_transcripts_${completedJobs.length}.txt`, getMimeType(exportFormat));
      return;
    }

    // For SRT/JSON/CSV pack everything into a single zip — browsers block multiple simultaneous downloads
    setZipping(true);
    try {
      const zip = new JSZip();
      const usedNames = new Map<string, number>();
      for (const job of completedJobs) {
        const content = formatTranscript(job.transcript, exportFormat, includeTimestamps, job.title);
        let base = job.title.replace(/[^a-z0-9]/gi, "_").slice(0, 80);
        const count = usedNames.get(base) ?? 0;
        usedNames.set(base, count + 1);
        if (count > 0) base = `${base}_${count}`;
        zip.file(`${base}.${ext}`, content);
      }
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcripts_${completedJobs.length}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="flex items-center border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-11 flex-shrink-0 overflow-x-auto">
      <div className="px-3 sm:px-4 flex items-center h-full border-r border-gray-200 dark:border-zinc-800 shrink-0">
        <span className="text-[10px] sm:text-xs font-semibold tracking-wide text-gray-400 dark:text-zinc-500 uppercase">
          Format
        </span>
      </div>

      <div className="flex items-center h-full">
        {formats.map((fmt) => {
          const active = exportFormat === fmt;
          return (
            <button
              key={fmt}
              type="button"
              onClick={() => onFormatChange(fmt)}
              className={`h-full px-3 sm:px-4 text-[10px] sm:text-xs font-semibold tracking-wide border-r border-gray-200 dark:border-zinc-800 transition-colors shrink-0 ${
                active
                  ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-50 border-b-2 border-b-gray-900 dark:border-b-zinc-100 -mb-px"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200"
              }`}
            >
              .{fmt}
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex items-center h-full">
        <button
          type="button"
          onClick={handleBulkExport}
          disabled={!canBulkExport || zipping}
          className="flex items-center gap-1.5 h-full px-3 sm:px-4 text-[10px] sm:text-xs font-semibold tracking-wide border-l border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/80 text-gray-900 dark:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors shrink-0"
        >
          <Archive className="w-3.5 h-3.5" />
          {zipping ? "Zipping…" : selectionCount > 0 ? `Bulk · ${selectionCount} selected` : `Bulk · ${completedJobs.length} done`}
        </button>
      </div>
    </div>
  );
}
