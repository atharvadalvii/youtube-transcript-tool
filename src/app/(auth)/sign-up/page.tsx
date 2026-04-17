import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/app/actions";
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

export default async function Signup(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await props.searchParams;
  const message = toMessage(raw);

  const nextPath =
    getParam(raw, "next")?.startsWith("/") &&
    !getParam(raw, "next")?.startsWith("//")
      ? getParam(raw, "next")!
      : "/dashboard";
  const pastedUrl = getParam(raw, "url") ?? "";

  const signInQs = new URLSearchParams();
  if (nextPath !== "/dashboard") signInQs.set("next", nextPath);
  if (pastedUrl) signInQs.set("url", pastedUrl);
  const signInHref = signInQs.toString()
    ? `/sign-in?${signInQs.toString()}`
    : "/sign-in";

  return (
    <AuthPageShell alternateAuth={{ href: signInHref, label: "Sign in" }}>
      <div className="w-full max-w-md flex flex-col items-stretch gap-6">
        <AuthFormCard>
          <form className="flex flex-col space-y-6">
            <input type="hidden" name="next" value={nextPath} />
            <input type="hidden" name="pasted_url" value={pastedUrl} />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
                Create account
              </h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Already have an account?{" "}
                <Link
                  className="font-medium text-gray-900 dark:text-zinc-50 hover:underline"
                  href={signInHref}
                >
                  Sign in
                </Link>
              </p>
              {pastedUrl ? (
                <p className="text-sm text-gray-600 dark:text-zinc-500 pt-1 leading-relaxed">
                  After you verify your email and sign in, you can continue with
                  your pasted link.
                </p>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className={authField.labelClassName}>
                  Full name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className={authField.inputClassName}
                />
              </div>

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
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className={authField.labelClassName}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                  className={authField.inputClassName}
                />
              </div>
            </div>

            <SubmitButton
              formAction={signUpAction}
              pendingText="Signing up…"
              className="w-full rounded-xl bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 h-11 text-sm font-semibold"
            >
              Create account
            </SubmitButton>

            {message ? <FormMessage message={message} /> : null}
          </form>
        </AuthFormCard>
        <SmtpMessage />
      </div>
    </AuthPageShell>
  );
}
