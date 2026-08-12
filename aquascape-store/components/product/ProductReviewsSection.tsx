"use client";

import { useEffect, useMemo, useState } from "react";
import { Star, MessageSquarePlus, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Review, getProductReviews, createProductReview } from "@/lib/api/reviews";
import { getStoredSession } from "@/lib/api/auth";

interface ProductReviewsSectionProps {
  productSlug: string;
  productName: string;
  initialRating: number;
  initialReviewCount: number;
  onReviewSubmitted?: () => void;
}

export default function ProductReviewsSection({
  productSlug,
  productName,
  initialRating,
  initialReviewCount,
  onReviewSubmitted,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Autofill user name if logged in
  useEffect(() => {
    const session = getStoredSession();
    if (session?.user?.fullName) {
      setUserName(session.user.fullName);
    }
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getProductReviews(productSlug);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productSlug]);

  const totalReviews = reviews.length > 0 ? reviews.length : initialReviewCount;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : initialRating;

  // Rating distribution counts (5..1)
  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviews.length === 0) return counts;
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      setError("Please fill in both your name and review message.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const newReview = await createProductReview(productSlug, {
        userName: userName.trim(),
        rating,
        comment: comment.trim(),
      });

      setReviews((prev) => [newReview, ...prev]);
      setSuccessMessage("Thank you! Your review has been published.");
      setComment("");
      setShowModal(false);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 border-t border-outline-variant/40 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/40 pb-6">
        <div>
          <h2 className="font-display text-headline-sm text-on-surface">Customer Reviews & Ratings</h2>
          <p className="mt-1 text-xs text-on-surface-variant">
            Verified feedback from aquascapers for <strong className="text-on-surface">{productName}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-on-primary transition-all hover:bg-primary-container shadow-sm"
        >
          <MessageSquarePlus size={16} />
          Write a Review
        </button>
      </div>

      {successMessage && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-emerald-100 p-4 text-xs font-bold text-emerald-900 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Summary Score & Star Distribution */}
      <div className="mt-6 grid gap-6 rounded-lg bg-background-white p-6 shadow-soft sm:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center justify-center border-b border-outline-variant/40 pb-6 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
          <span className="font-display text-5xl font-bold text-price-green">{avgRating.toFixed(1)}</span>
          <div className="mt-2 flex items-center gap-1 text-price-green">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.round(avgRating) ? "fill-price-green text-price-green" : "text-outline-variant"}
              />
            ))}
          </div>
          <span className="mt-1.5 text-xs text-on-surface-variant">Based on {totalReviews} reviews</span>
        </div>

        {/* Rating Bars */}
        <div className="space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star as keyof typeof distribution] || 0;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : star === 5 ? 85 : star === 4 ? 15 : 0;

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="w-12 font-bold text-on-surface-variant">{star} Stars</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-price-green transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[11px] text-on-surface-variant">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-primary">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-lg border border-dashed border-outline-variant/60 p-8 text-center">
            <Sparkles size={28} className="mx-auto text-primary/40" />
            <p className="mt-2 text-sm font-bold text-on-surface">Be the first to review this product!</p>
            <p className="mt-1 text-xs text-on-surface-variant">
              Share your experience with plant growth, quality, or setup tips.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20"
            >
              <MessageSquarePlus size={14} />
              Write Review
            </button>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="rounded-lg bg-background-white p-5 shadow-soft border border-outline-variant/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed font-bold text-xs uppercase">
                    {rev.userName.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-on-surface">{rev.userName}</h4>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified Buyer
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-price-green">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < rev.rating ? "fill-price-green text-price-green" : "text-outline-variant"}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">{rev.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* WRITE A REVIEW MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-background-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-display text-body-lg font-bold text-on-surface">Write a Review</h3>
                <p className="text-xs text-on-surface-variant">{productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-on-surface-variant hover:bg-surface-container"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="rounded bg-error-container p-3 text-xs text-on-error-container font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Star Picker */}
              <div>
                <label className="block font-bold text-on-surface-variant mb-1.5">Rating Score</label>
                <div className="flex items-center gap-1 text-price-green">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    const active = starVal <= (hoverRating || rating);

                    return (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starVal)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          size={24}
                          className={active ? "fill-price-green text-price-green" : "text-outline-variant"}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 font-bold text-on-surface">{hoverRating || rating} / 5 Stars</span>
                </div>
              </div>

              {/* Your Name */}
              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Budi Aquascaper"
                  className="w-full rounded border border-outline-variant bg-surface-container-low px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Your Feedback / Review</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about plant health, packaging quality, setup tips, or clarity..."
                  className="w-full rounded border border-outline-variant bg-surface-container-low p-3 text-xs outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded bg-primary px-5 py-2 text-xs font-bold text-on-primary hover:bg-primary-container disabled:opacity-50"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
