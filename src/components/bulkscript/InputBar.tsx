"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  detectUrlType,
  extractVideoId,
  getThumbnailUrl,
  generateMockVideoList,
} from "@/utils/bulkscript";
import { UrlType, DetectedInfo, VideoListItem } from "@/types/bulkscript";
import {
  Search,
  ArrowRight,
  Youtube,
  List,
  Layers,
  Video,
  X,
} from "lucide-react";

interface InputBarProps {
  onExtract: (
    urlType: UrlType,
    videos: VideoListItem[],
    url: string
  ) => void;
}

export default function InputBar({ onExtract }: InputBarProps) {
  const [url, setUrl] = useState("");
  const [urlType, setUrlType] = useState<UrlType>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<DetectedInfo | null>(null);
  const [videoList, setVideoList] = useState<VideoListItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showVideoList, setShowVideoList] = useState(false);
  const [activeTab, setActiveTab] = useState<"VIDEO" | "PLAYLIST" | "CHANNEL">(
    "VIDEO"
  );
  const detectTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => clearTimeout(detectTimeout.current);
  }, []);

  useEffect(() => {
    if (!url.trim()) {
      setUrlType(null);
      setDetectedInfo(null);
      setShowVideoList(false);
      return;
    }

    clearTimeout(detectTimeout.current);
    detectTimeout.current = setTimeout(async () => {
      setIsDetecting(true);
      const type = detectUrlType(url);
      setUrlType(type);

      if (type) {
        // Simulate API detection
        await new Promise((r) => setTimeout(r, 600));
        if (type === "VIDEO") {
          const vid = extractVideoId(url);
          setDetectedInfo({
            title: "The Complete Guide to Modern Web Development",
            thumbnailUrl: vid ? getThumbnailUrl(vid) : undefined,
            channelName: "TechMaster Pro",
            description: "45:23",
          });
          setVideoList([]);
        } else if (type === "PLAYLIST") {
          const vids = generateMockVideoList(8, "Web Dev Series");
          setDetectedInfo({
            title: "Full Stack Web Development Masterclass",
            videoCount: 8,
            channelName: "TechMaster Pro",
          });
          setVideoList(vids);
        } else if (type === "CHANNEL") {
          const vids = generateMockVideoList(15, "TechMaster Pro");
          setDetectedInfo({
            title: "TechMaster Pro",
            videoCount: 127,
            channelName: "TechMaster Pro",
          });
          setVideoList(vids);
        }
      }
      setIsDetecting(false);
    }, 500);
  }, [url]);

  function handleTabChange(tab: "VIDEO" | "PLAYLIST" | "CHANNEL") {
    setActiveTab(tab);
    setUrl("");
    setUrlType(null);
    setDetectedInfo(null);
    setShowVideoList(false);
  }

  function handleExtract() {
    if (!detectedInfo || !urlType) return;
    if (urlType === "VIDEO") {
      const videoId = extractVideoId(url);
      const vid: VideoListItem = {
        id: videoId || `vid_${Date.now()}`,
        title: detectedInfo.title,
        thumbnailUrl: detectedInfo.thumbnailUrl || "",
        channelName: detectedInfo.channelName,
        duration: detectedInfo.description,
      };
      onExtract(urlType, [vid], url);
      setUrl("");
      setUrlType(null);
      setDetectedInfo(null);
    } else {
      setShowVideoList(true);
      const all = new Set(videoList.map((v) => v.id));
      setSelectedIds(all);
    }
  }

  function handleStartBulk() {
    const selected = videoList.filter((v) => selectedIds.has(v.id));
    if (selected.length === 0) return;
    onExtract(urlType, selected, url);
    setUrl("");
    setUrlType(null);
    setDetectedInfo(null);
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

  const tabHints: Record<string, string> = {
    VIDEO: "https://youtube.com/watch?v=...",
    PLAYLIST: "https://youtube.com/playlist?list=...",
    CHANNEL: "https://youtube.com/@channelname",
  };

  const typeColors: Record<string, string> = {
    VIDEO: "#C8FF00",
    PLAYLIST: "#00D4FF",
    CHANNEL: "#FF6B35",
  };

  return (
    <div
      className="border-b font-space"
      style={{ backgroundColor: "#0F1117", borderColor: "#2A2D35" }}
    >
      {/* Source Type Tabs */}
      <div
        className="flex items-center gap-0 px-6 pt-5"
      >
        {(["VIDEO", "PLAYLIST", "CHANNEL"] as const).map((tab) => {
          const icons = { VIDEO: Video, PLAYLIST: List, CHANNEL: Layers };
          const Icon = icons[tab];
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="flex items-center gap-2 px-4 py-1.5 mr-1 text-xs tracking-widest transition-all"
              style={{
                backgroundColor: isActive ? "#C8FF00" : "transparent",
                color: isActive ? "#0F1117" : "#8A8D95",
                fontWeight: isActive ? 700 : 400,
                border: `1px solid ${isActive ? "#C8FF00" : "#2A2D35"}`,
              }}
            >
              <Icon className="w-3 h-3" />
              {tab}
            </button>
          );
        })}
      </div>

      {/* Input Field */}
      <div className="px-6 py-4">
        <div className="relative flex items-center">
          <div
            className="absolute left-4 flex items-center gap-2"
            style={{ color: "#8A8D95" }}
          >
            <Youtube className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && detectedInfo && !isDetecting)
                handleExtract();
            }}
            placeholder={tabHints[activeTab]}
            className="w-full pl-12 pr-40 py-4 text-base outline-none font-mono-jet transition-all"
            style={{
              backgroundColor: "#1A1D24",
              border: `1px solid ${urlType ? typeColors[urlType] : "#2A2D35"}`,
              color: "#F0EDE6",
              fontSize: "14px",
            }}
          />

          {/* URL Type Badge */}
          {urlType && !isDetecting && (
            <div
              className="absolute right-32 px-3 py-1 text-xs font-bold tracking-widest"
              style={{
                backgroundColor: `${typeColors[urlType]}20`,
                color: typeColors[urlType],
                border: `1px solid ${typeColors[urlType]}`,
              }}
            >
              {urlType}
            </div>
          )}
          {isDetecting && (
            <div className="absolute right-32 flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#C8FF00", borderTopColor: "transparent" }}
              />
            </div>
          )}

          {/* Clear + Extract */}
          {url && (
            <button
              onClick={() => {
                setUrl("");
                setUrlType(null);
                setDetectedInfo(null);
                setShowVideoList(false);
              }}
              className="absolute right-24 p-1 transition-opacity opacity-50 hover:opacity-100"
              style={{ color: "#8A8D95" }}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleExtract}
            disabled={!detectedInfo || isDetecting}
            className="absolute right-0 h-full px-6 flex items-center gap-2 text-sm font-bold tracking-wider transition-all disabled:opacity-30"
            style={{
              backgroundColor: detectedInfo && !isDetecting ? "#C8FF00" : "#2A2D35",
              color: detectedInfo && !isDetecting ? "#0F1117" : "#8A8D95",
            }}
          >
            EXTRACT
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Detected Info Preview */}
        {detectedInfo && !isDetecting && (
          <div
            className="mt-3 p-3 flex items-center gap-3 animate-slide-in-up"
            style={{
              backgroundColor: "#1A1D24",
              border: "1px solid #2A2D35",
            }}
          >
            {detectedInfo.thumbnailUrl && (
              <img
                src={detectedInfo.thumbnailUrl}
                alt=""
                className="w-14 h-10 object-cover"
                style={{ border: "1px solid #2A2D35" }}
              />
            )}
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: "#F0EDE6" }}
              >
                {detectedInfo.title}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {detectedInfo.channelName && (
                  <span className="text-xs" style={{ color: "#8A8D95" }}>
                    {detectedInfo.channelName}
                  </span>
                )}
                {detectedInfo.videoCount && (
                  <span
                    className="text-xs font-mono-jet"
                    style={{ color: "#C8FF00" }}
                  >
                    {detectedInfo.videoCount} videos
                  </span>
                )}
                {detectedInfo.description && (
                  <span className="text-xs font-mono-jet" style={{ color: "#8A8D95" }}>
                    {detectedInfo.description}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Selection List */}
      {showVideoList && videoList.length > 0 && (
        <div
          className="mx-6 mb-4 animate-fade-in"
          style={{ border: "1px solid #2A2D35" }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: "#2A2D35", backgroundColor: "#1A1D24" }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-xs tracking-wider"
                style={{ color: "#C8FF00" }}
              >
                <div
                  className="w-3.5 h-3.5 flex items-center justify-center"
                  style={{
                    border: `1px solid #C8FF00`,
                    backgroundColor:
                      selectedIds.size === videoList.length
                        ? "#C8FF00"
                        : "transparent",
                  }}
                >
                  {selectedIds.size === videoList.length && (
                    <div className="w-2 h-2" style={{ backgroundColor: "#0F1117" }} />
                  )}
                </div>
                SELECT ALL ({videoList.length})
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "#8A8D95" }}>
                {selectedIds.size} selected
              </span>
              <button
                onClick={handleStartBulk}
                disabled={selectedIds.size === 0}
                className="px-4 py-1.5 text-xs font-bold tracking-wider disabled:opacity-30 transition-all"
                style={{
                  backgroundColor: "#C8FF00",
                  color: "#0F1117",
                }}
              >
                START EXTRACTION →
              </button>
            </div>
          </div>
          <div
            className="max-h-48 overflow-y-auto bs-scroll"
            style={{ backgroundColor: "#0F1117" }}
          >
            {videoList.map((video) => (
              <div
                key={video.id}
                onClick={() => toggleVideo(video.id)}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors"
                style={{
                  borderBottom: "1px solid #2A2D35",
                  backgroundColor: selectedIds.has(video.id)
                    ? "#1A1D2480"
                    : "transparent",
                }}
              >
                <div
                  className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center"
                  style={{
                    border: `1px solid ${selectedIds.has(video.id) ? "#C8FF00" : "#3A3D45"}`,
                    backgroundColor: selectedIds.has(video.id)
                      ? "#C8FF00"
                      : "transparent",
                  }}
                >
                  {selectedIds.has(video.id) && (
                    <div
                      className="w-2 h-2"
                      style={{ backgroundColor: "#0F1117" }}
                    />
                  )}
                </div>
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  className="w-12 h-8 object-cover flex-shrink-0"
                />
                <span className="text-sm flex-1 truncate" style={{ color: "#F0EDE6" }}>
                  {video.title}
                </span>
                {video.duration && (
                  <span
                    className="text-xs font-mono-jet flex-shrink-0"
                    style={{ color: "#8A8D95" }}
                  >
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
