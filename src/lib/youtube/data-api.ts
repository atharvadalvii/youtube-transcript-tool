import { formatIsoDuration } from "./duration";
import type { VideoListItem } from "@/types/bulkscript";

const BASE = "https://www.googleapis.com/youtube/v3";

function key(): string {
  const k =
    process.env.YOUTUBE_API_KEY?.trim() ||
    process.env.YOUTUBE_DATA_API_KEY?.trim();
  if (!k) throw new Error("MISSING_API_KEY");
  return k;
}

async function ytGet(
  path: string,
  params: Record<string, string>,
): Promise<unknown> {
  const q = new URLSearchParams({ ...params, key: key() });
  const res = await fetch(`${BASE}/${path}?${q.toString()}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`YouTube API ${res.status}: ${err.slice(0, 200)}`);
  }
  return res.json();
}

export function hasYouTubeDataApiKey(): boolean {
  return !!(
    process.env.YOUTUBE_API_KEY?.trim() || process.env.YOUTUBE_DATA_API_KEY?.trim()
  );
}

/** Title/thumbnail for a single video — works when oEmbed fails (e.g. embedding disabled). */
export async function fetchVideoSnippetById(videoId: string): Promise<{
  title: string;
  channelName: string;
  thumbnailUrl: string;
}> {
  const data = (await ytGet("videos", {
    part: "snippet",
    id: videoId,
  })) as {
    items?: {
      snippet?: {
        title?: string;
        channelTitle?: string;
        thumbnails?: {
          medium?: { url?: string };
          high?: { url?: string };
          default?: { url?: string };
        };
      };
    }[];
  };
  const sn = data.items?.[0]?.snippet;
  if (!sn?.title) {
    throw new Error(
      "Video not found or not visible to the API (private, removed, or quota).",
    );
  }
  const thumb =
    sn.thumbnails?.medium?.url ||
    sn.thumbnails?.high?.url ||
    sn.thumbnails?.default?.url ||
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  return {
    title: sn.title,
    channelName: sn.channelTitle || "Unknown channel",
    thumbnailUrl: thumb,
  };
}

export async function fetchVideoDurations(
  videoIds: string[],
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const unique = Array.from(new Set(videoIds.filter(Boolean)));
  for (let i = 0; i < unique.length; i += 50) {
    const chunk = unique.slice(i, i + 50);
    const data = (await ytGet("videos", {
      part: "contentDetails",
      id: chunk.join(","),
    })) as {
      items?: { id: string; contentDetails?: { duration?: string } }[];
    };
    for (const it of data.items ?? []) {
      const d = formatIsoDuration(it.contentDetails?.duration);
      if (d) out.set(it.id, d);
    }
  }
  return out;
}

export async function fetchPlaylistSnippet(
  playlistId: string,
): Promise<string | null> {
  const data = (await ytGet("playlists", {
    part: "snippet",
    id: playlistId,
  })) as { items?: { snippet?: { title?: string } }[] };
  return data.items?.[0]?.snippet?.title ?? null;
}

/**
 * Walks the full playlist via playlistItems.nextPageToken (no artificial cap).
 * Large channel uploads (1000+ videos) are included until the API stops paging.
 */
export async function fetchPlaylistVideos(
  playlistId: string,
): Promise<VideoListItem[]> {
  const videos: VideoListItem[] = [];
  let pageToken: string | undefined;

  do {
    const data = (await ytGet("playlistItems", {
      part: "snippet,contentDetails",
      playlistId,
      maxResults: "50",
      ...(pageToken ? { pageToken } : {}),
    })) as {
      items?: {
        snippet?: {
          title?: string;
          channelTitle?: string;
          thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
        };
        contentDetails?: { videoId?: string };
      }[];
      nextPageToken?: string;
    };

    const batch: VideoListItem[] = [];
    const ids: string[] = [];
    for (const it of data.items ?? []) {
      const vid = it.contentDetails?.videoId;
      if (!vid) continue;
      ids.push(vid);
      const sn = it.snippet;
      batch.push({
        id: vid,
        title: sn?.title || vid,
        thumbnailUrl:
          sn?.thumbnails?.medium?.url ||
          sn?.thumbnails?.default?.url ||
          `https://img.youtube.com/vi/${vid}/mqdefault.jpg`,
        channelName: sn?.channelTitle,
      });
    }
    const durations = await fetchVideoDurations(ids);
    for (const v of batch) {
      const d = durations.get(v.id);
      if (d) v.duration = d;
    }
    videos.push(...batch);

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videos;
}

export async function resolveChannelUploadsPlaylistId(
  ref:
    | { kind: "uc"; channelId: string }
    | { kind: "handle"; handle: string }
    | { kind: "legacy"; query: string },
): Promise<{ uploadsPlaylistId: string; title: string; channelName: string }> {
  if (ref.kind === "uc") {
    const data = (await ytGet("channels", {
      part: "snippet,contentDetails",
      id: ref.channelId,
    })) as {
      items?: {
        id: string;
        snippet?: { title?: string };
        contentDetails?: {
          relatedPlaylists?: { uploads?: string };
        };
      }[];
    };
    const ch = data.items?.[0];
    const uploads = ch?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) throw new Error("Could not resolve channel uploads.");
    return {
      uploadsPlaylistId: uploads,
      title: ch?.snippet?.title || "Channel",
      channelName: ch?.snippet?.title || "",
    };
  }

  if (ref.kind === "handle") {
    const data = (await ytGet("channels", {
      part: "snippet,contentDetails",
      forHandle: ref.handle,
    })) as {
      items?: {
        snippet?: { title?: string };
        contentDetails?: { relatedPlaylists?: { uploads?: string } };
      }[];
    };
    const ch = data.items?.[0];
    const uploads = ch?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploads) throw new Error("Could not resolve @handle channel.");
    return {
      uploadsPlaylistId: uploads,
      title: ch?.snippet?.title || ref.handle,
      channelName: ch?.snippet?.title || ref.handle,
    };
  }

  const search = (await ytGet("search", {
    part: "snippet",
    type: "channel",
    q: ref.query,
    maxResults: "1",
  })) as {
    items?: { id?: { channelId?: string }; snippet?: { title?: string } }[];
  };
  const cid = search.items?.[0]?.id?.channelId;
  if (!cid) throw new Error("Channel not found for this URL.");
  return resolveChannelUploadsPlaylistId({ kind: "uc", channelId: cid });
}
