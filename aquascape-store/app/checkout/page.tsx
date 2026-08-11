import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout | Aquaku Shop",
  description: "Complete your purchase of premium aquascaping plants, hardscape, and equipment.",
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-surface-container-low">
        <CheckoutView />
      </main>
      <Footer />
    </>
  );
}
