import { NextResponse } from "next/server";
import { resolveYoutubeInput } from "@/lib/youtube/resolve";
import { rateLimit, getIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** 60s fits Vercel Hobby. Upgrade to Pro and raise to 300 for large channel scans. */
export const maxDuration = 60;

export async function POST(req: Request) {
  const { allowed, retryAfterMs } = rateLimit(
    `resolve:${getIp(req)}`,
    30,
    60_000,
  );
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }
  try {
    const body = (await req.json()) as { url?: string };
    const url = typeof body.url === "string" ? body.url : "";
    if (!url.trim()) {
      return NextResponse.json(
        { ok: false, error: "Missing url" },
        { status: 400 },
      );
    }
    const result = await resolveYoutubeInput(url);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 },
    );
  }
}
