import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Terminal } from "lucide-react";

interface LoginProps {
  searchParams: Promise<Message>;
}

export default async function SignInPage({ searchParams }: LoginProps) {
  const message = await searchParams;

  if ("message" in message) {
    return (
      <div
        className="flex h-screen w-full flex-1 items-center justify-center p-4"
        style={{ backgroundColor: "#0F1117" }}
      >
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8 font-space"
      style={{ backgroundColor: "#0F1117" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div
          className="w-7 h-7 flex items-center justify-center"
          style={{ backgroundColor: "#C8FF00" }}
        >
          <Terminal className="w-4 h-4" style={{ color: "#0F1117" }} />
        </div>
        <span
          className="text-base font-bold tracking-wider font-syne"
          style={{ color: "#F0EDE6" }}
        >
          BULK<span style={{ color: "#C8FF00" }}>SCRIPT</span>
        </span>
      </Link>

      <div
        className="w-full max-w-md p-8"
        style={{
          backgroundColor: "#1A1D24",
          border: "1px solid #2A2D35",
        }}
      >
        <form className="flex flex-col space-y-6">
          <div className="space-y-1">
            <h1
              className="text-2xl font-bold tracking-tight font-syne"
              style={{ color: "#F0EDE6" }}
            >
              Sign In
            </h1>
            <p className="text-sm" style={{ color: "#8A8D95" }}>
              Don't have an account?{" "}
              <Link
                className="font-medium transition-colors hover:underline"
                href="/sign-up"
                style={{ color: "#C8FF00" }}
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "#8A8D95" }}
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full font-mono-jet text-sm"
                style={{
                  backgroundColor: "#0F1117",
                  border: "1px solid #2A2D35",
                  color: "#F0EDE6",
                  borderRadius: "0",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="password"
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#8A8D95" }}
                >
                  Password
                </Label>
                <Link
                  className="text-xs transition-colors hover:underline"
                  href="/forgot-password"
                  style={{ color: "#8A8D95" }}
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Your password"
                required
                className="w-full font-mono-jet text-sm"
                style={{
                  backgroundColor: "#0F1117",
                  border: "1px solid #2A2D35",
                  color: "#F0EDE6",
                  borderRadius: "0",
                }}
              />
            </div>
          </div>

          <SubmitButton
            className="w-full py-3 text-sm font-bold tracking-widest !rounded-none"
            pendingText="Signing in..."
            formAction={signInAction}
            style={{
              backgroundColor: "#C8FF00",
              color: "#0F1117",
            }}
          >
            SIGN IN
          </SubmitButton>

          <FormMessage message={message} />
        </form>
      </div>
    </div>
  );
}

