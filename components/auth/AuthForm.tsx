"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const supabase = createClient();

    try {
      if (isRegister) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
            data: {
              full_name: fullName,
              phone,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage("Account created. Check your email to confirm your signup before logging in.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-background-white p-stack-lg shadow-soft">
      <div className="mb-stack-lg">
        <p className="text-label-md uppercase text-tertiary">
          {isRegister ? "Create account" : "Welcome back"}
        </p>
        <h1 className="mt-2 font-display text-headline-lg text-primary">
          {isRegister ? "Register" : "Login"}
        </h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          {isRegister
            ? "Save your profile now and add delivery details from your account page."
            : "Sign in to manage your profile and shipping address."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-stack-md">
        {isRegister && (
          <>
            <label className="block">
              <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                Full Name
              </span>
              <input
                required
                name="fullName"
                type="text"
                autoComplete="name"
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
                autoComplete="tel"
                className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
              />
            </label>
          </>
        )}

        <label className="block">
          <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
            Email
          </span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-3 text-on-surface outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
            Password
          </span>
          <span className="flex items-center rounded border border-outline-variant bg-surface-container-low focus-within:border-primary">
            <input
              required
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={6}
              className="w-full bg-transparent px-3 py-3 text-on-surface outline-none"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
              className="px-3 text-on-surface-variant transition-colors hover:text-primary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {error && (
          <p className="rounded bg-error-container px-3 py-2 text-sm text-on-error-container">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded bg-primary-fixed px-3 py-2 text-sm text-on-primary-fixed">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {isRegister ? "Create Account" : "Login"}
        </button>
      </form>

      <p className="mt-stack-lg text-center text-body-md text-on-surface-variant">
        {isRegister ? "Already have an account?" : "New to Aqua Studio?"} {" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-bold text-primary hover:underline"
        >
          {isRegister ? "Login" : "Register"}
        </Link>
      </p>
    </div>
  );
}