import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ytranscript.net"),
  icons: { icon: "/icon.svg" },
  title: "YTranscript — Get YouTube Transcripts Instantly",
  description:
    "Paste any YouTube video or playlist link and get a clean, searchable transcript in seconds. Export as TXT, SRT, JSON, or CSV. Free, no account required.",
  keywords: [
    "youtube transcript",
    "youtube to text",
    "get youtube captions",
    "extract youtube transcript",
    "youtube subtitle downloader",
    "video to text",
  ],
  openGraph: {
    title: "YTranscript — Get YouTube Transcripts Instantly",
    description:
      "Paste any YouTube video or playlist link and get a clean, searchable transcript in seconds. Free, no account required.",
    type: "website",
    url: "https://www.ytranscript.net",
    siteName: "YTranscript",
  },
  twitter: {
    card: "summary_large_image",
    title: "YTranscript — Get YouTube Transcripts Instantly",
    description:
      "Paste any YouTube video or playlist link and get a clean, searchable transcript in seconds. Free, no account required.",
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
