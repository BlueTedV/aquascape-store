import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "./database.types";
import { getSupabaseBrowserConfig } from "./env";

export async function createClient() {
  const { url, key } = getSupabaseBrowserConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Middleware or Route Handlers can.
        }
      },
    },
  });
}