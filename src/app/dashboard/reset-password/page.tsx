import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import {
  AuthFormCard,
  AuthPageShell,
  authField,
} from "@/components/auth-page-shell";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <AuthPageShell alternateAuth={{ href: "/sign-in", label: "Sign in" }}>
        <AuthFormCard>
          <FormMessage message={searchParams} />
        </AuthFormCard>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell alternateAuth={{ href: "/sign-in", label: "Sign in" }}>
      <AuthFormCard>
        <form className="flex flex-col space-y-6">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">
              Reset password
            </h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Enter your new password below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className={authField.labelClassName}>
                New password
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="New password"
                required
                className={authField.inputClassName}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className={authField.labelClassName}
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                required
                className={authField.inputClassName}
              />
            </div>
          </div>

          <SubmitButton
            formAction={resetPasswordAction}
            pendingText="Resetting password…"
            className="w-full rounded-xl bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 h-11 text-sm font-semibold"
          >
            Reset password
          </SubmitButton>

          <FormMessage message={searchParams} />
        </form>
      </AuthFormCard>
    </AuthPageShell>
  );
}
