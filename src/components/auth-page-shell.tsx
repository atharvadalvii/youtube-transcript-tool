import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_SHELL, siteFontStyle, sitePageClassName } from "@/lib/site-theme";

export function AuthFormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm shadow-black/[0.04] dark:shadow-none">
      {children}
    </div>
  );
}

type AuthPageShellProps = {
  children: React.ReactNode;
  /** Secondary link in the nav (e.g. Sign in / Get started free) */
  alternateAuth?: { href: string; label: string };
};

export function AuthPageShell({ children, alternateAuth }: AuthPageShellProps) {
  return (
    <div className={`flex flex-col ${sitePageClassName}`} style={siteFontStyle}>
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
            <Link
              href="/"
              className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors"
            >
              Home
            </Link>
            {alternateAuth && (
              <Link
                href={alternateAuth.href}
                className="inline-flex items-center gap-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
              >
                {alternateAuth.label}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main
        className={`${SITE_SHELL} flex-1 flex flex-col items-center justify-center pt-24 sm:pt-28 pb-16 min-h-0`}
      >
        {children}
      </main>
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/10 dark:focus-visible:ring-zinc-100/10 focus-visible:border-gray-300 dark:focus-visible:border-zinc-600";

const labelClassName =
  "text-xs font-semibold tracking-wide text-gray-500 dark:text-zinc-400 uppercase";

export const authField = { inputClassName, labelClassName };
