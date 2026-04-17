export async function fetchVideoOEmbed(videoPageUrl: string): Promise<{
  title: string;
  channelName: string;
  thumbnailUrl: string;
}> {
  const oembedUrl = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(videoPageUrl)}`;
  const res = await fetch(oembedUrl, { next: { revalidate: 3600 } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      res.status === 404
        ? "Video not found or cannot be embedded."
        : `Could not load video info (${res.status}).`,
    );
  }
  const data = (await res.json()) as {
    title: string;
    author_name: string;
    thumbnail_url: string;
  };
  return {
    title: data.title,
    channelName: data.author_name,
    thumbnailUrl: data.thumbnail_url,
  };
}
