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


async function getPlayerResponse(videoId: string): Promise<unknown> {
  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "X-YouTube-Client-Name": "1",
        "X-YouTube-Client-Version": "2.20240101.00.00",
        Origin: "https://www.youtube.com",
        Referer: "https://www.youtube.com/",
      },
      body: JSON.stringify({
        videoId,
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.00.00",
            hl: "en",
            gl: "US",
          },
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`InnerTube returned ${res.status}`);
  const data = await res.json();
  console.log("[transcript] player keys:", Object.keys(data));
  console.log("[transcript] captions present:", !!data?.captions);
  if (data?.captions) {
    console.log("[transcript] captions keys:", Object.keys(data.captions));
  }
  return data;
}

function extractCaptionTracks(playerResponse: unknown): CaptionTrack[] {
  try {
    const tracks =
      (playerResponse as Record<string, unknown>)?.captions
        // @ts-ignore
        ?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(tracks)) return [];
    return tracks as CaptionTrack[];
  } catch {
    return [];
  }
}

function pickTrack(
  tracks: CaptionTrack[],
  lang?: string
): CaptionTrack | undefined {
  if (!lang) {
    // prefer manual (non-asr) english, then any manual, then first
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
  const res = await fetch(baseUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
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
    const offset = parseFloat(m[1]) * 1000; // convert to ms for consistency
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

export async function fetchTranscriptCustom(
  videoId: string,
  lang?: string
): Promise<TranscriptLine[]> {
  const player = await getPlayerResponse(videoId);
  const tracks = extractCaptionTracks(player);

  if (tracks.length === 0) {
    // Log the player response shape to help debug
    const keys = Object.keys(player as object);
    console.error("[transcript] no caption tracks. player keys:", keys);
    throw new Error("No transcripts are available for this video.");
  }

  const track = pickTrack(tracks, lang);
  if (!track) {
    throw new Error(
      `No transcripts are available in ${lang} for this video.`
    );
  }

  const xml = await fetchCaptionXml(track.baseUrl);
  const lines = parseCaptionXml(xml);

  if (lines.length === 0) {
    throw new Error("Could not load captions for this video.");
  }

  return lines;
}
