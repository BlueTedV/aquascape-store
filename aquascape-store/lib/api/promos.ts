import { authenticatedRequest } from "./auth";

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
