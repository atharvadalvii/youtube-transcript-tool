import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "YouTube Transcript Tool — Get transcripts instantly",
  description:
    "Extract transcripts from any YouTube video, playlist, or channel. Download as TXT, SRT, JSON, or CSV. Free, no account required.",
  openGraph: {
    title: "YouTube Transcript Tool",
    description:
      "Extract transcripts from any YouTube video, playlist, or channel. Free, no account required.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "YouTube Transcript Tool",
    description:
      "Extract transcripts from any YouTube video, playlist, or channel. Free, no account required.",
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
      </body>
    </html>
  );
}
