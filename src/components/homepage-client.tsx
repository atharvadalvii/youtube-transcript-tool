"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

interface HomePageClientProps {
  userHref: string;
}

export default function HomePageClient({ userHref }: HomePageClientProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    // Simulate brief loading then navigate
    await new Promise((r) => setTimeout(r, 800));
    router.push(`${userHref}?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-lg shadow-black/5 p-1.5 gap-1.5 focus-within:border-gray-400 focus-within:shadow-black/10 transition-all">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube link here..."
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none min-w-0"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
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
        <div className="mt-3 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-gray-900 rounded-full animate-pulse" style={{ width: "60%" }} />
        </div>
      )}
    </form>
  );
}
