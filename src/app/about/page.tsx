import { MarketingHeader } from "@/components/marketing-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_SHELL, siteFontStyle, sitePageClassName } from "@/lib/site-theme";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "About — YouTube Transcript Tool",
};

export default function About() {
  return (
    <div className={sitePageClassName} style={siteFontStyle}>
      <MarketingHeader variant="minimal" />

      <main className={`${SITE_SHELL} pt-28 sm:pt-32 pb-20`}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 dark:text-zinc-500 uppercase mb-3">About</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight mb-6">
            Built out of frustration.
          </h1>

          <div className="space-y-5 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
            <p>
              YouTube Transcript Tool started as a personal project. Getting transcripts from YouTube is surprisingly painful — you either scrub through a video manually, copy-paste from the auto-generated captions one block at a time, or pay for a tool that does more than you need.
            </p>
            <p>
              This is the tool I wanted: paste a link, get the full text, export it and move on. No account, no friction, no unnecessary features.
            </p>
            <p>
              It supports single videos and playlists, exports to TXT, SRT, JSON, and CSV, and lets you search across everything you've extracted. It's in beta — things may break, features are still being added, and feedback is genuinely welcome.
            </p>
            <p>
              Built by <strong className="text-gray-700 dark:text-zinc-300">Atharva Dalvi</strong>.
            </p>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Try it free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="mailto:atharvadal7@gmail.com"
              className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors"
            >
              Send feedback →
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
