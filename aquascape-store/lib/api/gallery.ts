import { GalleryPost } from "@/lib/types";
import { getValidAccessToken } from "@/lib/api/auth";

const API_URL = (process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export async function getGalleryPosts(options?: {
  sort?: "top" | "latest";
  limit?: number;
  accessToken?: string | null;
}): Promise<GalleryPost[]> {
  const sort = options?.sort ?? "top";
  const limit = options?.limit ?? 12;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const token = options?.accessToken || (await getValidAccessToken());
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const fetchOptions: RequestInit = { headers };
    if (!token) {
      fetchOptions.next = { revalidate: 60, tags: ["gallery"] };
    } else {
      fetchOptions.cache = "no-store";
    }

    const response = await fetch(`${API_URL}/api/gallery?sort=${sort}&limit=${limit}`, fetchOptions);

    if (response.ok) {
      const payload = (await response.json()) as ApiResponse<GalleryPost[]>;
      if (Array.isArray(payload.data)) {
        return payload.data;
      }
    }
  } catch (error) {
    console.error("Failed to fetch gallery posts from database:", error);
  }

  return [];
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

  const token = accessToken || (await getValidAccessToken());
  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
): Promise<{ likesCount: number; isLiked: boolean }> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const token = accessToken || (await getValidAccessToken());
  if (!token) {
    throw new Error("Authentication required to like posts.");
  }

  headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/api/gallery/${encodeURIComponent(id)}/like`, {
    method: "POST",
    headers,
  });

  const payload = (await response.json().catch(() => ({}))) as ApiResponse<GalleryPost>;

  if (response.ok && payload.data) {
    return {
      likesCount: Math.max(0, payload.data.likesCount ?? 0),
      isLiked: Boolean(payload.data.isLiked),
    };
  }

  throw new Error(payload.message || "Failed to update like.");
}
