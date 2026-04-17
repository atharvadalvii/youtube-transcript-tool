import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import UserProfile from "./user-profile";
import { AUTH_DISABLED } from "@/lib/auth-config";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";
import { SITE_SHELL, siteFontStyle } from "@/lib/site-theme";

export default async function Navbar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  const appUnlocked = AUTH_DISABLED || !!user;

  return (
    <nav
      className="w-full border-b border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm text-gray-900 dark:text-zinc-50"
      style={siteFontStyle}
    >
      <div
        className={`${SITE_SHELL} py-3 flex justify-between items-center gap-4`}
      >
        <Link href="/" className="flex items-center gap-2 min-w-0" prefetch>
          <BrandLogo size={28} className="text-gray-300 dark:text-zinc-600 shrink-0" />
          <span className="text-sm font-semibold text-gray-900 dark:text-zinc-50 truncate">
            YouTube Transcript Tool
          </span>
        </Link>
        <div className="flex gap-2 sm:gap-3 items-center shrink-0">
          <ThemeToggle />
          {appUnlocked ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="default"
                  className="rounded-full bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200"
                >
                  Dashboard
                </Button>
              </Link>
              {user ? <UserProfile /> : null}
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-50"
              >
                Sign in
              </Link>
              <Link href="/sign-up">
                <Button className="rounded-full bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
