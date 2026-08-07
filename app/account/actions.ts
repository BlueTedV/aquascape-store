"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirect=/account");
  }

  return { supabase, user: data.user };
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName || null,
    phone: phone || null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/account");
}

export async function updateShippingAddress(formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  const payload = {
    user_id: user.id,
    recipient_name: String(formData.get("recipientName") ?? "").trim(),
    phone: String(formData.get("shippingPhone") ?? "").trim(),
    address_line1: String(formData.get("addressLine1") ?? "").trim(),
    address_line2: String(formData.get("addressLine2") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim(),
    province: String(formData.get("province") ?? "").trim(),
    postal_code: String(formData.get("postalCode") ?? "").trim(),
    country: String(formData.get("country") ?? "Indonesia").trim() || "Indonesia",
    is_default: true,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("shipping_addresses").upsert(payload, {
    onConflict: "user_id,is_default",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/account");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}