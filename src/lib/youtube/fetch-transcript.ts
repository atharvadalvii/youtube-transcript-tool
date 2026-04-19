interface TranscriptLine {
  text: string;
  offset: number;
  duration: number;
}

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  kind?: string;
}

const WATCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

function proxyUrl(target: string): string {
  const key = process.env.SCRAPERAPI_KEY;
  console.log("[transcript] SCRAPERAPI_KEY set:", !!key, "target:", target.slice(0, 60));
  if (!key) return target;
  return `http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(target)}`;
}

// Extracts a top-level JSON object assigned to `varName` in a script block.
// Uses bracket balancing so nested objects are handled correctly.
function extractJsonVar(html: string, varName: string): unknown | null {
  const needle = `"${varName}"`;
  let idx = html.indexOf(needle);
  // Also try without quotes (var assignment)
  if (idx === -1) idx = html.indexOf(`${varName} =`);
  if (idx === -1) idx = html.indexOf(`${varName}=`);
  if (idx === -1) return null;

  const start = html.indexOf("{", idx);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\" && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

async function getTimedTextTracks(videoId: string): Promise<CaptionTrack[]> {
  const listUrl = proxyUrl(`https://www.youtube.com/api/timedtext?v=${videoId}&type=list`);
  const res = await fetch(listUrl, {
    headers: {
      "User-Agent": WATCH_HEADERS["User-Agent"],
      Referer: "https://www.youtube.com/",
    },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const tracks: CaptionTrack[] = [];
  const re = /<track[^>]+id="(\d+)"[^>]+name="([^"]*)"[^>]+lang_code="([^"]+)"[^>]*\/?>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const id = m[1];
    const name = m[2];
    const lang = m[3];
    tracks.push({
      baseUrl: `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${lang}&name=${encodeURIComponent(name)}&fmt=json3`,
      languageCode: lang,
      kind: name === "" ? "asr" : "manual",
    });
  }
  console.log("[transcript] timedtext tracks:", tracks.map(t => t.languageCode));
  return tracks;
}

async function getPlayerResponseFromPage(videoId: string): Promise<unknown> {
  const url = proxyUrl(`https://www.youtube.com/watch?v=${videoId}&hl=en`);
  console.log("[transcript] fetching watch page via proxy:", url.slice(0, 80));
  const res = await fetch(url, { headers: WATCH_HEADERS });
  console.log("[transcript] watch page status:", res.status);
  if (!res.ok) throw new Error(`YouTube watch page returned ${res.status}`);
  const html = await res.text();
  console.log("[transcript] html length:", html.length, "snippet:", html.slice(0, 120));

  const player = extractJsonVar(html, "ytInitialPlayerResponse");
  console.log("[transcript] player found:", !!player);
  if (!player) {
    throw new Error("Could not parse YouTube player data.");
  }
  return player;
}

function extractCaptionTracks(playerResponse: unknown): CaptionTrack[] {
  try {
    // @ts-ignore
    const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks)) return [];
    return tracks as CaptionTrack[];
  } catch {
    return [];
  }
}

function pickTrack(tracks: CaptionTrack[], lang?: string): CaptionTrack | undefined {
  if (!lang) {
    return (
      tracks.find((t) => t.languageCode.startsWith("en") && t.kind !== "asr") ??
      tracks.find((t) => t.kind !== "asr") ??
      tracks[0]
    );
  }
  const lower = lang.toLowerCase();
  return (
    tracks.find((t) => t.languageCode.toLowerCase() === lower) ??
    tracks.find((t) => t.languageCode.toLowerCase().startsWith(lower.slice(0, 2)))
  );
}

async function fetchCaptionXml(baseUrl: string): Promise<string> {
  const res = await fetch(proxyUrl(baseUrl), {
    headers: {
      "User-Agent": WATCH_HEADERS["User-Agent"],
      Referer: "https://www.youtube.com/",
    },
  });
  if (!res.ok) throw new Error(`Caption fetch returned ${res.status}`);
  return res.text();
}

function parseCaptionXml(xml: string): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  const re = /<text start="([^"]+)" dur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const offset = parseFloat(m[1]) * 1000;
    const duration = parseFloat(m[2]) * 1000;
    const text = m[3]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (text) lines.push({ text, offset, duration });
  }
  return lines;
}

async function fetchJson3(url: string): Promise<TranscriptLine[]> {
  const res = await fetch(proxyUrl(url), {
    headers: { "User-Agent": WATCH_HEADERS["User-Agent"], Referer: "https://www.youtube.com/" },
  });
  if (!res.ok) throw new Error(`Caption fetch returned ${res.status}`);
  const data = await res.json() as { events?: Array<{ tStartMs?: number; dDurationMs?: number; segs?: Array<{ utf8?: string }> }> };
  const lines: TranscriptLine[] = [];
  for (const event of data.events ?? []) {
    if (!event.segs) continue;
    const text = event.segs.map(s => s.utf8 ?? "").join("").trim();
    if (!text || text === "\n") continue;
    lines.push({ text, offset: event.tStartMs ?? 0, duration: event.dDurationMs ?? 0 });
  }
  return lines;
}

export async function fetchTranscriptCustom(
  videoId: string,
  lang?: string
): Promise<TranscriptLine[]> {
  // Try the older /api/timedtext endpoint first — less bot-detection
  const timedTracks = await getTimedTextTracks(videoId);
  if (timedTracks.length > 0) {
    const track = pickTrack(timedTracks, lang);
    if (track) {
      const lines = await fetchJson3(track.baseUrl);
      if (lines.length > 0) return lines;
    }
  }

  // Fall back to watch page parsing
  const player = await getPlayerResponseFromPage(videoId);
  const tracks = extractCaptionTracks(player);

  if (tracks.length === 0) {
    // @ts-ignore
    const status = player?.playabilityStatus?.status;
    // @ts-ignore
    const reason = player?.playabilityStatus?.reason;
    console.error("[transcript] no tracks. playabilityStatus:", status, reason);
    throw new Error("No transcripts are available for this video.");
  }

  const track = pickTrack(tracks, lang);
  if (!track) {
    throw new Error(`No transcripts are available in ${lang} for this video.`);
  }

  const xml = await fetchCaptionXml(track.baseUrl);
  const lines = parseCaptionXml(xml);

  if (lines.length === 0) throw new Error("Could not load captions for this video.");
  return lines;
}
