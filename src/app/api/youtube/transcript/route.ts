import { NextResponse } from "next/server";
import { fetchTranscript } from "youtube-transcript";
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

    // "Word-to-word" accuracy depends heavily on using the exact caption track.
    // YouTube language codes are not always an exact match to our UI values
    // (e.g. "en" vs "en-US"). Try a few common variants before falling back.
    let raw:
      | Awaited<ReturnType<typeof fetchTranscript>>
      | undefined;

    const candidates = (() => {
      if (!lang) return [undefined] as Array<string | undefined>;
      const trimmed = lang.replace(/_/g, "-");
      if (trimmed.length !== 2) return [trimmed] as string[];

      const extraVariants: Record<string, string[]> = {
        en: ["en", "en-US", "en-GB", "en-AU", "en-CA"],
        zh: ["zh", "zh-Hans", "zh-Hant", "zh-CN", "zh-TW", "zh-HK"],
        pt: ["pt", "pt-BR", "pt-PT"],
        es: ["es", "es-419", "es-ES", "es-MX"],
        fr: ["fr", "fr-FR", "fr-CA", "fr-BE"],
        de: ["de", "de-DE", "de-AT", "de-CH"],
        ar: ["ar", "ar-SA", "ar-EG"],
        hi: ["hi"],
        ja: ["ja"],
        ko: ["ko"],
        ru: ["ru"],
        it: ["it"],
        tr: ["tr"],
        id: ["id"],
      };
      const variants = extraVariants[trimmed.toLowerCase()] ?? [trimmed];
      return variants;
    })();

    let lastError: unknown = null;
    for (const candidate of candidates) {
      try {
        raw = await fetchTranscript(
          videoId,
          candidate ? { lang: candidate } : undefined,
        );
        lastError = null;
        break;
      } catch (e) {
        lastError = e;
      }
    }

    if (!raw) {
      if (lastError instanceof Error) {
        throw lastError;
      } else {
        throw new Error("Could not load captions for this video.");
      }
    }

    // Package returns offset in ms for srv3 captions and in seconds for classic XML.
    const offsetLikelyMs = raw.some(
      (l) => l.offset >= 1000 && Number.isInteger(l.offset),
    );
    const toSeconds = (offset: number) =>
      offsetLikelyMs ? offset / 1000 : offset;

    const segments: TranscriptSegment[] = raw.map((line) => {
      const startSeconds = toSeconds(line.offset);
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
