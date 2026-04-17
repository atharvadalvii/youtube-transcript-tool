import Link from "next/link";
import { createClient } from "../../supabase/server";
import React from "react";
import {
  ArrowRight,
  Zap,
  Download,
  Search,
  CheckCircle,
  Link2,
  Layers3,
  FileDown,
} from "lucide-react";
import HomePageClient from "@/components/homepage-client";
import { MarketingHeader } from "@/components/marketing-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingCardsGrid } from "@/components/pricing-cards-grid";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AUTH_DISABLED } from "@/lib/auth-config";
import { SITE_SHELL, siteFontStyle, sitePageClassName } from "@/lib/site-theme";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUnlocked = AUTH_DISABLED || !!user;

  let plans = null;
  try {
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-get-plans",
    );
    if (!error) plans = data;
  } catch {
    // Edge function unavailable — fall through to static fallback pricing
  }

  return (
    <div className={sitePageClassName} style={siteFontStyle}>
      <MarketingHeader appUnlocked={appUnlocked} variant="full" />

      {/* Hero Section */}
      <AuroraBackground className="w-full">
      <section className={`${SITE_SHELL} pt-28 sm:pt-32 pb-16 sm:pb-20 relative z-10`}>
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-gray-200/90 dark:border-zinc-700 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-600 dark:text-zinc-400 mb-7 sm:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" aria-hidden />
            Free to use · No account required
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[3.25rem] font-bold text-gray-900 dark:text-zinc-50 tracking-tight leading-[1.08] mb-5">
            Get YouTube transcripts
            <br />
            <span className="text-gray-600 dark:text-zinc-500">instantly</span>
          </h1>

          <p className="text-base sm:text-lg font-medium text-gray-800 dark:text-zinc-300 max-w-xl mx-auto mb-9 sm:mb-10 leading-relaxed">
            {AUTH_DISABLED
              ? "Paste a YouTube video, playlist, or channel link and open the app — no account required while testing."
              : "Paste a link and sign in to start. Free tier available after you create an account."}
          </p>

          {/* Input + CTA */}
          <HomePageClient isAuthenticated={appUnlocked} />

          {/* Trust row */}
          <div className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-gray-100 dark:border-zinc-800">
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 sm:gap-x-6 max-w-2xl mx-auto text-left sm:text-center">
              {[
                "Single videos",
                "Full playlists",
                "Entire channels",
                "TXT · SRT · JSON · CSV",
              ].map((feat) => (
                <li
                  key={feat}
                  className="flex items-start sm:items-center sm:justify-center gap-2 text-sm font-medium text-gray-800 dark:text-zinc-300"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" aria-hidden />
                  <span className="leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      </AuroraBackground>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-28 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 dark:text-zinc-500 uppercase mb-3">How it works</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
              Three steps, seconds to results
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
            {[
              {
                step: "01",
                iconName: "link2",
                title: "Paste your link",
                desc: "Drop any YouTube URL — a single video, a full playlist, or an entire channel. We detect the type instantly.",
              },
              {
                step: "02",
                iconName: "zap",
                title: "Generate transcript",
                desc: "Our engine fetches and processes the transcript with timestamps and speaker labels in seconds.",
              },
              {
                step: "03",
                iconName: "filedown",
                title: "Download or export",
                desc: "Export as TXT, SRT, JSON, or CSV. Bulk download as ZIP for playlists and channels.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-gray-200/80 dark:hover:border-zinc-700 transition-all"
              >
                <div className="absolute top-5 right-5 text-xs font-mono font-bold text-gray-300 dark:text-zinc-600 tabular-nums">
                  {item.step}
                </div>
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shrink-0">
                  {item.iconName === "link2" ? <Link2 className="w-5 h-5" /> : item.iconName === "zap" ? <Zap className="w-5 h-5" /> : <FileDown className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-50 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed flex-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-28 border-t border-gray-100 dark:border-zinc-800 bg-[#fafafa] dark:bg-zinc-900/40">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 dark:text-zinc-500 uppercase mb-3">Features</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
              Everything you need
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {[
              {
                iconName: "zap",
                title: "Paste & detect",
                desc: "Instantly identifies video, playlist, or channel URLs. Zero configuration.",
                iconBg: "bg-amber-50 dark:bg-amber-950/40",
                iconColor: "text-amber-500 dark:text-amber-400",
              },
              {
                iconName: "layers3",
                title: "Bulk queue",
                desc: "Queue hundreds of videos. Cherry-pick, drag to reorder, retry failures inline.",
                iconBg: "bg-violet-50 dark:bg-violet-950/40",
                iconColor: "text-violet-500 dark:text-violet-400",
              },
              {
                iconName: "search",
                title: "Cross-transcript search",
                desc: "Search any keyword across all your transcripts at once, with timestamps surfaced.",
                iconBg: "bg-sky-50 dark:bg-sky-950/40",
                iconColor: "text-sky-500 dark:text-sky-400",
              },
              {
                iconName: "download",
                title: "Flexible export",
                desc: "TXT, SRT, JSON, or CSV. Single video or ZIP archive for bulk jobs.",
                iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
                iconColor: "text-emerald-500 dark:text-emerald-400",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="flex gap-4 sm:gap-5 h-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-gray-200/80 dark:hover:border-zinc-700 transition-all"
              >
                <div className={`w-10 h-10 flex-shrink-0 ${feat.iconBg} rounded-xl flex items-center justify-center ${feat.iconColor}`}>
                  {feat.iconName === "zap" ? <Zap className="w-4 h-4" /> : feat.iconName === "layers3" ? <Layers3 className="w-4 h-4" /> : feat.iconName === "search" ? <Search className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 mb-1.5">{feat.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-28 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className={`${SITE_SHELL} py-20 sm:py-28`}>
          <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 dark:text-zinc-500 uppercase mb-3">Pricing</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
              Simple, honest pricing
            </h2>
            <p className="text-gray-500 dark:text-zinc-400 mt-3 text-base leading-relaxed">Start free. Upgrade when you need more.</p>
          </div>

          <PricingCardsGrid plans={plans} appUnlocked={appUnlocked} />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-gray-100 dark:border-zinc-800 bg-gray-950 dark:bg-black">
        <div className={`${SITE_SHELL} py-16 sm:py-20`}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Start extracting transcripts today
            </h2>
            <p className="text-gray-400 dark:text-zinc-500 mb-8 text-base leading-relaxed">
              No credit card required. Get your first transcript in under 30 seconds.
            </p>
            <Link
              href={appUnlocked ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-zinc-100 text-black dark:text-zinc-950 text-sm font-semibold px-6 py-3.5 rounded-full hover:bg-gray-100 dark:hover:bg-white transition-colors"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
