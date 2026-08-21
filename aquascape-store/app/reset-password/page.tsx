"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldAlert } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

function ResetPasswordForm() {
  const router = useRouter();

  const [ready, setReady] = useState(false);       // token parsed from hash
  const [invalid, setInvalid] = useState(false);    // no valid recovery token
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      // 1. Listen for Supabase auth events (e.g. PASSWORD_RECOVERY or SIGNED_IN)
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!active) return;
        if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
          setReady(true);
          setInvalid(false);
        }
      });

      // 2. Check query params (PKCE `code` or `token_hash`)
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchangeError && active) {
          setReady(true);
          setInvalid(false);
          window.history.replaceState(null, "", window.location.pathname);
          return;
        }
      }

      if (tokenHash && (type === "recovery" || type === "email")) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (type as "recovery" | "email") || "recovery",
        });
        if (!otpError && active) {
          setReady(true);
          setInvalid(false);
          window.history.replaceState(null, "", window.location.pathname);
          return;
        }
      }

      // 3. Check hash fragment (#access_token=...&type=recovery)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const hashType = params.get("type");

        if (accessToken && (hashType === "recovery" || !hashType)) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken ?? "",
          });
          if (!sessionError && active) {
            setReady(true);
            setInvalid(false);
            window.history.replaceState(null, "", window.location.pathname);
            return;
          }
        }
      }

      // 4. Check existing session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session && active) {
        setReady(true);
        setInvalid(false);
        return;
      }

      // 5. Fallback timer if session resolution takes a moment
      const timer = setTimeout(() => {
        if (active) {
          supabase.auth.getSession().then(({ data }) => {
            if (data?.session) {
              setReady(true);
              setInvalid(false);
            } else {
              setInvalid(true);
            }
          });
        }
      }, 1500);

      return () => {
        active = false;
        clearTimeout(timer);
        authListener?.subscription?.unsubscribe();
      };
    }

    checkAuth();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Failed to update password. The link may have expired.");
    } else {
      setSuccess(true);
    }
  }

  /* ── States ─────────────────────────────────────────────────── */

  if (invalid) {
    return (
      <div className="mx-auto w-full max-w-md rounded-lg bg-background-white p-stack-lg shadow-soft">
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-5">
          <ShieldAlert size={22} className="shrink-0 mt-0.5 text-red-600" />
          <div>
            <p className="text-sm font-bold text-red-900">Invalid or Expired Link</p>
            <p className="mt-1.5 text-xs leading-relaxed text-red-700">
              This password reset link is invalid or has already expired. Please request a new one.
            </p>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary hover:bg-primary-container"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-[260px] max-w-md items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md rounded-lg bg-background-white p-stack-lg shadow-soft space-y-4">
        <div className="rounded-lg bg-emerald-50 p-5 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Password Updated</p>
            <p className="mt-1.5 text-xs leading-relaxed text-emerald-700">
              Your password has been successfully changed. You can now log in with your new password.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary hover:bg-primary-container"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-background-white p-stack-lg shadow-soft">
      <div className="mb-stack-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <Lock size={24} />
        </div>
        <h1 className="font-display text-headline-md text-primary">Set New Password</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Choose a strong new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-stack-md">
        {/* New password */}
        <label className="block">
          <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
            New Password
          </span>
          <div className="flex items-center rounded border border-outline-variant bg-surface-container-low focus-within:border-primary">
            <span className="px-3 text-on-surface-variant">
              <KeyRound size={18} />
            </span>
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent py-3 pr-3 text-on-surface outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="px-3 text-on-surface-variant hover:text-primary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {/* Confirm password */}
        <label className="block">
          <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
            Confirm New Password
          </span>
          <div className="flex items-center rounded border border-outline-variant bg-surface-container-low focus-within:border-primary">
            <span className="px-3 text-on-surface-variant">
              <Lock size={18} />
            </span>
            <input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent py-3 pr-3 text-on-surface outline-none"
            />
          </div>
        </label>

        {error && (
          <p className="rounded bg-error-container px-3 py-2 text-xs text-on-error-container font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword}
          className="flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-70"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          Save New Password
        </button>
      </form>

      <div className="mt-stack-lg border-t border-outline-variant/40 pt-4 text-center">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
        <Suspense
          fallback={
            <div className="mx-auto flex min-h-[260px] max-w-md items-center justify-center">
              <Loader2 size={28} className="animate-spin text-primary" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
