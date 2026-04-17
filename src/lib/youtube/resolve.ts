import type { DetectedInfo, UrlType, VideoListItem } from "@/types/bulkscript";
import {
  detectUrlType,
  extractChannelRef,
  extractPlaylistId,
  extractVideoId,
  getYoutubeThumbnailUrl,
  normalizeYoutubeUrl,
} from "./url";
import { fetchVideoOEmbed } from "./oembed";
import {
  fetchPlaylistSnippet,
  fetchPlaylistVideos,
  fetchVideoSnippetById,
  hasYouTubeDataApiKey,
  resolveChannelUploadsPlaylistId,
} from "./data-api";

export type ResolveOk = {
  ok: true;
  urlType: UrlType;
  normalizedUrl: string;
  detected: DetectedInfo;
  videos: VideoListItem[];
};

export type ResolveErr = { ok: false; error: string };

export type ResolveResult = ResolveOk | ResolveErr;

const API_KEY_HINT =
  "Add YOUTUBE_API_KEY (YouTube Data API v3) to .env.local for playlists and channels.";

export async function resolveYoutubeInput(rawUrl: string): Promise<ResolveResult> {
  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeYoutubeUrl(rawUrl);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid URL",
    };
  }

  const urlType = detectUrlType(normalizedUrl);
  if (!urlType) {
    return {
      ok: false,
      error:
        "Unsupported YouTube link. Try a video, playlist, Short, or channel URL.",
    };
  }

  try {
    if (urlType === "VIDEO") {
      const vid = extractVideoId(normalizedUrl);
      if (!vid) {
        return { ok: false, error: "Could not read video ID from this link." };
      }
      const pageUrl = `https://www.youtube.com/watch?v=${vid}`;
      let o: { title: string; channelName: string; thumbnailUrl: string };
      try {
        o = await fetchVideoOEmbed(pageUrl);
      } catch (embedErr) {
        // oEmbed refuses many valid videos (embedding disabled, some age-gated, etc.).
        if (hasYouTubeDataApiKey()) {
          try {
            o = await fetchVideoSnippetById(vid);
          } catch {
            throw embedErr;
          }
        } else {
          throw embedErr;
        }
      }
      const videos: VideoListItem[] = [
        {
          id: vid,
          title: o.title,
          thumbnailUrl: o.thumbnailUrl || getYoutubeThumbnailUrl(vid),
          channelName: o.channelName,
        },
      ];
      return {
        ok: true,
        urlType,
        normalizedUrl,
        detected: {
          title: o.title,
          thumbnailUrl: o.thumbnailUrl,
          channelName: o.channelName,
        },
        videos,
      };
    }

    if (!hasYouTubeDataApiKey()) {
      return { ok: false, error: API_KEY_HINT };
    }

    if (urlType === "PLAYLIST") {
      const pl = extractPlaylistId(normalizedUrl);
      if (!pl) {
        return { ok: false, error: "Could not read playlist ID from this link." };
      }
      const videos = await fetchPlaylistVideos(pl);
      if (videos.length === 0) {
        return {
          ok: false,
          error: "Playlist is empty or not accessible with your API key.",
        };
      }
      let playlistTitle: string | null = null;
      try {
        playlistTitle = await fetchPlaylistSnippet(pl);
      } catch {
        /* use fallback title */
      }
      return {
        ok: true,
        urlType,
        normalizedUrl,
        detected: {
          title: playlistTitle || `Playlist · ${videos.length} videos`,
          videoCount: videos.length,
          channelName: videos[0]?.channelName,
        },
        videos,
      };
    }

    const chRef = extractChannelRef(normalizedUrl);
    if (!chRef) {
      return { ok: false, error: "Could not read channel from this link." };
    }
    const { uploadsPlaylistId, title, channelName } =
      await resolveChannelUploadsPlaylistId(chRef);
    const videos = await fetchPlaylistVideos(uploadsPlaylistId);
    if (videos.length === 0) {
      return {
        ok: false,
        error: "No public uploads found for this channel.",
      };
    }
    return {
      ok: true,
      urlType,
      normalizedUrl,
      detected: {
        title,
        videoCount: videos.length,
        channelName: channelName || title,
      },
      videos,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to resolve URL";
    if (msg === "MISSING_API_KEY") {
      return { ok: false, error: API_KEY_HINT };
    }
    return { ok: false, error: msg };
  }
}
