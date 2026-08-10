import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Cart | Aquaku Shop",
  description:
    "Review the plants, hardscape, and equipment in your Aquaku Shop cart before checkout.",
};

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low">
        <CartView />
      </main>
      <Footer />
    </>
  );
}
