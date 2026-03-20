"use client";

import { ExportFormat, TranscriptJob } from "@/types/bulkscript";
import { formatTranscript, downloadFile, getMimeType } from "@/utils/bulkscript";
import { Download, Archive } from "lucide-react";

interface ExportToolbarProps {
  exportFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  selectedJob: TranscriptJob | null;
  completedJobs: TranscriptJob[];
  includeTimestamps: boolean;
}

export default function ExportToolbar({
  exportFormat,
  onFormatChange,
  selectedJob,
  completedJobs,
  includeTimestamps,
}: ExportToolbarProps) {
  const formats: ExportFormat[] = ["TXT", "SRT", "JSON", "CSV"];

  function handleSingleExport() {
    if (!selectedJob || selectedJob.status !== "done") return;
    const content = formatTranscript(
      selectedJob.transcript,
      exportFormat,
      includeTimestamps,
      selectedJob.title
    );
    const ext = exportFormat.toLowerCase();
    downloadFile(
      content,
      `${selectedJob.title.replace(/[^a-z0-9]/gi, "_")}.${ext}`,
      getMimeType(exportFormat)
    );
  }

  async function handleBulkExport() {
    if (completedJobs.length === 0) return;

    // Simple multi-file download (browser will show multiple downloads)
    for (const job of completedJobs) {
      const content = formatTranscript(
        job.transcript,
        exportFormat,
        includeTimestamps,
        job.title
      );
      const ext = exportFormat.toLowerCase();
      downloadFile(
        content,
        `${job.title.replace(/[^a-z0-9]/gi, "_")}.${ext}`,
        getMimeType(exportFormat)
      );
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return (
    <div
      className="flex items-center gap-0 border-b font-space flex-shrink-0"
      style={{
        backgroundColor: "#0A0C11",
        borderColor: "#2A2D35",
        height: "44px",
      }}
    >
      {/* Format Label */}
      <div
        className="px-4 flex items-center h-full border-r"
        style={{ borderColor: "#2A2D35" }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "#8A8D95" }}
        >
          FORMAT
        </span>
      </div>

      {/* Format Pills */}
      <div className="flex items-center h-full">
        {formats.map((fmt) => (
          <button
            key={fmt}
            onClick={() => onFormatChange(fmt)}
            className="h-full px-4 text-xs font-bold tracking-wider transition-all border-r"
            style={{
              backgroundColor:
                exportFormat === fmt ? "#C8FF0015" : "transparent",
              color: exportFormat === fmt ? "#C8FF00" : "#8A8D95",
              borderColor: "#2A2D35",
              borderBottom:
                exportFormat === fmt ? "2px solid #C8FF00" : "2px solid transparent",
            }}
          >
            .{fmt}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center h-full gap-0">
        {/* Single Export */}
        <button
          onClick={handleSingleExport}
          disabled={!selectedJob || selectedJob.status !== "done"}
          className="flex items-center gap-2 h-full px-4 text-xs font-bold tracking-wider transition-all disabled:opacity-30 border-l hover:opacity-80"
          style={{
            borderColor: "#2A2D35",
            color: "#F0EDE6",
          }}
        >
          <Download className="w-3.5 h-3.5" />
          EXPORT SELECTED
        </button>

        {/* Bulk Export */}
        <button
          onClick={handleBulkExport}
          disabled={completedJobs.length === 0}
          className="flex items-center gap-2 h-full px-4 text-xs font-bold tracking-wider transition-all disabled:opacity-30 border-l hover:opacity-80"
          style={{
            backgroundColor: completedJobs.length > 0 ? "#C8FF0015" : "transparent",
            borderColor: "#2A2D35",
            color: completedJobs.length > 0 ? "#C8FF00" : "#8A8D95",
          }}
        >
          <Archive className="w-3.5 h-3.5" />
          BULK EXPORT ({completedJobs.length})
        </button>
      </div>
    </div>
  );
}
