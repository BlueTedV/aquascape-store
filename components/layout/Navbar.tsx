"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const navLinks: Array<{ label: string; href: string; category?: string }> = [
  { label: "Home", href: "/" },
  { label: "Plants", href: "/shop?category=plants", category: "plants" },
  { label: "Hardscape", href: "/shop?category=hardscape", category: "hardscape" },
  { label: "Fish", href: "/shop?category=fish", category: "fish" },
  { label: "Shrimp", href: "/shop?category=shrimp", category: "shrimp" },
  { label: "Equipment", href: "/shop?category=equipment", category: "equipment" },
  { label: "Others", href: "/shop?category=others", category: "others" },
];

export default function Navbar({ activeCategory }: { activeCategory?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <nav className="glass-nav fixed top-0 z-50 w-full shadow-md transition-colors duration-300">
      <div className="mx-auto flex max-w-container items-center justify-between px-edge-margin-mobile py-stack-sm md:px-edge-margin-desktop">
        <Link
          href="/"
          className="font-display text-headline-md font-bold text-primary"
        >
          AQUA STUDIO
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === "/shop" && activeCategory === link.category;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-body-md transition-colors duration-200 ${
                  isActive
                    ? "border-b-2 border-primary pb-1 text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <div className="hidden items-center sm:flex">
            {searchOpen && (
              <input
                autoFocus
                type="search"
                placeholder="Search products..."
                className="mr-1 w-40 rounded bg-surface-container-low px-3 py-2 text-body-md text-on-surface outline-none ring-primary transition-all focus:w-56 focus:ring-1 lg:w-52 lg:focus:w-64"
                onBlur={() => setSearchOpen(false)}
              />
            )}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary"
            >
              <Search size={20} />
            </button>
          </div>
          <button
            type="button"
            aria-label="Wishlist"
            className="hidden rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary sm:inline-flex"
          >
            <Heart size={20} />
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-on-primary">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary sm:inline-flex"
          >
            <User size={20} />
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="glass-nav flex flex-col gap-1 border-t border-outline-variant/30 px-edge-margin-mobile py-stack-md md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded px-2 py-2 font-sans text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}