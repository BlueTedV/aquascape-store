"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { resetPassword } from "@/lib/api/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await resetPassword(email.trim(), password);
      setMessage(res.message);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-background-white p-stack-lg shadow-soft">
      <div className="mb-stack-lg">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <Lock size={24} />
        </div>
        <h1 className="font-display text-headline-md text-primary">Set New Password</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Enter your account email and choose a strong new password.
        </p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-900">Password Reset Complete</p>
              <p className="mt-1 text-xs text-emerald-700">{message}</p>
            </div>
          </div>

          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary hover:bg-primary-container"
          >
            Login to Your Account
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-stack-md">
          <label className="block">
            <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
              Account Email
            </span>
            <div className="flex items-center rounded border border-outline-variant bg-surface-container-low focus-within:border-primary">
              <span className="px-3 text-on-surface-variant">
                <Mail size={18} />
              </span>
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-3 pr-3 text-on-surface outline-none"
              />
            </div>
          </label>

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
            disabled={loading || !email.trim() || !password}
            className="flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-70"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Reset & Save Password
          </button>
        </form>
      )}

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
        <Suspense fallback={<div className="mx-auto h-96 max-w-md animate-pulse rounded bg-background-white shadow-soft" />}>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
