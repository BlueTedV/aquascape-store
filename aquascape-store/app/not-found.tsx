import Link from "next/link";
import { Compass, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 shadow-soft">
        <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-tertiary">
            Error 404
          </span>
          <h1 className="font-display text-headline-lg font-bold text-on-surface">
            Page Not Found
          </h1>
          <p className="text-body-md text-on-surface-variant">
            The page, product, or resource you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-medium text-sm transition-colors shadow-soft"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Shop
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-medium text-sm transition-colors border border-outline-variant"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
