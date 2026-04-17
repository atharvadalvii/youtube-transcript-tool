import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="w-full max-w-md rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 px-4 py-3 flex gap-3 text-left">
      <InfoIcon
        size={16}
        className="mt-0.5 shrink-0 text-gray-400 dark:text-zinc-500"
        aria-hidden
      />
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
          <span className="font-medium text-gray-700 dark:text-zinc-300">Note:</span>{" "}
          Emails are rate limited. Enable Custom SMTP to increase the rate limit.
        </p>
        <Link
          href="https://supabase.com/docs/guides/auth/auth-smtp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors"
        >
          Learn more <ArrowUpRight size={14} className="shrink-0" />
        </Link>
      </div>
    </div>
  );
}
