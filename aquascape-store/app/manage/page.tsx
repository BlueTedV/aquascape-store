import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ManageProductsView from "@/components/admin/ManageProductsView";

export const metadata: Metadata = {
  title: "Manage Products | Aquaku Shop",
  description: "Admin product management for Aquaku Shop.",
};

export default function ManagePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
        <ManageProductsView />
      </main>
      <Footer />
    </>
  );
}