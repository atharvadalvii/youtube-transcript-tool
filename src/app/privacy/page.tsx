import { MarketingHeader } from "@/components/marketing-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_SHELL, siteFontStyle, sitePageClassName } from "@/lib/site-theme";

export const metadata = {
  title: "Privacy Policy — YouTube Transcript Tool",
};

export default function Privacy() {
  return (
    <div className={sitePageClassName} style={siteFontStyle}>
      <MarketingHeader variant="minimal" />

      <main className={`${SITE_SHELL} pt-28 sm:pt-32 pb-20`}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 dark:text-zinc-500 uppercase mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mb-10">Last updated: April 2025</p>

          <div className="prose prose-sm prose-gray dark:prose-invert max-w-none space-y-8">

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">What this tool does</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                YouTube Transcript Tool lets you extract transcripts from YouTube videos and playlists and export them in various formats. No account is required. No transcripts are stored on our servers — they are fetched on demand and returned directly to your browser.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">What we collect</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                We collect as little as possible:
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-500 dark:text-zinc-400 list-disc list-inside leading-relaxed">
                <li><strong className="text-gray-700 dark:text-zinc-300">Server logs</strong> — your IP address and the API requests you make are logged automatically by our hosting provider (Vercel). These logs are used for debugging and are retained according to Vercel's own retention policy.</li>
                <li><strong className="text-gray-700 dark:text-zinc-300">localStorage</strong> — your job queue, settings, and export format are saved in your browser's localStorage so your work persists across page refreshes. This data never leaves your device.</li>
              </ul>
              <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                We do not use cookies. We do not use analytics. We do not sell or share your data with third parties.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">Third-party services</h2>
              <ul className="space-y-1.5 text-sm text-gray-500 dark:text-zinc-400 list-disc list-inside leading-relaxed">
                <li><strong className="text-gray-700 dark:text-zinc-300">YouTube / Google</strong> — transcript data is fetched from YouTube's servers. Your use of this tool is also subject to <a href="https://www.youtube.com/t/terms" className="underline hover:text-gray-900 dark:hover:text-zinc-200" target="_blank" rel="noopener noreferrer">YouTube's Terms of Service</a> and <a href="https://policies.google.com/privacy" className="underline hover:text-gray-900 dark:hover:text-zinc-200" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</li>
                <li><strong className="text-gray-700 dark:text-zinc-300">Vercel</strong> — this site is hosted on Vercel. See <a href="https://vercel.com/legal/privacy-policy" className="underline hover:text-gray-900 dark:hover:text-zinc-200" target="_blank" rel="noopener noreferrer">Vercel's Privacy Policy</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">Your data in your browser</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                You can clear all locally stored data at any time using the "Clear" button in the app, or by clearing your browser's localStorage for this site. We have no access to this data and cannot recover it on your behalf.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">Contact</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                Questions? Reach out at <a href="mailto:atharvadal7@gmail.com" className="underline hover:text-gray-900 dark:hover:text-zinc-200">atharvadal7@gmail.com</a>.
              </p>
            </section>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
