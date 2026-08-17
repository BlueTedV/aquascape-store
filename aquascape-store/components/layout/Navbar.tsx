"use client";

import { FocusEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getCurrentAccount, getStoredSession } from "@/lib/api/auth";

const navLinks: Array<{ label: string; href: string; category?: string }> = [
  { label: "Home", href: "/" },
  { label: "Plants", href: "/shop?category=plants", category: "plants" },
  { label: "Hardscape", href: "/shop?category=hardscape", category: "hardscape" },
  { label: "Fish", href: "/shop?category=fish", category: "fish" },
  { label: "Shrimp", href: "/shop?category=shrimp", category: "shrimp" },
  { label: "Equipment", href: "/shop?category=equipment", category: "equipment" },
  { label: "Community", href: "/community" },
  { label: "Others", href: "/shop?category=others", category: "others" },
];


export default function Navbar({ activeCategory }: { activeCategory?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { itemCount } = useCart();

  useEffect(() => {
    let mounted = true;

    if (!getStoredSession()?.accessToken) {
      window.queueMicrotask(() => {
        if (mounted) setIsAdmin(false);
      });

      return () => {
        mounted = false;
      };
    }

    getCurrentAccount()
      .then((account) => {
        if (mounted) setIsAdmin(account.isAdmin);
      })
      .catch(() => {
        if (mounted) setIsAdmin(false);
      });

    return () => {
      mounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;

    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [searchOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchOpen) {
      setSearchOpen(true);
      return;
    }

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      searchInputRef.current?.focus();
      return;
    }

    router.push(`/shop?q=${encodeURIComponent(trimmedQuery)}`);
    setSearchOpen(false);
    searchInputRef.current?.blur();
  };

  const closeSearchOnBlur = (event: FocusEvent<HTMLFormElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setSearchOpen(false);
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <nav className="glass-nav fixed top-0 z-50 w-full shadow-md transition-colors duration-300">
      <div className="mx-auto flex max-w-container items-center justify-between px-edge-margin-mobile py-stack-sm md:px-edge-margin-desktop">
        <Link
          href="/"
          className="font-display text-headline-md font-bold text-primary"
        >
          AQUAKU SHOP
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
          {isAdmin && (
            <Link
              href="/manage"
              className={`font-sans text-body-md transition-colors duration-200 ${
                pathname === "/manage"
                  ? "border-b-2 border-primary pb-1 text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Manage
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <form
            onSubmit={submitSearch}
            onBlur={closeSearchOnBlur}
            className="hidden items-center sm:flex"
          >
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                searchOpen ? "mr-1 w-44 opacity-100 lg:w-56" : "mr-0 w-0 opacity-0"
              }`}
            >
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products..."
                tabIndex={searchOpen ? 0 : -1}
                className="w-full rounded bg-surface-container-low px-3 py-2 text-body-md text-on-surface outline-none ring-primary transition-all focus:ring-1"
              />
            </div>
            <button
              type="submit"
              aria-label="Search"
              onClick={() => {
                if (!searchOpen) setSearchOpen(true);
              }}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary"
            >
              <Search size={20} />
            </button>
          </form>
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
            onClick={() => setMobileOpen((value) => !value)}
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
          {isAdmin && (
            <Link
              href="/manage"
              onClick={() => setMobileOpen(false)}
              className="rounded px-2 py-2 font-sans text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            >
              Manage
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}