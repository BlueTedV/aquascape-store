import { getAccessToken, authenticatedRequest } from "@/lib/api/auth";

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  courier: string;
  shippingCost: number;
  paymentMethod: string;
  paymentStatus: "unpaid" | "paid" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  subtotal: number;
  totalAmount: number;
  trackingNumber?: string | null;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  midtransSnapToken?: string;
  midtransRedirectUrl?: string;
}

export interface CheckoutPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  courier: string;
  shippingCost?: number;
  paymentMethod: string;
  notes?: string;
  items: Array<{
    id?: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    quantity: number;
  }>;
}

const API_URL = (process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? process.env.AQUAKU_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function createCheckoutOrder(payload: CheckoutPayload): Promise<Order> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/orders/checkout`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to process checkout order.");
  }

  return data.data;
}

export async function getUserOrders(): Promise<Order[]> {
  try {
    return await authenticatedRequest<Order[]>("/api/account/orders");
  } catch (error) {
    console.error("Failed to fetch user orders", error);
    return [];
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderNumber)}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch order", error);
    return null;
  }
}

export async function getAdminOrders(status?: string): Promise<Order[]> {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await fetch(`${API_URL}/api/admin/orders${query}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch admin orders", error);
    return [];
  }
}

export async function updateOrderStatus(
  id: string,
  status: string,
  paymentStatus?: string,
  trackingNumber?: string | null,
): Promise<Order> {
  const response = await fetch(`${API_URL}/api/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status, paymentStatus, trackingNumber }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update order status.");
  }

  return data.data;
}

export async function deleteAllAdminOrders(passcode: string): Promise<{ message: string }> {
  return authenticatedRequest<{ message: string }>("/api/admin/orders", {
    method: "DELETE",
    body: JSON.stringify({ passcode }),
  });
}
