import { redirect } from "next/navigation";
import { LogOut, MapPin, UserRound } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { logout, updateProfile, updateShippingAddress } from "./actions";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirect=/account");
  }

  const user = data.user;
  const [{ data: profile }, { data: address }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("shipping_addresses")
      .select("recipient_name, phone, address_line1, address_line2, city, province, postal_code, country")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
        <div className="mx-auto max-w-container">
          <div className="mb-stack-lg flex flex-col gap-stack-md sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-label-md uppercase text-tertiary">Account</p>
              <h1 className="mt-2 font-display text-headline-lg text-primary">
                Profile & Delivery
              </h1>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Signed in as {user.email}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded border border-outline-variant bg-background-white px-4 py-3 text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
              >
                <LogOut size={18} />
                Logout
              </button>
            </form>
          </div>

          <div className="grid gap-gutter lg:grid-cols-2">
            <section className="rounded-lg bg-background-white p-stack-lg shadow-soft">
              <div className="mb-stack-md flex items-center gap-2 font-display text-headline-md text-on-surface">
                <UserRound size={22} className="text-primary" />
                Contact Profile
              </div>
              <form action={updateProfile} className="space-y-stack-md">
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Full Name
                  </span>
                  <input
                    name="fullName"
                    defaultValue={profile?.full_name ?? user.user_metadata.full_name ?? ""}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Phone
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={profile?.phone ?? user.user_metadata.phone ?? ""}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                >
                  Save Profile
                </button>
              </form>
            </section>

            <section className="rounded-lg bg-background-white p-stack-lg shadow-soft">
              <div className="mb-stack-md flex items-center gap-2 font-display text-headline-md text-on-surface">
                <MapPin size={22} className="text-primary" />
                Default Shipping Address
              </div>
              <form action={updateShippingAddress} className="space-y-stack-md">
                <div className="grid gap-stack-md sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                      Recipient
                    </span>
                    <input
                      required
                      name="recipientName"
                      defaultValue={address?.recipient_name ?? profile?.full_name ?? ""}
                      className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                      Phone
                    </span>
                    <input
                      required
                      name="shippingPhone"
                      type="tel"
                      defaultValue={address?.phone ?? profile?.phone ?? ""}
                      className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Address Line 1
                  </span>
                  <input
                    required
                    name="addressLine1"
                    defaultValue={address?.address_line1 ?? ""}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                    Address Line 2
                  </span>
                  <input
                    name="addressLine2"
                    defaultValue={address?.address_line2 ?? ""}
                    className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                  />
                </label>
                <div className="grid gap-stack-md sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                      City
                    </span>
                    <input
                      required
                      name="city"
                      defaultValue={address?.city ?? ""}
                      className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                      Province
                    </span>
                    <input
                      required
                      name="province"
                      defaultValue={address?.province ?? ""}
                      className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                    />
                  </label>
                </div>
                <div className="grid gap-stack-md sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                      Postal Code
                    </span>
                    <input
                      required
                      name="postalCode"
                      defaultValue={address?.postal_code ?? ""}
                      className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                      Country
                    </span>
                    <input
                      required
                      name="country"
                      defaultValue={address?.country ?? "Indonesia"}
                      className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                >
                  Save Address
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}