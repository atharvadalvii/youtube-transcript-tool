import Link from "next/link";
import { createClient } from "../../supabase/server";
import React from "react";
import {
  ArrowRight,
  FileText,
  Zap,
  Download,
  Search,
  CheckCircle,
  Link2,
  Layers3,
  FileDown,
} from "lucide-react";
import HomePageClient from "@/components/homepage-client";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900 tracking-tight">
              YouTube Transcript Tool
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              How it works
            </Link>
            <Link href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                Open App
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-1.5 bg-black text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Get started free
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-500 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            Free to use · No account required
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-5">
            Get YouTube transcripts
            <br />
            <span className="text-gray-400">instantly</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed">
            Paste a video, playlist, or channel URL and download transcripts in seconds. No sign-up required.
          </p>

          {/* Input + CTA */}
          <HomePageClient userHref={user ? "/dashboard" : "/sign-up"} />

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8">
            {[
              "Single videos",
              "Full playlists",
              "Entire channels",
              "TXT · SRT · JSON · CSV",
            ].map((feat) => (
              <span key={feat} className="flex items-center gap-1.5 text-sm text-gray-400">
                <CheckCircle className="w-3.5 h-3.5 text-gray-300" />
                {feat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-gray-100 bg-gray-50/50 py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { val: "10M+", label: "Transcripts extracted" },
              { val: "500K+", label: "Daily words processed" },
              { val: "4", label: "Export formats" },
              { val: "99.9%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-gray-900 tabular-nums">{s.val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Three steps, seconds to results
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
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
                className="relative bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="absolute top-5 right-5 text-xs font-mono font-semibold text-gray-200">
                  {item.step}
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 mb-5">
                  {item.iconName === "link2" ? <Link2 className="w-5 h-5" /> : item.iconName === "zap" ? <Zap className="w-5 h-5" /> : <FileDown className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Everything you need
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                iconName: "zap",
                title: "Paste & detect",
                desc: "Instantly identifies video, playlist, or channel URLs. Zero configuration.",
              },
              {
                iconName: "layers3",
                title: "Bulk queue",
                desc: "Queue hundreds of videos. Cherry-pick, drag to reorder, retry failures inline.",
              },
              {
                iconName: "search",
                title: "Cross-transcript search",
                desc: "Search any keyword across all your transcripts at once, with timestamps surfaced.",
              },
              {
                iconName: "download",
                title: "Flexible export",
                desc: "TXT, SRT, JSON, or CSV. Single video or ZIP archive for bulk jobs.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 flex-shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500">
                  {feat.iconName === "zap" ? <Zap className="w-4 h-4" /> : feat.iconName === "layers3" ? <Layers3 className="w-4 h-4" /> : feat.iconName === "search" ? <Search className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{feat.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Simple, honest pricing
            </h2>
            <p className="text-gray-500 mt-3 text-base">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {(plans && plans.length > 0
              ? plans.map((p: any, i: number) => ({
                  name: p.name,
                  price: (p.amount / 100).toFixed(0),
                  interval: p.interval || "mo",
                  desc: p.description || "",
                  highlight: i === 1,
                }))
              : [
                  { name: "Free", price: "0", interval: "mo", desc: "5 videos/day · Basic export formats", highlight: false },
                  { name: "Pro", price: "19", interval: "mo", desc: "Unlimited videos · All formats · Bulk ZIP", highlight: true },
                  { name: "Team", price: "49", interval: "mo", desc: "Everything in Pro · Team workspace · API", highlight: false },
                ]
            ).map((plan: { name: string; price: string; interval: string; desc: string; highlight: boolean }) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-7 border transition-shadow ${
                  plan.highlight
                    ? "bg-black border-black text-white shadow-xl shadow-black/10"
                    : "bg-white border-gray-100 shadow-sm hover:shadow-md"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
                    Most popular
                  </div>
                )}
                <div className={`text-xs font-semibold uppercase tracking-wider mb-4 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>
                  {plan.name}
                </div>
                <div className={`text-4xl font-bold tracking-tight mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  ${plan.price}
                  <span className={`text-base font-normal ml-1 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>
                    /{plan.interval}
                  </span>
                </div>
                <p className={`text-sm mt-3 mb-7 leading-relaxed ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                  {plan.desc}
                </p>
                <Link
                  href={user ? "/dashboard" : "/sign-up"}
                  className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlight
                      ? "bg-white text-black hover:bg-gray-100"
                      : "bg-gray-900 text-white hover:bg-gray-700"
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 bg-gray-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Start extracting transcripts today
          </h2>
          <p className="text-gray-400 mb-8 text-base">
            No credit card required. Get your first transcript in under 30 seconds.
          </p>
          <Link
            href={user ? "/dashboard" : "/sign-up"}
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-6 py-3.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">YouTube Transcript Tool</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">About</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Privacy</Link>
            <Link href="#" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Terms</Link>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} YouTube Transcript Tool
          </p>
        </div>
      </footer>
    </div>
  );
}
