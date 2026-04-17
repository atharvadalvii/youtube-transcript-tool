import type { UrlType } from "@/types/bulkscript";

const YT_HOSTS = new Set<string>([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);

/** Add https://, fix mobile/music hosts to www.youtube.com for parsing. */
export function normalizeYoutubeUrl(raw: string): string {
  let s = raw.trim().replace(/^["']|["']$/g, "");
  if (!s) throw new Error("Empty URL");
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }
  const u = new URL(s);
  const host = u.hostname.replace(/^www\./i, "").toLowerCase();
  if (!YT_HOSTS.has(host)) {
    throw new Error("Not a YouTube URL");
  }
  if (host === "youtu.be") {
    return u.toString();
  }
  u.hostname = "www.youtube.com";
  return u.toString();
}

function parseUrl(normalizedOrRaw: string): URL {
  try {
    return new URL(normalizeYoutubeUrl(normalizedOrRaw));
  } catch {
    return new URL(normalizedOrRaw);
  }
}

const ID11 = /^[\w-]{11}$/;

export function detectUrlType(url: string): UrlType {
  try {
    const u = parseUrl(url);
    const hostname = u.hostname.replace(/^www\./i, "").toLowerCase();

    if (hostname === "youtu.be") return "VIDEO";

    const path = u.pathname || "/";

    if (path.startsWith("/shorts/")) return "VIDEO";
    if (path.startsWith("/embed/")) return "VIDEO";
    if (path.startsWith("/live/")) return "VIDEO";

    const list = u.searchParams.get("list");
    if (list && path.startsWith("/watch")) return "PLAYLIST";
    if (path.startsWith("/playlist")) return "PLAYLIST";

    if (path.startsWith("/watch") && u.searchParams.get("v") && ID11.test(u.searchParams.get("v")!))
      return "VIDEO";

    if (
      path.startsWith("/channel/") ||
      path.startsWith("/@") ||
      path.startsWith("/c/") ||
      path.startsWith("/user/")
    )
      return "CHANNEL";

    return null;
  } catch {
    return null;
  }
}

export function extractVideoId(url: string): string | null {
  try {
    const u = parseUrl(url);
    const hostname = u.hostname.replace(/^www\./i, "").toLowerCase();

    if (hostname === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0]?.split("?")[0] ?? "";
      return ID11.test(id) ? id : null;
    }

    const v = u.searchParams.get("v");
    if (v && ID11.test(v)) return v;

    const shorts = u.pathname.match(/^\/shorts\/([\w-]{11})/);
    if (shorts?.[1] && ID11.test(shorts[1])) return shorts[1];

    const embed = u.pathname.match(/^\/embed\/([\w-]{11})/);
    if (embed?.[1] && ID11.test(embed[1])) return embed[1];

    const live = u.pathname.match(/^\/live\/([\w-]{11})/);
    if (live?.[1] && ID11.test(live[1])) return live[1];

    return null;
  } catch {
    return null;
  }
}

export function extractPlaylistId(url: string): string | null {
  try {
    const u = parseUrl(url);
    const list = u.searchParams.get("list");
    if (list && list.length > 0) return list;
    return null;
  } catch {
    return null;
  }
}

export function getYoutubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export type ChannelRef =
  | { kind: "uc"; channelId: string }
  | { kind: "handle"; handle: string }
  | { kind: "legacy"; query: string };

export function extractChannelRef(url: string): ChannelRef | null {
  try {
    const u = parseUrl(url);
    const path = u.pathname.replace(/\/$/, "") || "/";

    const ch = path.match(/^\/channel\/([\w-]+)/);
    if (ch?.[1]) return { kind: "uc", channelId: ch[1] };

    const at = path.match(/^\/@([^/]+)/);
    if (at?.[1]) return { kind: "handle", handle: at[1] };

    const c = path.match(/^\/c\/([^/]+)/);
    if (c?.[1]) return { kind: "legacy", query: decodeURIComponent(c[1]) };

    const user = path.match(/^\/user\/([^/]+)/);
    if (user?.[1]) return { kind: "legacy", query: decodeURIComponent(user[1]) };

    return null;
  } catch {
    return null;
  }
}
