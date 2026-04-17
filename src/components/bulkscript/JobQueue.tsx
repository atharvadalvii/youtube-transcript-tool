"use client";

import { TranscriptJob, JobStatus } from "@/types/bulkscript";
import { failureQueueLabel } from "@/lib/youtube/transcript-errors";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  GripVertical,
  X,
} from "lucide-react";

interface JobQueueProps {
  jobs: TranscriptJob[];
  selectedJobId: string | null;
  onSelectJob: (id: string | null) => void;
  onRetryJob: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onDeleteJob: (id: string) => void;
}

export default function JobQueue({
  jobs,
  selectedJobId,
  onSelectJob,
  onRetryJob,
  onReorder,
  onDeleteJob,
}: JobQueueProps) {
  const dragRef = { current: -1 };

  function handleDragStart(idx: number, e: React.DragEvent) {
    dragRef.current = idx;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(idx: number, e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(idx: number) {
    if (dragRef.current !== -1 && dragRef.current !== idx) {
      onReorder(dragRef.current, idx);
      dragRef.current = -1;
    }
  }

  const statusConfig: Record<
    JobStatus,
    { icon: React.ReactNode; className: string; label: string }
  > = {
    pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      className: "text-gray-400 dark:text-zinc-500",
      label: "Pending",
    },
    processing: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      className: "text-emerald-600 dark:text-emerald-400",
      label: "Processing",
    },
    done: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      className: "text-sky-600 dark:text-sky-400",
      label: "Done",
    },
    failed: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      className: "text-red-600 dark:text-red-400",
      label: "Failed",
    },
  };

  if (jobs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 flex items-center justify-center mb-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-dashed border-gray-200 dark:border-zinc-700">
          <Clock className="w-5 h-5 text-gray-300 dark:text-zinc-600" />
        </div>
        <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500">
          Queue is empty
        </p>
        <p className="text-xs mt-1.5 text-gray-400 dark:text-zinc-600 max-w-[180px] leading-relaxed">
          Paste a video, playlist, or channel URL above
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {jobs.map((job, idx) => {
        const cfg = statusConfig[job.status];
        const isSelected = job.id === selectedJobId;

        return (
          <div
            key={job.id}
            draggable
            onDragStart={(e) => handleDragStart(idx, e)}
            onDragOver={(e) => handleDragOver(idx, e)}
            onDrop={() => handleDrop(idx)}
            onClick={() => {
              if (job.status === "done" || job.status === "failed") {
                onSelectJob(isSelected ? null : job.id);
              }
            }}
            className={`group relative flex items-start gap-3 p-3 transition-colors border-b border-gray-100 dark:border-zinc-800 ${
              job.status === "done" || job.status === "failed"
                ? "cursor-pointer"
                : "cursor-default"
            } ${
              isSelected
                ? "bg-white dark:bg-zinc-900 border-l-2 border-l-gray-900 dark:border-l-zinc-100 pl-[10px]"
                : "border-l-2 border-l-transparent hover:bg-white/60 dark:hover:bg-zinc-900/40"
            }`}
          >
            <div className="flex-shrink-0 flex flex-col items-center gap-1 mt-1">
              <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing text-gray-400">
                <GripVertical className="w-3.5 h-3.5" />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteJob(job.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Remove from queue"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-shrink-0 relative">
              <img
                src={job.thumbnailUrl}
                alt=""
                className="w-16 h-11 object-cover rounded-md border border-gray-200 dark:border-zinc-700"
              />
              {job.status === "processing" && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium leading-snug truncate mb-1 ${
                  isSelected
                    ? "text-gray-900 dark:text-zinc-50"
                    : "text-gray-700 dark:text-zinc-300"
                }`}
              >
                {job.title}
              </p>
              <p className="text-xs truncate mb-1.5 text-gray-500 dark:text-zinc-400">
                {job.channelName}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`flex items-center gap-1 text-[10px] font-semibold tracking-wide ${cfg.className}`}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
                {job.status === "done" && job.wordCount > 0 && (
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 tabular-nums">
                    {job.wordCount.toLocaleString()} words
                  </span>
                )}
                {job.status === "failed" && (
                  <>
                    <span
                      className="text-[10px] font-medium text-amber-700 dark:text-amber-400/90 max-w-[140px] truncate"
                      title={job.errorMessage}
                    >
                      {failureQueueLabel(job.failureReason ?? "unknown")}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetryJob(job.id);
                      }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </button>
                  </>
                )}
              </div>

              {job.status === "failed" && job.errorMessage && (
                <p className="mt-1.5 text-[10px] leading-snug text-gray-500 dark:text-zinc-500 line-clamp-2">
                  {job.errorMessage}
                </p>
              )}

              {job.status === "processing" && (
                <div className="mt-2 h-0.5 w-full rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full bg-emerald-500 dark:bg-emerald-400"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
