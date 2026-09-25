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
  discountAmount?: number;
  voucherCode?: string | null;
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
  discountAmount?: number;
  voucherCode?: string;
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

export interface VoucherResult {
  code: string;
  type: "percentage" | "fixed" | "shipping";
  discountAmount: number;
  description: string;
}

/**
 * Orders & Checkout Client API.
 *
 * Facilitates voucher validation, order creation, customer order history retrieval,
 * and administrative status management with the Laravel backend.
 */

const API_URL = (process.env.NEXT_PUBLIC_AQUAKU_API_URL ?? process.env.AQUAKU_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

export async function validateVoucher(code: string, subtotal: number, shippingCost = 0): Promise<VoucherResult> {
  const response = await fetch(`${API_URL}/api/vouchers/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ code, subtotal, shippingCost }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Invalid or expired voucher code.");
  }

  return data.data;
}

/**
 * Submit checkout payload to create an order.
 *
 * Automatically includes the user's Bearer token if currently authenticated,
 * linking the newly created order with the customer's account history.
 */
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
    const query = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    return await authenticatedRequest<Order[]>(`/api/admin/orders${query}`);
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
  return authenticatedRequest<Order>(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, paymentStatus, trackingNumber }),
  });
}

export async function deleteAllAdminOrders(passcode: string): Promise<{ message: string }> {
  return authenticatedRequest<{ message: string }>("/api/admin/orders", {
    method: "DELETE",
    body: JSON.stringify({ passcode }),
  });
}

export async function cancelCustomerOrder(orderNumber: string): Promise<{ message: string; order: Order }> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderNumber)}/cancel`, {
    method: "POST",
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to cancel order.");
  }

  return data.data;
}

export async function getSnapTokenForOrder(orderNumber: string): Promise<{ orderNumber: string; snapToken: string; redirectUrl: string }> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderNumber)}/pay`, {
    method: "POST",
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to initiate payment.");
  }

  return data.data;
}

