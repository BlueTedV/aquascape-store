import { createClient } from "./server";

export async function getProducts() {
  const supabase = await createClient();

  return supabase
    .from("products")
    .select("*")
    .order("featured", { ascending: false })
    .order("review_count", { ascending: false });
}

export async function getProductsByTag(tag: string) {
  const supabase = await createClient();

  return supabase
    .from("products")
    .select("*")
    .contains("tags", [tag])
    .order("review_count", { ascending: false });
}