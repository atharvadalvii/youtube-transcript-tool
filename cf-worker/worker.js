const VERSION = "20.10.38";
const UA = `com.google.android.youtube/${VERSION} (Linux; U; Android 14)`;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const auth = request.headers.get("Authorization");
    if (env.SECRET && auth !== `Bearer ${env.SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    let videoId, lang;
    try {
      ({ videoId, lang } = await request.json());
    } catch {
      return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
      return Response.json({ ok: false, error: "Invalid videoId" }, { status: 400 });
    }

    const playerRes = await fetch(
      "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": UA },
        body: JSON.stringify({
          context: { client: { clientName: "ANDROID", clientVersion: VERSION } },
          videoId,
        }),
      }
    );

    if (!playerRes.ok) {
      return Response.json(
        { ok: false, error: "YouTube is receiving too many requests from this IP and now requires solving a captcha to continue" },
        { status: 502 }
      );
    }

    const playerData = await playerRes.json();
    const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];

    if (tracks.length === 0) {
      return Response.json(
        { ok: false, error: `No transcripts are available for this video (${videoId})` },
        { status: 404 }
      );
    }

    const track = (lang ? tracks.find((t) => t.languageCode === lang) : null) ?? tracks[0];

    if (lang && !tracks.find((t) => t.languageCode === lang)) {
      const available = tracks.map((t) => t.languageCode);
      return Response.json(
        { ok: false, error: `No transcripts are available in ${lang} this video (${videoId}). Available languages: ${available.join(", ")}` },
        { status: 404 }
      );
    }

    const xmlRes = await fetch(track.baseUrl, { headers: { "User-Agent": UA } });
    if (!xmlRes.ok) {
      return Response.json(
        { ok: false, error: "Could not load captions for this video." },
        { status: 502 }
      );
    }

    const xml = await xmlRes.text();
    return Response.json({ ok: true, xml, lang: track.languageCode });
  },
};
