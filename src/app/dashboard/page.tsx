import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import BulkScriptExtractor from "@/components/bulkscript/BulkScriptExtractor";
import { AUTH_DISABLED } from "@/lib/auth-config";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!AUTH_DISABLED && !user) {
    return redirect("/sign-in?next=/dashboard");
  }

  const sp = await searchParams;
  const urlParam = sp.url;
  const initialUrl =
    typeof urlParam === "string" ? urlParam : Array.isArray(urlParam) ? urlParam[0] ?? "" : "";

  return <BulkScriptExtractor initialUrl={initialUrl} />;
}
