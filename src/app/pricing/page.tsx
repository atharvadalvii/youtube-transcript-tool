import { MarketingHeader } from "@/components/marketing-header";
import { SiteFooter } from "@/components/site-footer";
import { createClient } from "../../../supabase/server";
import { AUTH_DISABLED } from "@/lib/auth-config";
import { SITE_SHELL, siteFontStyle, sitePageClassName } from "@/lib/site-theme";

export default async function Pricing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUnlocked = AUTH_DISABLED || !!user;

  return (
    <div className={sitePageClassName} style={siteFontStyle}>
      <MarketingHeader appUnlocked={appUnlocked} variant="minimal" />

      <main className={`${SITE_SHELL} pt-28 sm:pt-32 pb-16 sm:pb-24`}>
        <div className="max-w-lg mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Coming soon
          </span>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight mb-4">
            Pricing is on its way
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 text-base leading-relaxed mb-10">
            The tool is completely free while we&apos;re in beta. Paid plans with higher limits and team features are coming soon.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left mb-10">
            {[
              { label: "Free during beta", sub: "No credit card, no account required" },
              { label: "Higher limits", sub: "More videos per session, faster queue" },
              { label: "Team sharing", sub: "Share transcript workspaces with your team" },
              { label: "Priority support", sub: "Direct help when something breaks" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-1">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">{item.sub}</p>
              </div>
            ))}
          </div>

          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Use the tool for free →
          </a>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
