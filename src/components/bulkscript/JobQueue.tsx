"use client";

import { TranscriptJob, JobStatus } from "@/types/bulkscript";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  GripVertical,
} from "lucide-react";

interface JobQueueProps {
  jobs: TranscriptJob[];
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
  onRetryJob: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

export default function JobQueue({
  jobs,
  selectedJobId,
  onSelectJob,
  onRetryJob,
  onReorder,
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
    { icon: React.ReactNode; color: string; label: string }
  > = {
    pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      color: "#8A8D95",
      label: "PENDING",
    },
    processing: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      color: "#C8FF00",
      label: "PROCESSING",
    },
    done: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      color: "#00D4FF",
      label: "DONE",
    },
    failed: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      color: "#FF4444",
      label: "FAILED",
    },
  };

  if (jobs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          className="w-12 h-12 flex items-center justify-center mb-4"
          style={{ border: "1px solid #2A2D35" }}
        >
          <Clock className="w-5 h-5" style={{ color: "#3A3D45" }} />
        </div>
        <p
          className="text-xs tracking-widest uppercase text-center"
          style={{ color: "#3A3D45" }}
        >
          No jobs queued
        </p>
        <p className="text-xs mt-1 text-center" style={{ color: "#3A3D45" }}>
          Paste a YouTube URL above to start
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bs-scroll">
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
            onClick={() => job.status === "done" && onSelectJob(job.id)}
            className="group relative flex items-start gap-3 p-3 cursor-pointer transition-all animate-slide-in-up"
            style={{
              backgroundColor: isSelected ? "#1E2028" : "transparent",
              borderBottom: "1px solid #2A2D35",
              borderLeft: isSelected
                ? "2px solid #C8FF00"
                : "2px solid transparent",
            }}
          >
            {/* Drag handle */}
            <div
              className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing"
              style={{ color: "#8A8D95" }}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Thumbnail */}
            <div className="flex-shrink-0 relative">
              <img
                src={job.thumbnailUrl}
                alt=""
                className="w-16 h-11 object-cover"
                style={{ border: "1px solid #2A2D35" }}
              />
              {job.status === "processing" && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "#0F111780" }}
                >
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    style={{ color: "#C8FF00" }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium leading-snug truncate mb-1"
                style={{ color: isSelected ? "#F0EDE6" : "#C4C1BA" }}
              >
                {job.title}
              </p>
              <p
                className="text-xs truncate mb-1.5"
                style={{ color: "#8A8D95" }}
              >
                {job.channelName}
              </p>

              {/* Status + Progress */}
              <div className="flex items-center gap-2">
                <span
                  className="flex items-center gap-1 text-xs tracking-wider"
                  style={{ color: cfg.color }}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
                {job.status === "done" && job.wordCount > 0 && (
                  <span
                    className="text-xs font-mono-jet"
                    style={{ color: "#8A8D95" }}
                  >
                    {job.wordCount.toLocaleString()} words
                  </span>
                )}
                {job.status === "failed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetryJob(job.id);
                    }}
                    className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                    style={{ color: "#FF4444" }}
                  >
                    <RefreshCw className="w-3 h-3" />
                    RETRY
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {(job.status === "processing" || job.status === "done") && (
                <div
                  className="mt-2 h-0.5 w-full"
                  style={{ backgroundColor: "#2A2D35" }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${job.progress}%`,
                      backgroundColor:
                        job.status === "done" ? "#00D4FF" : "#C8FF00",
                    }}
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
