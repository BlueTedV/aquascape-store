import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/api/orders";
import OrderInvoiceModal from "@/components/order/OrderInvoiceModal";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Invoice #${orderNumber} | Aquaku Shop`,
    description: `Official receipt and invoice for order #${orderNumber}.`,
  };
}

export default async function OrderInvoicePage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-between no-print">
          <Link
            href="/account"
            className="text-xs font-bold text-gray-600 hover:text-primary transition-colors"
          >
            &larr; Back to My Orders
          </Link>
          <span className="text-xs text-gray-500 font-mono">Invoice #{order.orderNumber}</span>
        </div>

        <OrderInvoiceModal
          order={order}
          isOpen={true}
          onClose={() => {
            if (typeof window !== "undefined") {
              window.history.back();
            }
          }}
        />
      </div>
    </div>
  );
}
