import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
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
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
