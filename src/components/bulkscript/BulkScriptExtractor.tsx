"use client";

import { useState, useCallback, useRef } from "react";
import {
  TranscriptJob,
  ExportFormat,
  ExtractorSettings,
  VideoListItem,
  UrlType,
} from "@/types/bulkscript";
import { generateMockTranscript, countWords } from "@/utils/bulkscript";
import StatsBar from "./StatsBar";
import InputBar from "./InputBar";
import JobQueue from "./JobQueue";
import TranscriptPane from "./TranscriptPane";
import ExportToolbar from "./ExportToolbar";
import SettingsDrawer from "./SettingsDrawer";
import GlobalSearch from "./GlobalSearch";
import { Settings, Terminal } from "lucide-react";

export default function BulkScriptExtractor() {
  const [jobs, setJobs] = useState<TranscriptJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("TXT");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ExtractorSettings>({
    language: "en",
    includeTimestamps: true,
    speakerDetection: true,
    rateLimitMs: 1000,
  });

  const processingRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const simulateExtraction = useCallback(
    (jobId: string) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setJobs((prev: TranscriptJob[]) =>
            prev.map((j: TranscriptJob) =>
              j.id === jobId
                ? (() => {
                    const transcript = generateMockTranscript(j.videoId);
                    const success = Math.random() > 0.1;
                    return {
                      ...j,
                      status: success ? ("done" as const) : ("failed" as const),
                      progress: 100,
                      transcript,
                      wordCount: countWords(transcript),
                      errorMessage: success
                        ? undefined
                        : "Failed to fetch transcript. Video may not have captions enabled.",
                    };
                  })()
              : j
            )
          );
        } else {
          setJobs((prev: TranscriptJob[]) =>
            prev.map((j: TranscriptJob) =>
              j.id === jobId ? { ...j, progress: Math.round(progress) } : j
            )
          );
        }
      }, 300 + Math.random() * 200);
      processingRef.current[jobId] = interval;
    },
    []
  );

  const handleExtract = useCallback(
    (urlType: UrlType, videos: VideoListItem[], url: string) => {
      const newJobs: TranscriptJob[] = videos.map((video, i) => ({
        id: `job_${Date.now()}_${i}`,
        videoId: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        channelName: video.channelName || "Unknown Channel",
        duration: video.duration,
        status: "pending",
        progress: 0,
        transcript: [],
        wordCount: 0,
        sourceUrl: url,
      }));

      setJobs((prev) => [...prev, ...newJobs]);

      // Start processing with staggered delay based on rate limit
      newJobs.forEach((job, idx) => {
        setTimeout(() => {
          setJobs((prev: TranscriptJob[]) =>
            prev.map((j: TranscriptJob) => (j.id === job.id ? { ...j, status: "processing" as const } : j))
          );
          simulateExtraction(job.id);
        }, idx * settings.rateLimitMs);
      });
    },
    [settings.rateLimitMs, simulateExtraction]
  );

  const handleRetryJob = useCallback(
    (jobId: string) => {
      setJobs((prev: TranscriptJob[]) =>
        prev.map((j: TranscriptJob) =>
          j.id === jobId
            ? { ...j, status: "processing" as const, progress: 0, errorMessage: undefined }
            : j
        )
      );
      simulateExtraction(jobId);
    },
    [simulateExtraction]
  );

  const handleReorder = useCallback((from: number, to: number) => {
    setJobs((prev: TranscriptJob[]) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }, []);

  const selectedJob =
    jobs.find((j) => j.id === selectedJobId) || null;
  const completedJobs = jobs.filter((j) => j.status === "done");

  return (
    <div
      className="flex flex-col h-screen bs-noise font-space"
      style={{ backgroundColor: "#0F1117" }}
    >
      {/* Stats Bar */}
      <StatsBar jobs={jobs} />

      {/* App Navbar */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
        style={{ backgroundColor: "#0A0C11", borderColor: "#2A2D35" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-7 h-7"
            style={{ backgroundColor: "#C8FF00" }}
          >
            <Terminal className="w-4 h-4" style={{ color: "#0F1117" }} />
          </div>
          <h1
            className="text-base font-bold tracking-wider font-syne"
            style={{ color: "#F0EDE6" }}
          >
            BULK<span style={{ color: "#C8FF00" }}>SCRIPT</span>
          </h1>
          <div
            className="px-2 py-0.5 text-xs font-mono-jet"
            style={{
              backgroundColor: "#C8FF0015",
              border: "1px solid #C8FF0040",
              color: "#C8FF00",
            }}
          >
            BETA
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/pricing"
            className="px-4 py-1.5 text-xs font-bold tracking-wider transition-colors"
            style={{
              border: "1px solid #2A2D35",
              color: "#8A8D95",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C8FF00";
              e.currentTarget.style.color = "#C8FF00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2A2D35";
              e.currentTarget.style.color = "#8A8D95";
            }}
          >
            UPGRADE
          </a>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold tracking-wider transition-all"
            style={{
              border: "1px solid #2A2D35",
              color: "#8A8D95",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C8FF00";
              e.currentTarget.style.color = "#C8FF00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2A2D35";
              e.currentTarget.style.color = "#8A8D95";
            }}
          >
            <Settings className="w-3.5 h-3.5" />
            SETTINGS
          </button>
        </div>
      </div>

      {/* Input Bar */}
      <InputBar onExtract={handleExtract} />

      {/* Global Search */}
      <GlobalSearch jobs={jobs} onSelectJob={setSelectedJobId} />

      {/* Export Toolbar */}
      <ExportToolbar
        exportFormat={exportFormat}
        onFormatChange={setExportFormat}
        selectedJob={selectedJob}
        completedJobs={completedJobs}
        includeTimestamps={settings.includeTimestamps}
      />

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Job Queue */}
        <div
          className="flex flex-col"
          style={{
            width: "340px",
            minWidth: "280px",
            borderRight: "1px solid #2A2D35",
            backgroundColor: "#0F1117",
          }}
        >
          {/* Queue Header */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0"
            style={{ borderColor: "#2A2D35", backgroundColor: "#0A0C11" }}
          >
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "#8A8D95" }}
            >
              Job Queue
            </span>
            <span
              className="text-xs font-mono-jet"
              style={{ color: "#C8FF00" }}
            >
              {jobs.length}
            </span>
          </div>

          {/* Queue */}
          <JobQueue
            jobs={jobs}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            onRetryJob={handleRetryJob}
            onReorder={handleReorder}
          />
        </div>

        {/* Right: Transcript Pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TranscriptPane
            job={selectedJob}
            exportFormat={exportFormat}
            includeTimestamps={settings.includeTimestamps}
          />
        </div>
      </div>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}
