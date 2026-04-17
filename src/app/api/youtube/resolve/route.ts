import { NextResponse } from "next/server";
import { resolveYoutubeInput } from "@/lib/youtube/resolve";

export const runtime = "nodejs";

/** Allow long channel / playlist scans (1000+ items). Adjust for your host. */
export const maxDuration = 300;

export async function POST(req: Request) {
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
