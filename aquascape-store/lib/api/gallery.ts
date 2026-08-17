import { GalleryPost } from "@/lib/types";
import { galleryItems } from "@/data/gallery";

const API_URL = (process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export async function getGalleryPosts(options?: {
  sort?: "top" | "latest";
  limit?: number;
}): Promise<GalleryPost[]> {
  const sort = options?.sort ?? "top";
  const limit = options?.limit ?? 12;

  try {
    const response = await fetch(`${API_URL}/api/gallery?sort=${sort}&limit=${limit}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as ApiResponse<GalleryPost[]>;
      if (Array.isArray(payload.data) && payload.data.length > 0) {
        return payload.data;
      }
    }
  } catch {
    // Fallback to local mock data
  }

  // Fallback sorting on mock data
  const sorted = [...galleryItems].sort((a, b) => {
    if (sort === "latest") {
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    }
    return (b.likesCount ?? 0) - (a.likesCount ?? 0);
  });

  return sorted.slice(0, limit);
}

export async function createGalleryPost(
  payload: {
    title: string;
    description?: string;
    tankSpecs?: string;
    image: string;
    size?: "tall" | "square" | "wide";
  },
  accessToken?: string | null,
): Promise<GalleryPost> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}/api/gallery`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => ({}))) as ApiResponse<GalleryPost>;

  if (response.ok && body.data) {
    return body.data;
  }

  throw new Error(body.message || `Failed to save post to database (${response.status})`);
}

export async function likeGalleryPost(
  id: string,
  accessToken?: string | null,
): Promise<{ likesCount: number }> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }


  try {
    const response = await fetch(`${API_URL}/api/gallery/${encodeURIComponent(id)}/like`, {
      method: "POST",
      headers,
    });

    if (response.ok) {
      const payload = (await response.json()) as ApiResponse<GalleryPost>;
      return { likesCount: payload.data.likesCount };
    }
  } catch {
    // Fallback
  }

  // Fallback mock update
  const item = galleryItems.find((p) => p.id === id);
  if (item) {
    item.likesCount = (item.likesCount ?? 0) + 1;
    return { likesCount: item.likesCount };
  }

  return { likesCount: 1 };
}
