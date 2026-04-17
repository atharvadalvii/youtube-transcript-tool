"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { AUTH_DISABLED } from "@/lib/auth-config";

interface HomePageClientProps {
  /** When false, submitting a link sends the user to sign-in with the URL preserved for after login. */
  isAuthenticated: boolean;
}

export default function HomePageClient({ isAuthenticated }: HomePageClientProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const trimmed = url.trim();

    if (!AUTH_DISABLED && !isAuthenticated) {
      const q = new URLSearchParams({
        next: "/dashboard",
        url: trimmed,
      });
      router.push(`/sign-in?${q.toString()}`);
      setLoading(false);
      return;
    }

    router.push(`/dashboard?url=${encodeURIComponent(trimmed)}`);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-2 sm:gap-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-sm shadow-black/[0.04] dark:shadow-none p-1.5 sm:p-1.5 focus-within:border-gray-300 dark:focus-within:border-zinc-600 focus-within:ring-2 focus-within:ring-gray-900/5 dark:focus-within:ring-zinc-100/10 focus-within:shadow-md transition-all">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube link here..."
          className="flex-1 bg-transparent px-4 py-3 sm:py-2.5 text-[15px] sm:text-sm text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none min-w-0 rounded-xl sm:rounded-l-xl sm:rounded-r-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-zinc-950 text-sm font-semibold px-5 py-3 sm:py-2.5 rounded-xl sm:rounded-l-none sm:rounded-r-[0.65rem] hover:bg-gray-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              Get Transcript
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
      {loading && (
        <div className="mt-3 w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-gray-900 dark:bg-zinc-100 rounded-full animate-pulse" style={{ width: "60%" }} />
        </div>
      )}
    </form>
  );
}
