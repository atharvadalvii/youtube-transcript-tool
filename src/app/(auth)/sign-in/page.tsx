import { signInAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  AuthFormCard,
  AuthPageShell,
  authField,
} from "@/components/auth-page-shell";

function getParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

function toMessage(
  sp: Record<string, string | string[] | undefined>,
): Message | null {
  const err = getParam(sp, "error");
  const success = getParam(sp, "success");
  const msg = getParam(sp, "message");
  if (err) return { error: err };
  if (success) return { success };
  if (msg) return { message: msg };
  return null;
}

interface LoginProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const raw = await searchParams;
  const message = toMessage(raw);

  const nextPath =
    getParam(raw, "next")?.startsWith("/") &&
    !getParam(raw, "next")?.startsWith("//")
      ? getParam(raw, "next")!
      : "/dashboard";
  const pastedUrl = getParam(raw, "url") ?? "";
  const prefilledEmail = getParam(raw, "email") ?? "";

  const signUpQs = new URLSearchParams();
  if (nextPath !== "/dashboard") signUpQs.set("next", nextPath);
  if (pastedUrl) signUpQs.set("url", pastedUrl);
  const signUpHref = signUpQs.toString()
    ? `/sign-up?${signUpQs.toString()}`
    : "/sign-up";

  return (
    <AuthPageShell
      alternateAuth={{ href: signUpHref, label: "Get started free" }}
    >
      <AuthFormCard>
        <form className="flex flex-col space-y-6">
          <input type="hidden" name="next" value={nextPath} />
          <input type="hidden" name="pasted_url" value={pastedUrl} />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
              Sign in
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                className="font-medium text-gray-900 dark:text-zinc-50 hover:underline"
                href={signUpHref}
              >
                Get started free
              </Link>
            </p>
            {pastedUrl ? (
              <p className="text-sm text-gray-600 dark:text-zinc-500 pt-1 leading-relaxed">
                After you sign in, we&apos;ll open the app with your link ready.
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className={authField.labelClassName}>
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className={authField.inputClassName}
                defaultValue={prefilledEmail}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center gap-2">
                <Label htmlFor="password" className={authField.labelClassName}>
                  Password
                </Label>
                <Link
                  className="text-xs font-medium text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-50 transition-colors"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Your password"
                required
                className={authField.inputClassName}
              />
            </div>
          </div>

          <SubmitButton
            className="w-full rounded-xl bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 h-11 text-sm font-semibold"
            pendingText="Signing in…"
            formAction={signInAction}
          >
            Sign in
          </SubmitButton>

          {message ? <FormMessage message={message} /> : null}
        </form>
      </AuthFormCard>
    </AuthPageShell>
  );
}
