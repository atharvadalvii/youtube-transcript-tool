import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import BulkScriptExtractor from "@/components/bulkscript/BulkScriptExtractor";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return <BulkScriptExtractor />;
}
