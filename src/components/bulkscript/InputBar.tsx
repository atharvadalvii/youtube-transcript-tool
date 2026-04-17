"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { detectUrlType, normalizeYoutubeUrl } from "@/lib/youtube/url";
import type { UrlType, DetectedInfo, VideoListItem } from "@/types/bulkscript";
import { ArrowRight, Youtube, X, Video, List, Layers } from "lucide-react";

interface InputBarProps {
  onExtract: (
    urlType: UrlType,
    videos: VideoListItem[],
    url: string,
  ) => void;
  initialUrl?: string;
  variant?: "bar" | "hero";
}

export default function InputBar({
  onExtract,
  initialUrl = "",
  variant = "bar",
}: InputBarProps) {
  const [url, setUrl] = useState(initialUrl);
  const [urlType, setUrlType] = useState<UrlType>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<DetectedInfo | null>(null);
  const [videoList, setVideoList] = useState<VideoListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showVideoList, setShowVideoList] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState("");
  const detectTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // `?url=` is only for one-shot handoff (home → dashboard, sign-in redirect). If it
  // stays in the address bar, a full reload rehydrates with the same link, which
  // feels like unwanted persistence—strip it after the server already supplied
  // initialUrl for the first paint.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("url")) return;
    params.delete("url");
    const qs = params.toString();
    const path = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(null, "", qs ? `${path}?${qs}` : path);
  }, []);

  useEffect(() => {
    return () => clearTimeout(detectTimeout.current);
  }, []);

  useEffect(() => {
    if (!url.trim()) {
      setUrlType(null);
      setDetectedInfo(null);
      setVideoList([]);
      setResolveError(null);
      setResolvedUrl("");
      setShowVideoList(false);
      return;
    }

    clearTimeout(detectTimeout.current);
    detectTimeout.current = setTimeout(async () => {
      setIsDetecting(true);
      setResolveError(null);
      try {
        const res = await fetch("/api/youtube/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.trim() }),
        });
        const data = await res.json();
        if (!data.ok) {
          setUrlType(null);
          setDetectedInfo(null);
          setVideoList([]);
          setResolvedUrl("");
          setResolveError(
            typeof data.error === "string" ? data.error : "Could not resolve URL.",
          );
          return;
        }
        setUrlType(data.urlType as UrlType);
        setDetectedInfo(data.detected as DetectedInfo);
        setVideoList(data.videos as VideoListItem[]);
        setResolvedUrl(
          typeof data.normalizedUrl === "string" ? data.normalizedUrl : "",
        );
      } catch {
        setResolveError("Network error while resolving URL.");
        setUrlType(null);
        setDetectedInfo(null);
        setVideoList([]);
        setResolvedUrl("");
      } finally {
        setIsDetecting(false);
      }
    }, 500);
  }, [url]);

  function handleExtract() {
    if (!detectedInfo || !urlType) return;
    const sourceUrl = resolvedUrl || url.trim();
    if (urlType === "VIDEO") {
      const first = videoList[0];
      if (!first?.id) return;
      onExtract(urlType, [first], sourceUrl);
      setUrl("");
      setUrlType(null);
      setDetectedInfo(null);
      setVideoList([]);
      setResolveError(null);
      setResolvedUrl("");
    } else {
      setShowVideoList(true);
      const all = new Set(videoList.map((v) => v.id));
      setSelectedIds(all);
    }
  }

  function handleStartBulk() {
    const selected = videoList.filter((v) => selectedIds.has(v.id));
    if (selected.length === 0) return;
    onExtract(urlType, selected, resolvedUrl || url.trim());
    setUrl("");
    setUrlType(null);
    setDetectedInfo(null);
    setVideoList([]);
    setResolveError(null);
    setResolvedUrl("");
    setShowVideoList(false);
    setSelectedIds(new Set());
  }

  function toggleSelectAll() {
    if (selectedIds.size === videoList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(videoList.map((v) => v.id)));
    }
  }

  function toggleVideo(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  let hintType: UrlType = null;
  try {
    hintType = detectUrlType(normalizeYoutubeUrl(url.trim()));
  } catch {
    hintType = null;
  }
  const accentType = urlType ?? hintType;
  const borderAccent =
    accentType === "VIDEO"
      ? "border-emerald-500/60 dark:border-emerald-400/50"
      : accentType === "PLAYLIST"
        ? "border-sky-500/60 dark:border-sky-400/50"
        : accentType === "CHANNEL"
          ? "border-orange-500/60 dark:border-orange-400/50"
          : "border-gray-200 dark:border-zinc-700";

  const detectorItems = [
    { type: "VIDEO",    label: "Video",    icon: <Video className="w-3 h-3" />,   active: "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" },
    { type: "PLAYLIST", label: "Playlist", icon: <List className="w-3 h-3" />,    active: "text-sky-600 dark:text-sky-400 border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40" },
    { type: "CHANNEL",  label: "Channel",  icon: <Layers className="w-3 h-3" />,  active: "text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/40" },
  ] as const;

  return (
    <div className={variant === "bar" ? "border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" : ""}>
      {/* Type detector pills — read-only, light up on detection */}
      <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3">
        {detectorItems.map(({ type, label, icon, active }) => {
          const isActive = accentType === type;
          return (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all duration-200 ${
                isActive
                  ? active
                  : "text-gray-300 dark:text-zinc-600 border-gray-200 dark:border-zinc-800"
              }`}
            >
              {icon}
              {label}
            </span>
          );
        })}
        {isDetecting && (
          <div className="ml-1 w-3 h-3 border-2 border-gray-300 border-t-gray-600 dark:border-zinc-600 dark:border-t-zinc-300 rounded-full animate-spin" />
        )}
      </div>

      <div className="px-4 sm:px-6 py-3">
        <div className={`flex items-center gap-2 rounded-xl border bg-gray-50 dark:bg-zinc-900 px-3 sm:px-4 transition-colors ${borderAccent}`}>
          <Youtube className="w-5 h-5 text-gray-400 dark:text-zinc-500 shrink-0" />

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && detectedInfo && !isDetecting)
                handleExtract();
            }}
            placeholder="Paste a YouTube video, playlist, or channel URL…"
            className="flex-1 min-w-0 py-3 sm:py-3.5 text-sm bg-transparent outline-none text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          />

          {url && (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setUrlType(null);
                setDetectedInfo(null);
                setVideoList([]);
                setResolveError(null);
                setResolvedUrl("");
                setShowVideoList(false);
              }}
              className="shrink-0 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
              aria-label="Clear URL"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleExtract}
            disabled={!detectedInfo || isDetecting}
            className="shrink-0 my-1.5 px-4 sm:px-5 py-2 flex items-center gap-1.5 text-xs font-semibold rounded-lg bg-black text-white dark:bg-white dark:text-black disabled:opacity-35 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Extract
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {resolveError && !isDetecting && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 leading-relaxed">
            {resolveError}
          </p>
        )}

        {detectedInfo && !isDetecting && (
          <div className="mt-3 p-3 flex items-center gap-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/50">
            {detectedInfo.thumbnailUrl && (
              <img
                src={detectedInfo.thumbnailUrl}
                alt=""
                className="w-14 h-10 object-cover rounded-md border border-gray-200 dark:border-zinc-700"
              />
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">
                {detectedInfo.title}
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-gray-500 dark:text-zinc-400">
                {detectedInfo.channelName && (
                  <span>{detectedInfo.channelName}</span>
                )}
                {detectedInfo.videoCount != null && (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {detectedInfo.videoCount} videos
                  </span>
                )}
                {detectedInfo.description && (
                  <span className="tabular-nums">{detectedInfo.description}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showVideoList && videoList.length > 0 && (
        <div className="mx-4 sm:mx-6 mb-4 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-2.5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-zinc-200"
            >
              <span
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                  selectedIds.size === videoList.length
                    ? "bg-black dark:bg-white border-black dark:border-white"
                    : "border-gray-300 dark:border-zinc-600"
                }`}
              >
                {selectedIds.size === videoList.length && (
                  <span className="w-1.5 h-1.5 bg-white dark:bg-black rounded-sm" />
                )}
              </span>
              Select all ({videoList.length})
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-zinc-400">
                {selectedIds.size} selected
              </span>
              <button
                type="button"
                onClick={handleStartBulk}
                disabled={selectedIds.size === 0}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-black text-white dark:bg-white dark:text-black disabled:opacity-30"
              >
                Start extraction
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {videoList.map((video) => (
              <div
                key={video.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleVideo(video.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleVideo(video.id);
                  }
                }}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer border-b border-gray-100 dark:border-zinc-800 last:border-b-0 ${
                  selectedIds.has(video.id)
                    ? "bg-gray-50 dark:bg-zinc-900/80"
                    : "hover:bg-gray-50/50 dark:hover:bg-zinc-900/40"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                    selectedIds.has(video.id)
                      ? "bg-black dark:bg-white border-black dark:border-white"
                      : "border-gray-300 dark:border-zinc-600"
                  }`}
                >
                  {selectedIds.has(video.id) && (
                    <span className="w-1.5 h-1.5 bg-white dark:bg-black rounded-sm" />
                  )}
                </span>
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  className="w-12 h-8 object-cover rounded border border-gray-200 dark:border-zinc-700 flex-shrink-0"
                />
                <span className="text-sm flex-1 truncate text-gray-900 dark:text-zinc-100">
                  {video.title}
                </span>
                {video.duration && (
                  <span className="text-xs tabular-nums text-gray-400 dark:text-zinc-500 flex-shrink-0">
                    {video.duration}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
