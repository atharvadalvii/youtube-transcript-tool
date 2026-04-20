import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ytranscript.net"),
  icons: { icon: "/icon.svg" },
  title: "YouTube Transcript Generator — Free Bulk & Playlist Export | YTranscript",
  description:
    "Extract transcripts from any YouTube video, playlist or channel instantly. Free, no signup. Export as TXT, SRT, JSON or CSV. Bulk download entire playlists.",
  keywords: [
    "youtube transcript",
    "youtube transcript generator",
    "playlist transcript",
    "channel transcript",
    "youtube to text",
    "get youtube captions",
    "extract youtube transcript",
    "youtube subtitle downloader",
    "bulk youtube transcript",
    "video to text",
  ],
  openGraph: {
    title: "YouTube Transcript Generator — Free Bulk & Playlist Export | YTranscript",
    description:
      "Extract transcripts from any YouTube video, playlist or channel instantly. Free, no signup. Export as TXT, SRT, JSON or CSV.",
    type: "website",
    url: "https://www.ytranscript.net",
    siteName: "YTranscript",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "YTranscript — YouTube Transcript Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Transcript Generator — Free Bulk & Playlist Export | YTranscript",
    description:
      "Extract transcripts from any YouTube video, playlist or channel instantly. Free, no signup. Export as TXT, SRT, JSON or CSV.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://www.ytranscript.net",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
