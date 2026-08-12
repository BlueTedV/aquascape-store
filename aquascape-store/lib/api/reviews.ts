export interface Review {
  id: string;
  productSlug: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewInput {
  userName: string;
  rating: number;
  comment: string;
}

const API_URL = (process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? process.env.AQUAKU_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function getProductReviews(productSlug: string): Promise<Review[]> {
  try {
    const response = await fetch(`${API_URL}/api/products/${encodeURIComponent(productSlug)}/reviews`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch product reviews", error);
    return [];
  }
}

export async function createProductReview(productSlug: string, input: CreateReviewInput): Promise<Review> {
  const response = await fetch(`${API_URL}/api/products/${encodeURIComponent(productSlug)}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit review.");
  }

  return data.data;
}
