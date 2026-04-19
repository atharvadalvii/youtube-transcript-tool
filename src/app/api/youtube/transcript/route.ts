import { NextResponse } from "next/server";
import { fetchTranscriptCustom } from "@/lib/youtube/fetch-transcript";
import { classifyTranscriptError } from "@/lib/youtube/transcript-errors";
import { formatTimestamp } from "@/utils/bulkscript";
import { rateLimit, getIp } from "@/lib/rate-limit";
import type { TranscriptSegment } from "@/types/bulkscript";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { allowed, retryAfterMs } = rateLimit(
    `transcript:${getIp(req)}`,
    60,        // 60 requests
    60_000,    // per minute
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

    const raw = await fetchTranscriptCustom(videoId, lang);

    // fetchTranscriptCustom returns offset in ms
    const segments: TranscriptSegment[] = raw.map((line) => {
      const startSeconds = line.offset / 1000;
      return {
        timestamp: formatTimestamp(startSeconds),
        startSeconds,
        text: line.text,
      };
    });

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
