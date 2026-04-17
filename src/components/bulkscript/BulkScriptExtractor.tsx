"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  TranscriptJob,
  ExportFormat,
  ExtractorSettings,
  VideoListItem,
  UrlType,
  TranscriptSegment,
  TranscriptFailureReason,
} from "@/types/bulkscript";
import { countWords } from "@/utils/bulkscript";
import StatsBar from "./StatsBar";
import InputBar from "./InputBar";
import JobQueue from "./JobQueue";
import TranscriptPane from "./TranscriptPane";
import ExportToolbar from "./ExportToolbar";
import SettingsDrawer from "./SettingsDrawer";
import GlobalSearch from "./GlobalSearch";
import { Settings, Search, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { siteFontStyle } from "@/lib/site-theme";

export default function BulkScriptExtractor({
  initialUrl = "",
}: {
  initialUrl?: string;
}) {
  function loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  const [jobs, setJobs] = useState<TranscriptJob[]>(() =>
    loadFromStorage<TranscriptJob[]>("yt_jobs", []).map((j) =>
      j.status === "processing" || j.status === "pending"
        ? { ...j, status: "failed" as const, failureReason: "unknown" as const, errorMessage: "Interrupted by page refresh." }
        : j
    )
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [scrollToSeconds, setScrollToSeconds] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(
    () => loadFromStorage<ExportFormat>("yt_export_format", "TXT")
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ExtractorSettings>(() =>
    loadFromStorage<ExtractorSettings>("yt_settings", {
      language: "en",
      includeTimestamps: true,
      speakerDetection: true,
      rateLimitMs: 1000,
    })
  );

  const completedCount = jobs.filter((j) => j.status === "done").length;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (completedCount > 0) setSearchOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [completedCount]);

  // Persist jobs, settings and format to localStorage
  useEffect(() => {
    try { localStorage.setItem("yt_jobs", JSON.stringify(jobs)); } catch {}
  }, [jobs]);

  useEffect(() => {
    try { localStorage.setItem("yt_settings", JSON.stringify(settings)); } catch {}
  }, [settings]);

  useEffect(() => {
    try { localStorage.setItem("yt_export_format", JSON.stringify(exportFormat)); } catch {}
  }, [exportFormat]);

  // Serialize transcript fetching to avoid YouTube throttling/captcha on bulk playlists.
  const transcriptQueueRef = useRef<Promise<void>>(Promise.resolve());

  const runTranscription = useCallback(
    (jobId: string, videoId: string) => {
      transcriptQueueRef.current = transcriptQueueRef.current.then(
        async () => {
          setJobs((prev: TranscriptJob[]) =>
            prev.map((j: TranscriptJob) =>
              j.id === jobId
                ? { ...j, status: "processing" as const }
                : j,
            ),
          );
          try {
            const res = await fetch("/api/youtube/transcript", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                videoId,
                lang: settings.language,
              }),
            });
            const data = await res.json();
            if (!data.ok) {
              const errText =
                typeof data.error === "string"
                  ? data.error
                  : "Transcript unavailable.";
              const reasonRaw = data.reason as string | undefined;
              const reason: TranscriptFailureReason =
                reasonRaw === "no_captions" ||
                reasonRaw === "language_unavailable" ||
                reasonRaw === "rate_limited" ||
                reasonRaw === "video_unavailable"
                  ? reasonRaw
                  : "unknown";
              setJobs((prev) =>
                prev.map((j) =>
                  j.id === jobId
                    ? {
                        ...j,
                        status: "failed" as const,
                        progress: 100,
                        errorMessage: errText,
                        failureReason: reason,
                      }
                    : j,
                ),
              );
              return;
            }
            const transcript = data.segments as TranscriptSegment[];
            setJobs((prev) =>
              prev.map((j) =>
                j.id === jobId
                  ? {
                      ...j,
                      status: "done" as const,
                      progress: 100,
                      transcript,
                      wordCount: countWords(transcript),
                    }
                  : j,
              ),
            );
          } catch {
            setJobs((prev) =>
              prev.map((j) =>
                j.id === jobId
                  ? {
                      ...j,
                      status: "failed" as const,
                      progress: 100,
                      failureReason: "unknown",
                      errorMessage:
                        "Network error while fetching transcript.",
                    }
                  : j,
              ),
            );
          } finally {
            const ms = settings.rateLimitMs;
            if (ms > 0) {
              await new Promise((r) => setTimeout(r, ms));
            }
          }
        },
      );
    },
    [settings.language, settings.rateLimitMs],
  );

  const handleExtract = useCallback(
    (urlType: UrlType, videos: VideoListItem[], url: string) => {
      transcriptQueueRef.current = Promise.resolve();

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

      // Chain all jobs on the serialized queue immediately. Transcripts run one-at-a-time
      // inside runTranscription, so no per-job setTimeout (that would delay job 1000 by
      // 1000 × rateLimitMs even though the network work is already serialized).
      for (const job of newJobs) {
        void runTranscription(job.id, job.videoId);
      }
    },
    [runTranscription],
  );

  const handleRetryJob = useCallback(
    (jobId: string) => {
      let videoId = "";
      setJobs((prev: TranscriptJob[]) => {
        const t = prev.find((j) => j.id === jobId);
        if (t) videoId = t.videoId;
        return prev.map((j: TranscriptJob) =>
          j.id === jobId
            ? {
                ...j,
                status: "processing" as const,
                progress: 0,
                errorMessage: undefined,
                failureReason: undefined,
              }
            : j,
        );
      });
      if (videoId) void runTranscription(jobId, videoId);
    },
    [runTranscription],
  );

  const handleReorder = useCallback((from: number, to: number) => {
    setJobs((prev: TranscriptJob[]) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }, []);

  const handleDeleteJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setSelectedJobId((prev) => (prev === jobId ? null : prev));
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;
  const completedJobs = jobs.filter((j) => j.status === "done");
  const hasPendingOrProcessing = jobs.some(
    (j) => j.status === "pending" || j.status === "processing",
  );
  const canBulkExport = completedJobs.length > 0 && !hasPendingOrProcessing;

  return (
    <div
      className="flex flex-col h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 transition-colors"
      style={siteFontStyle}
    >
      <StatsBar jobs={jobs} />

      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm flex-shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 min-w-0"
            aria-label="Home"
          >
            <BrandLogo size={30} className="text-gray-300 dark:text-zinc-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-sm font-semibold tracking-tight truncate block">
                Transcript studio
              </span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 truncate block sm:hidden">
                YouTube Transcript Tool
              </span>
            </div>
          </Link>
          <span className="hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {jobs.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear all jobs? This cannot be undone.")) {
                  setJobs([]);
                  setSelectedJobId(null);
                  try { localStorage.removeItem("yt_jobs"); } catch {}
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors"
              title="Clear all jobs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => completedCount > 0 && setSearchOpen(true)}
            disabled={completedCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Search transcripts (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[10px] font-mono opacity-50">⌘K</kbd>
          </button>
          <ThemeToggle />
          <Link
            href="/pricing"
            className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Pricing
          </Link>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      <InputBar onExtract={handleExtract} initialUrl={initialUrl} />

      <GlobalSearch
        jobs={jobs}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectJob={(id, seconds) => {
          setSelectedJobId(id);
          setScrollToSeconds(seconds);
        }}
      />

      <ExportToolbar
        exportFormat={exportFormat}
        onFormatChange={setExportFormat}
        selectedJob={selectedJob}
        completedJobs={completedJobs}
        totalJobs={jobs.length}
        canBulkExport={canBulkExport}
        includeTimestamps={settings.includeTimestamps}
      />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <aside className="flex flex-col w-[min(100%,340px)] min-w-[260px] sm:min-w-[280px] border-r border-gray-200 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-900/30">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 flex-shrink-0">
            <span className="text-[10px] sm:text-xs font-semibold tracking-wide text-gray-500 dark:text-zinc-400 uppercase">
              Job queue
            </span>
            <span className="text-xs font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
              {jobs.length}
            </span>
          </div>

          <JobQueue
            jobs={jobs}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            onRetryJob={handleRetryJob}
            onReorder={handleReorder}
            onDeleteJob={handleDeleteJob}
          />
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TranscriptPane
            job={selectedJob}
            exportFormat={exportFormat}
            includeTimestamps={settings.includeTimestamps}
            scrollToSeconds={scrollToSeconds}
            onScrollHandled={() => setScrollToSeconds(null)}
          />
        </div>
      </div>

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}
