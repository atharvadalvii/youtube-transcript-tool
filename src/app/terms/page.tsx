import { MarketingHeader } from "@/components/marketing-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_SHELL, siteFontStyle, sitePageClassName } from "@/lib/site-theme";

export const metadata = {
  title: "Terms of Service — YouTube Transcript Tool",
};

export default function Terms() {
  return (
    <div className={sitePageClassName} style={siteFontStyle}>
      <MarketingHeader variant="minimal" />

      <main className={`${SITE_SHELL} pt-28 sm:pt-32 pb-20`}>
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 dark:text-zinc-500 uppercase mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mb-10">Last updated: April 2025</p>

          <div className="space-y-8">

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">1. Use of the service</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                YouTube Transcript Tool is provided as-is for personal and professional use. You may use it to extract and export transcripts from publicly available YouTube videos and playlists. You are responsible for ensuring your use complies with YouTube's Terms of Service and any applicable copyright laws in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">2. What we don't allow</h2>
              <ul className="space-y-1.5 text-sm text-gray-500 dark:text-zinc-400 list-disc list-inside leading-relaxed">
                <li>Automated scraping or abuse of the service at scale</li>
                <li>Using extracted transcripts to infringe on copyright</li>
                <li>Attempting to reverse engineer, overload, or disrupt the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">3. No warranties</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                This service is provided without any warranty of any kind. Transcripts are sourced directly from YouTube and may be inaccurate, incomplete, or unavailable for some videos. We do not guarantee uptime, accuracy, or availability.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">4. Limitation of liability</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                We are not liable for any damages, losses, or consequences arising from your use of this tool or the transcripts it produces. Use at your own discretion.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">5. Changes to these terms</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                We may update these terms as the service evolves. Continued use of the tool after changes are posted means you accept the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">6. Contact</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                Questions about these terms? Reach out at <a href="mailto:atharvadal7@gmail.com" className="underline hover:text-gray-900 dark:hover:text-zinc-200">atharvadal7@gmail.com</a>.
              </p>
            </section>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
