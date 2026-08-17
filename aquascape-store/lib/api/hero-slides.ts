import { authenticatedRequest } from "./auth";

const API_URL = (process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export type HeroSlideItem = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  filter: string;
  image: string;
  createdAt?: string;
};

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export async function getHeroSlides(): Promise<HeroSlideItem[]> {
  try {
    const response = await fetch(`${API_URL}/api/hero-slides`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as ApiResponse<HeroSlideItem[]>;
      if (Array.isArray(payload.data) && payload.data.length > 0) {
        return payload.data;
      }
    }
  } catch {
    // Fallback
  }

  return [];
}

export async function createHeroSlide(payload: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  filter: string;
  image: string;
}): Promise<HeroSlideItem> {
  return authenticatedRequest<HeroSlideItem>("/api/admin/hero-slides", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteHeroSlide(id: string): Promise<boolean> {
  await authenticatedRequest<{ deleted: boolean }>(`/api/admin/hero-slides/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return true;
}
