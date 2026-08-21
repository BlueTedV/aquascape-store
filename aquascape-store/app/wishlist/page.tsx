import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WishlistView from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "My Wishlist & Saved Products | Aquaku Shop",
  description: "View and manage your saved aquatic plants, hardscape stones, and aquascaping equipment.",
};

export default function WishlistPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low">
        <WishlistView />
      </main>
      <Footer />
    </>
  );
}
