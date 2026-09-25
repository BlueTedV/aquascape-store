"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Calculator, Heart, User } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount: wishlistCount } = useWishlist();

  // Hide persistent bottom navigation on checkout and product detail pages to prevent button clash
  if (pathname.startsWith("/checkout") || pathname.startsWith("/product")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Shop",
      href: "/shop",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/shop") || pathname.startsWith("/product"),
    },
    {
      label: "Calculator",
      href: "/calculator",
      icon: Calculator,
      isActive: pathname.startsWith("/calculator"),
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      isActive: pathname.startsWith("/wishlist"),
      badge: wishlistCount > 0 ? (wishlistCount > 99 ? "99+" : wishlistCount) : undefined,
    },
    {
      label: "Account",
      href: "/account",
      icon: User,
      isActive:
        pathname.startsWith("/account") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/manage"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/30 bg-background-white/95 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-300 md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
                active ? "text-primary font-bold" : "text-on-surface-variant/70 hover:text-primary"
              }`}
            >
              {/* Active subtle pill highlight */}
              {active && (
                <span className="absolute -top-1.5 h-1 w-8 rounded-full bg-primary animate-in fade-in zoom-in-50 duration-200" />
              )}

              <div className="relative flex h-6 w-6 items-center justify-center">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.4 : 1.9}
                  className={`transition-transform duration-200 ${active ? "scale-110" : ""}`}
                />
                {item.badge && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`mt-1 text-[11px] leading-tight ${active ? "font-bold text-primary" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
