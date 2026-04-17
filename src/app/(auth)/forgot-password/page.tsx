import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { forgotPasswordAction } from "@/app/actions";
import {
  AuthFormCard,
  AuthPageShell,
  authField,
} from "@/components/auth-page-shell";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  if ("message" in searchParams) {
    return (
      <AuthPageShell
        alternateAuth={{ href: "/sign-in", label: "Sign in" }}
      >
        <AuthFormCard>
          <FormMessage message={searchParams} />
        </AuthFormCard>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell alternateAuth={{ href: "/sign-in", label: "Sign in" }}>
      <div className="w-full max-w-md flex flex-col items-stretch gap-6">
        <AuthFormCard>
          <form className="flex flex-col space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
                Reset password
              </h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Remember your password?{" "}
                <Link
                  className="font-medium text-gray-900 dark:text-zinc-50 hover:underline"
                  href="/sign-in"
                >
                  Sign in
                </Link>
              </p>
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
                />
              </div>
            </div>

            <SubmitButton
              formAction={forgotPasswordAction}
              pendingText="Sending link…"
              className="w-full rounded-xl bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 h-11 text-sm font-semibold"
            >
              Send reset link
            </SubmitButton>

            <FormMessage message={searchParams} />
          </form>
        </AuthFormCard>
        <SmtpMessage />
      </div>
    </AuthPageShell>
  );
}
