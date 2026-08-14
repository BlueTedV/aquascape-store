"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await forgotPassword(email.trim());
      setMessage(res.message);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
        <div className="mx-auto w-full max-w-md rounded-lg bg-background-white p-stack-lg shadow-soft">
          <div className="mb-stack-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <KeyRound size={24} />
            </div>
            <h1 className="font-display text-headline-md text-primary">Forgot Password?</h1>
            <p className="mt-2 text-body-sm text-on-surface-variant">
              Enter your registered email address below. We&apos;ll send you instructions and a link to reset your account password.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">Reset Request Sent</p>
                  <p className="mt-1 text-xs text-emerald-700">{message}</p>
                </div>
              </div>

              <div className="rounded-lg bg-surface-container-low p-4 text-xs text-on-surface-variant space-y-2 border border-outline-variant/60">
                <p className="font-bold text-on-surface">What to do next?</p>
                <p>1. Check your email inbox for <strong>{email}</strong>.</p>
                <p>2. Or proceed directly to set a new password with the button below.</p>
              </div>

              <Link
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary hover:bg-primary-container"
              >
                Set New Password Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-stack-md">
              <label className="block">
                <span className="mb-2 block text-label-md uppercase text-on-surface-variant">
                  Registered Email Address
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

              {error && (
                <p className="rounded bg-error-container px-3 py-2 text-xs text-on-error-container font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex w-full items-center justify-center gap-2 rounded bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-70"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Send Reset Link
              </button>
            </form>
          )}

          <div className="mt-stack-lg border-t border-outline-variant/40 pt-4 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
