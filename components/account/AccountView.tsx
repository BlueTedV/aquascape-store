"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, MapPin, UserRound } from "lucide-react";
import {
  Account,
  getCurrentAccount,
  logout,
  updateProfile,
  updateShippingAddress,
} from "@/lib/api/auth";

export default function AccountView() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"profile" | "shipping" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getCurrentAccount()
      .then((data) => {
        if (mounted) setAccount(data);
      })
      .catch(() => {
        router.replace("/login?redirect=/account");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving("profile");
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const nextAccount = await updateProfile({
        fullName: String(formData.get("fullName") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
      });
      setAccount(nextAccount);
      setMessage("Profile saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save profile.");
    } finally {
      setSaving(null);
    }
  };

  const saveShipping = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving("shipping");
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const nextAccount = await updateShippingAddress({
        recipientName: String(formData.get("recipientName") ?? "").trim(),
        phone: String(formData.get("shippingPhone") ?? "").trim(),
        addressLine1: String(formData.get("addressLine1") ?? "").trim(),
        addressLine2: String(formData.get("addressLine2") ?? "").trim(),
        city: String(formData.get("city") ?? "").trim(),
        province: String(formData.get("province") ?? "").trim(),
        postalCode: String(formData.get("postalCode") ?? "").trim(),
        country: String(formData.get("country") ?? "Indonesia").trim() || "Indonesia",
      });
      setAccount(nextAccount);
      setMessage("Shipping address saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save shipping address.");
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-container items-center justify-center text-primary">
        <Loader2 size={28} className="animate-spin" />
      </div>
    );
  }

  if (!account) return null;

  const profile = account.profile;
  const address = account.shippingAddress;

  return (
    <div className="mx-auto max-w-container">
      <div className="mb-stack-lg flex flex-col gap-stack-md sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label-md uppercase text-tertiary">Account</p>
          <h1 className="mt-2 font-display text-headline-lg text-primary">
            Profile & Delivery
          </h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Signed in as {account.user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded border border-outline-variant bg-background-white px-4 py-3 text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {(message || error) && (
        <div
          className={`mb-stack-md rounded px-4 py-3 text-sm ${
            error ? "bg-error-container text-on-error-container" : "bg-primary-fixed text-on-primary-fixed"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="grid gap-gutter lg:grid-cols-2">
        <section className="rounded-lg bg-background-white p-stack-lg shadow-soft">
          <div className="mb-stack-md flex items-center gap-2 font-display text-headline-md text-on-surface">
            <UserRound size={22} className="text-primary" />
            Contact Profile
          </div>
          <form onSubmit={saveProfile} className="space-y-stack-md">
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                Full Name
              </span>
              <input
                name="fullName"
                defaultValue={profile?.fullName ?? account.user.fullName ?? ""}
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
                defaultValue={profile?.phone ?? account.user.phone ?? ""}
                className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              disabled={saving === "profile"}
              className="flex items-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving === "profile" && <Loader2 size={16} className="animate-spin" />}
              Save Profile
            </button>
          </form>
        </section>

        <section className="rounded-lg bg-background-white p-stack-lg shadow-soft">
          <div className="mb-stack-md flex items-center gap-2 font-display text-headline-md text-on-surface">
            <MapPin size={22} className="text-primary" />
            Default Shipping Address
          </div>
          <form onSubmit={saveShipping} className="space-y-stack-md">
            <div className="grid gap-stack-md sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                  Recipient
                </span>
                <input
                  required
                  name="recipientName"
                  defaultValue={address?.recipientName ?? profile?.fullName ?? ""}
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
                defaultValue={address?.addressLine1 ?? ""}
                className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                Address Line 2
              </span>
              <input
                name="addressLine2"
                defaultValue={address?.addressLine2 ?? ""}
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
                  defaultValue={address?.postalCode ?? ""}
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
              disabled={saving === "shipping"}
              className="flex items-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving === "shipping" && <Loader2 size={16} className="animate-spin" />}
              Save Address
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}