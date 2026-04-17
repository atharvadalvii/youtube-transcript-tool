import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing-header";
import { SiteFooter } from "@/components/site-footer";
import { AUTH_DISABLED } from "@/lib/auth-config";
import { createClient } from "../../../supabase/server";
import { siteFontStyle, sitePageClassName, SITE_SHELL } from "@/lib/site-theme";

export default async function SuccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const appUnlocked = AUTH_DISABLED || !!user;

  return (
    <div className={sitePageClassName} style={siteFontStyle}>
      <MarketingHeader appUnlocked={appUnlocked} variant="minimal" />

      <main
        className={`${SITE_SHELL} flex-1 flex flex-col items-center justify-center pt-28 sm:pt-32 pb-20 min-h-[70vh]`}
      >
        <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-10 shadow-sm shadow-black/[0.04] dark:shadow-none text-center">
          <div className="flex justify-center mb-5">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight mb-2">
            Payment successful
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed mb-8">
            Thank you for your purchase. You will receive a confirmation email
            shortly with your purchase details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-zinc-50 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              View dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
            >
              Return home
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
