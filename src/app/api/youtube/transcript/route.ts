import { NextResponse } from "next/server";
import { fetchTranscript } from "youtube-transcript";
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
  await supabase.rpc("increment_api_usage", { p_month: month }).then(() => {}).catch(() => {});
}

export const runtime = "nodejs";
export const maxDuration = 60;

function withScraperProxy<T>(fn: () => Promise<T>): Promise<T> {
  const key = process.env.SCRAPERAPI_KEY;
  if (!key) return fn();

  const original = globalThis.fetch;
  // @ts-ignore
  globalThis.fetch = (url: RequestInfo | URL, init?: RequestInit) => {
    const urlStr = url.toString();
    if (urlStr.includes("youtube.com") || urlStr.includes("googlevideo.com")) {
      const proxied = `http://api.scraperapi.com?api_key=${key}&url=${encodeURIComponent(urlStr)}&autoparse=false`;
      console.log("[transcript] proxying:", urlStr.slice(0, 80));
      return original(proxied, init);
    }
    return original(url, init);
  };

  return fn().finally(() => {
    globalThis.fetch = original;
  });
}

export async function POST(req: Request) {
  const { allowed, retryAfterMs } = rateLimit(
    `transcript:${getIp(req)}`,
    60,
    60_000,
  );
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
      typeof body.lang === "string" && body.lang.trim()
        ? body.lang.trim()
        : undefined;
    if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid videoId" },
        { status: 400 },
      );
    }

    let raw;
    try {
      raw = await withScraperProxy(() =>
        fetchTranscript(videoId, lang ? { lang } : undefined)
      );
    } catch (proxyErr) {
      console.warn("[transcript] proxy failed, trying direct:", proxyErr instanceof Error ? proxyErr.message : proxyErr);
      raw = await fetchTranscript(videoId, lang ? { lang } : undefined);
    }

    const segments: TranscriptSegment[] = raw.map((line) => {
      const offsetLikelyMs = raw.some(l => l.offset >= 1000 && Number.isInteger(l.offset));
      const startSeconds = offsetLikelyMs ? line.offset / 1000 : line.offset;
      return {
        timestamp: formatTimestamp(startSeconds),
        startSeconds,
        text: line.text,
      };
    });

    incrementUsage();
    return NextResponse.json({ ok: true, segments });
  } catch (e: unknown) {
    const msg =
      e instanceof Error
        ? e.message
        : "Could not load captions for this video.";
    const { reason, userMessage } = classifyTranscriptError(msg);
    return NextResponse.json({ ok: false, error: userMessage, reason });
  }
}
