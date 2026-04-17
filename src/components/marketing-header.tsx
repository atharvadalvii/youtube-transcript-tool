import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_SHELL } from "@/lib/site-theme";

type Variant = "full" | "minimal";

export function MarketingHeader({
  appUnlocked,
  variant = "full",
}: {
  appUnlocked: boolean;
  variant?: Variant;
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-gray-100/80 dark:border-zinc-800/80">
      <div
        className={`${SITE_SHELL} py-3.5 sm:py-4 flex items-center justify-between gap-4`}
      >
        <Link href="/" className="flex items-center gap-2.5 min-w-0" aria-label="YouTube Transcript Tool home">
          <BrandLogo size={34} className="text-gray-300 dark:text-zinc-600 shrink-0" />
          <span className="text-[15px] font-semibold text-gray-900 dark:text-zinc-50 tracking-tight truncate">
            YouTube Transcript Tool
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-1 md:gap-6">
            {variant === "full" ? (
              <>
                <Link
                  href="/#how-it-works"
                  className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  How it works
                </Link>
                <Link
                  href="/#features"
                  className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Features
                </Link>
                <Link
                  href="/#pricing"
                  className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Pricing
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Home
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  Pricing
                </Link>
              </>
            )}
            {appUnlocked ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Open App
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/sign-in"
                  className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Get started free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
