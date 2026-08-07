import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./database.types";
import { getSupabaseBrowserConfig } from "./env";

export function createClient() {
  const { url, key } = getSupabaseBrowserConfig();

  return createBrowserClient<Database>(url, key);
}