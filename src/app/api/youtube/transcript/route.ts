import { NextResponse } from "next/server";
import { classifyTranscriptError } from "@/lib/youtube/transcript-errors";
import { formatTimestamp } from "@/utils/bulkscript";
import { rateLimit, getIp } from "@/lib/rate-limit";
import type { TranscriptSegment } from "@/types/bulkscript";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function incrementUsage() {
  const month = new Date().toISOString().slice(0, 7);
  try {
    await supabase.rpc("increment_api_usage", { p_month: month });
  } catch {}
}

export const runtime = "nodejs";
export const maxDuration = 60;

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
}

function parseTranscriptXml(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];

  const newRe = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  let m: RegExpExecArray | null;
  while ((m = newRe.exec(xml)) !== null) {
    const startSeconds = parseInt(m[1], 10) / 1000;
    let text = m[3];
    const sRe = /<s[^>]*>([^<]*)<\/s>/g;
    const sParts: string[] = [];
    let sm: RegExpExecArray | null;
    while ((sm = sRe.exec(text)) !== null) sParts.push(sm[1]);
    text = sParts.length > 0 ? sParts.join("") : text.replace(/<[^>]+>/g, "");
    text = decodeXmlEntities(text).trim();
    if (text) segments.push({ timestamp: formatTimestamp(startSeconds), startSeconds, text });
  }
  if (segments.length > 0) return segments;

  const legacyRe = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
  while ((m = legacyRe.exec(xml)) !== null) {
    const startSeconds = parseFloat(m[1]);
    const text = decodeXmlEntities(m[3]).trim();
    if (text) segments.push({ timestamp: formatTimestamp(startSeconds), startSeconds, text });
  }
  return segments;
}

const INNERTUBE_VERSION = "20.10.38";
const ANDROID_UA = `com.google.android.youtube/${INNERTUBE_VERSION} (Linux; U; Android 14)`;

// YouTube blocks datacenter IPs (Vercel, Cloudflare Workers included) with a
// "Sign in to confirm you're not a bot" response. ScraperAPI routes through
// residential proxies, which is the one path that's actually worked in production.
async function scraperApiFetch(url: string, init: RequestInit, key: string): Promise<Response> {
  const proxied = `http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(url)}`;
  return fetch(proxied, init);
}

async function fetchTranscriptViaInnerTube(
  videoId: string,
  lang: string | undefined,
  fetcher: (url: string, init: RequestInit) => Promise<Response>,
): Promise<TranscriptSegment[]> {
  const playerRes = await fetcher(
    "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": ANDROID_UA },
      body: JSON.stringify({
        context: { client: { clientName: "ANDROID", clientVersion: INNERTUBE_VERSION } },
        videoId,
      }),
    },
  );
  if (!playerRes.ok) {
    throw new Error(`YouTube is receiving too many requests from this IP and now requires solving a captcha to continue`);
  }
  const playerData = await playerRes.json();
  if (playerData?.playabilityStatus?.status === "LOGIN_REQUIRED") {
    throw new Error(`YouTube is receiving too many requests from this IP and now requires solving a captcha to continue`);
  }
  const tracks: Array<{ languageCode: string; baseUrl: string }> =
    playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  if (tracks.length === 0) throw new Error(`No transcripts are available for this video (${videoId})`);
  const track = (lang ? tracks.find(t => t.languageCode === lang) : null) ?? tracks[0];
  if (lang && !tracks.find(t => t.languageCode === lang)) {
    throw new Error(`No transcripts are available in ${lang} this video (${videoId}). Available languages: ${tracks.map(t => t.languageCode).join(", ")}`);
  }
  const xmlRes = await fetcher(track.baseUrl, { headers: { "User-Agent": ANDROID_UA } });
  if (!xmlRes.ok) throw new Error(`Could not load captions for this video.`);
  return parseTranscriptXml(await xmlRes.text());
}

async function fetchTranscript(videoId: string, lang?: string): Promise<TranscriptSegment[]> {
  const scraperKey = process.env.SCRAPERAPI_KEY;
  const workerUrl = process.env.CF_TRANSCRIPT_WORKER_URL;

  if (scraperKey) {
    try {
      return await fetchTranscriptViaInnerTube(
        videoId,
        lang,
        (url, init) => scraperApiFetch(url, init, scraperKey),
      );
    } catch (err) {
      console.warn("[transcript] ScraperAPI path failed, falling back:", err instanceof Error ? err.message : err);
    }
  }

  if (workerUrl) {
    const res = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CF_WORKER_SECRET
          ? { Authorization: `Bearer ${process.env.CF_WORKER_SECRET}` }
          : {}),
      },
      body: JSON.stringify({ videoId, lang }),
    });
    const data = (await res.json()) as { ok: boolean; xml?: string; error?: string };
    if (data.ok && data.xml) return parseTranscriptXml(data.xml);
    console.warn("[transcript] Worker path failed, falling back:", data.error);
  }

  // Direct InnerTube fallback (works locally; blocked on Vercel/Cloudflare by YouTube IP restrictions)
  return fetchTranscriptViaInnerTube(videoId, lang, fetch);
}

export async function POST(req: Request) {
  const { allowed, retryAfterMs } = rateLimit(`transcript:${getIp(req)}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a moment.", reason: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }
  try {
    const body = (await req.json()) as { videoId?: string; lang?: string };
    const videoId = typeof body.videoId === "string" ? body.videoId.trim() : "";
    const lang =
      typeof body.lang === "string" && body.lang.trim() ? body.lang.trim() : undefined;
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
      return NextResponse.json({ ok: false, error: "Invalid videoId" }, { status: 400 });
    }

    const langKey = lang ?? "en";

    const { data: cached } = await supabase
      .from("transcripts")
      .select("segments")
      .eq("video_id", videoId)
      .eq("lang", langKey)
      .single();

    if (cached) return NextResponse.json({ ok: true, segments: cached.segments });

    const segments = await fetchTranscript(videoId, lang);

    supabase
      .from("transcripts")
      .upsert({ video_id: videoId, lang: langKey, segments, fetched_at: new Date().toISOString() })
      .then(() => {}, () => {});

    incrementUsage();
    return NextResponse.json({ ok: true, segments });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Could not load captions for this video.";
    const { reason, userMessage } = classifyTranscriptError(msg);
    return NextResponse.json({ ok: false, error: userMessage, reason });
  }
}
