import { Suspense } from "react";
import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { ToastProvider } from "@/lib/toast-context";
import AuthHashHandler from "@/components/auth/AuthHashHandler";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PromoBanner from "@/components/layout/PromoBanner";
import ToastContainer from "@/components/ui/ToastContainer";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
  fallback: ["Poppins", "system-ui", "sans-serif"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["Inter", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Aquaku Shop | Premium Aquascaping & Biological Integrity",
  description:
    "Premium aquatic plants, hardscape, fish, shrimp, and professional aquascaping equipment for the modern hobbyist. Shipping across Indonesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${poppins.variable} ${inter.variable}`}>
      <body className="has-mobile-nav">
        <Suspense fallback={null}>
          <AuthHashHandler />
        </Suspense>
        <ToastProvider>
          <CartProvider>
            <WishlistProvider>
              {/* <PromoBanner /> */}{/* Temporarily disabled — overlaps with fixed navbar */}
              {children}
              <MobileBottomNav />
              <ToastContainer />
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
