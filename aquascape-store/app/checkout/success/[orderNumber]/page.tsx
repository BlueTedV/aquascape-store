export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OrderSuccessView from "@/components/checkout/OrderSuccessView";
import { getOrderByNumber } from "@/lib/api/orders";

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({ params }: OrderSuccessPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order Confirmation #${orderNumber} | Aquaku Shop`,
  };
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low">
        <OrderSuccessView order={order} />
      </main>
      <Footer />
    </>
  );
}
