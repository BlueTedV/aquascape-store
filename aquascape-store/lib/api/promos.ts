import { authenticatedRequest } from "./auth";

const API_URL = (process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export type PromoVoucher = {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  maxDiscount: number;
  minSubtotal: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
};

/** Fetches active promos from the public endpoint (no auth required). */
export async function getPublicPromos(): Promise<PromoVoucher[]> {
  try {
    const response = await fetch(`${API_URL}/api/promos`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300, tags: ["promos"] },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data: PromoVoucher[] };
    return Array.isArray(payload.data) ? payload.data : [];
  } catch {
    return [];
  }
}

export async function getAdminPromos(): Promise<PromoVoucher[]> {
  return authenticatedRequest<PromoVoucher[]>("/api/admin/promos");
}

export async function createPromo(payload: {
  code: string;
  name: string;
  type: "percentage" | "fixed" | "shipping";
  value: number;
  maxDiscount?: number;
  minSubtotal?: number;
  description: string;
}): Promise<PromoVoucher> {
  return authenticatedRequest<PromoVoucher>("/api/admin/promos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deletePromo(id: string): Promise<boolean> {
  await authenticatedRequest<{ deleted: boolean }>(`/api/admin/promos/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return true;
}
