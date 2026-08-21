"use client";

import { FocusEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { getCurrentAccount, getStoredSession } from "@/lib/api/auth";

const shopCategories = [
  { label: "All Products", href: "/shop", category: undefined },
  { label: "Aquatic Plants", href: "/shop?category=plants", category: "plants" },
  { label: "Hardscape Stones & Wood", href: "/shop?category=hardscape", category: "hardscape" },
  { label: "Ornamental Fish", href: "/shop?category=fish", category: "fish" },
  { label: "Dwarf Shrimp", href: "/shop?category=shrimp", category: "shrimp" },
  { label: "Equipment & Tools", href: "/shop?category=equipment", category: "equipment" },
  { label: "Others & Fertilizers", href: "/shop?category=others", category: "others" },
];

export default function Navbar({ activeCategory }: { activeCategory?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  // Close shop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target as Node)) {
        setShopDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdowns on route change safely using microtask
  useEffect(() => {
    let mounted = true;
    window.queueMicrotask(() => {
      if (mounted) {
        setShopDropdownOpen(false);
        setMobileOpen(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [pathname]);

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

  /**
   * Handle clicking the "Shop" navbar button:
   * 1. If dropdown is closed -> open dropdown
   * 2. If dropdown is already open -> navigate to /shop (no category) and close dropdown
   */
  const handleShopButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (shopDropdownOpen) {
      setShopDropdownOpen(false);
      router.push("/shop");
    } else {
      setShopDropdownOpen(true);
    }
  };

  const isShopActive = pathname.startsWith("/shop") || pathname.startsWith("/product");

  return (
    <nav className="glass-nav fixed top-0 z-50 w-full shadow-md transition-colors duration-300">
      <div className="mx-auto flex max-w-container items-center justify-between px-edge-margin-mobile py-stack-sm md:px-edge-margin-desktop">
        <Link
          href="/"
          className="font-display text-headline-md font-bold text-primary tracking-tight"
        >
          AQUAKU SHOP
        </Link>

        {/* Compact Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:gap-8 md:flex">
          {/* 1. Home */}
          <Link
            href="/"
            className={`font-sans text-body-md transition-colors duration-200 ${
              pathname === "/"
                ? "border-b-2 border-primary pb-1 text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Home
          </Link>

          {/* 2. Shop Dropdown */}
          <div ref={shopDropdownRef} className="relative">
            <button
              type="button"
              onClick={handleShopButtonClick}
              className={`flex items-center gap-1.5 font-sans text-body-md transition-colors duration-200 ${
                isShopActive
                  ? "border-b-2 border-primary pb-1 text-primary font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              aria-expanded={shopDropdownOpen}
              aria-haspopup="true"
            >
              <span>Shop</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  shopDropdownOpen ? "rotate-180 text-primary" : "text-on-surface-variant"
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {shopDropdownOpen && (
              <div className="absolute left-0 top-full mt-3 w-64 rounded-xl border border-outline-variant/60 bg-background-white/95 p-2 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Store Categories
                </div>
                <div className="space-y-1">
                  {shopCategories.map((item) => {
                    const isSelected =
                      item.category === undefined
                        ? pathname === "/shop" && !activeCategory
                        : activeCategory === item.category;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShopDropdownOpen(false)}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-on-surface hover:bg-surface-container-low hover:text-primary"
                        }`}
                      >
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Tank Calculator */}
          <Link
            href="/calculator"
            className={`font-sans text-body-md transition-colors duration-200 ${
              pathname === "/calculator"
                ? "border-b-2 border-primary pb-1 text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Calculator
          </Link>

          {/* 4. Community */}
          <Link
            href="/community"
            className={`font-sans text-body-md transition-colors duration-200 ${
              pathname === "/community"
                ? "border-b-2 border-primary pb-1 text-primary font-bold"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            Community
          </Link>

          {/* 5. Admin Manage */}
          {isAdmin && (
            <Link
              href="/manage"
              className={`font-sans text-body-md transition-colors duration-200 ${
                pathname === "/manage"
                  ? "border-b-2 border-primary pb-1 text-primary font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Manage
            </Link>
          )}
        </div>

        {/* Right Icon Actions */}
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

          {/* Wishlist Link with Counter */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative hidden rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary sm:inline-flex"
          >
            <Heart size={20} className={wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link with Counter */}
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

          {/* Account Link */}
          <Link
            href="/account"
            aria-label="Account"
            className="hidden rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary sm:inline-flex"
          >
            <User size={20} />
          </Link>

          {/* Mobile Menu Hamburger */}
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

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="glass-nav flex flex-col gap-1 border-t border-outline-variant/30 px-edge-margin-mobile py-stack-md md:hidden">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="rounded px-2 py-2 font-sans text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
          >
            Home
          </Link>

          {/* Mobile Shop Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setMobileShopOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded px-2 py-2 font-sans text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            >
              <span>Shop Catalog</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${mobileShopOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileShopOpen && (
              <div className="ml-3 my-1 space-y-1 border-l-2 border-primary/20 pl-3">
                {shopCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 text-xs text-on-surface-variant hover:text-primary"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/calculator"
            onClick={() => setMobileOpen(false)}
            className="rounded px-2 py-2 font-sans text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
          >
            Calculator
          </Link>

          <Link
            href="/community"
            onClick={() => setMobileOpen(false)}
            className="rounded px-2 py-2 font-sans text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
          >
            Community
          </Link>

          <div className="my-1 border-t border-outline-variant/30 pt-1">
            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded px-2 py-2 font-sans text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            >
              <span className="flex items-center gap-2">
                <Heart size={18} className={wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
                <span>My Wishlist</span>
              </span>
              {wishlistCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded px-2 py-2 font-sans text-body-md text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            >
              <User size={18} />
              <span>My Account</span>
            </Link>
          </div>

          {isAdmin && (
            <Link
              href="/manage"
              onClick={() => setMobileOpen(false)}
              className="rounded px-2 py-2 font-sans text-body-md text-primary font-bold hover:bg-surface-container-low"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}