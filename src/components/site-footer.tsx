import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SITE_SHELL } from "@/lib/site-theme";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className={`${SITE_SHELL} py-10 sm:py-12`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <BrandLogo size={28} className="text-gray-300 dark:text-zinc-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-zinc-50 tracking-tight">
              YouTube Transcript Tool
            </span>
          </div>
          <nav
            className="flex items-center justify-center gap-8 sm:gap-10"
            aria-label="Footer"
          >
            <Link href="/about" className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors">
              About
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors">
              Terms
            </Link>
          </nav>
          <p className="text-xs text-gray-400 dark:text-zinc-500 sm:text-right sm:justify-self-end">
            © {new Date().getFullYear()} YouTube Transcript Tool
          </p>
        </div>
      </div>
    </footer>
  );
}
