"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import { AUTH_DISABLED } from "@/lib/auth-config";

function safeAppPath(path: string | null | undefined, fallback: string): string {
  if (!path || typeof path !== "string") return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.includes("://")) return fallback;
  return path;
}

function signUpQueryFromForm(formData: FormData): URLSearchParams {
  const nextPath = safeAppPath(formData.get("next")?.toString(), "/dashboard");
  const pastedUrl = formData.get("pasted_url")?.toString()?.trim() ?? "";
  const q = new URLSearchParams();
  if (nextPath !== "/dashboard") q.set("next", nextPath);
  if (pastedUrl) q.set("url", pastedUrl);
  return q;
}

function redirectSignUp(formData: FormData, type: "error" | "success", text: string) {
  const q = signUpQueryFromForm(formData);
  q.set(type, text);
  return redirect(`/sign-up?${q.toString()}`);
}

function redirectSignInForExistingAccount(formData: FormData, email: string) {
  const q = signUpQueryFromForm(formData);
  q.set(
    "message",
    "An account with this email already exists. Sign in below to continue.",
  );
  q.set("email", email);
  return redirect(`/sign-in?${q.toString()}`);
}

function signUpErrorMeansAccountExists(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already exists") ||
    m.includes("email address is already registered") ||
    m.includes("already in use") ||
    m.includes("duplicate key value") ||
    m.includes("unique constraint")
  );
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();

  if (!email || !password) {
    return redirectSignUp(formData, "error", "Email and password are required");
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  if (error) {
    if (signUpErrorMeansAccountExists(error.message)) {
      return redirectSignInForExistingAccount(formData, email);
    }
    return redirectSignUp(formData, "error", error.message);
  }

  // public.users row is created by DB trigger handle_new_user() on auth.users insert.
  // Do not insert here — it duplicates the trigger and causes primary key errors.

  return redirectSignUp(
    formData,
    "success",
    "Thanks for signing up! Please check your email for a verification link.",
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextPath = safeAppPath(
    formData.get("next")?.toString(),
    "/dashboard",
  );
  const pastedUrl = formData.get("pasted_url")?.toString()?.trim() ?? "";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const q = new URLSearchParams({ error: error.message });
    if (nextPath !== "/dashboard") q.set("next", nextPath);
    if (pastedUrl) q.set("url", pastedUrl);
    if (email?.trim()) q.set("email", email.trim());
    return redirect(`/sign-in?${q.toString()}`);
  }

  if (pastedUrl) {
    return redirect(`${nextPath}?url=${encodeURIComponent(pastedUrl)}`);
  }
  return redirect(nextPath);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {});

  if (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  if (AUTH_DISABLED) {
    return redirect("/");
  }
  return redirect("/sign-in");
};

export const checkUserSubscription = async (userId: string) => {
  if (AUTH_DISABLED) {
    return true;
  }
  const supabase = await createClient();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    return false;
  }

  return !!subscription;
};
