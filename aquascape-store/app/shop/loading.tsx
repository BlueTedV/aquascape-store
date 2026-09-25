import Skeleton from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="bg-surface-container-low min-h-screen">
      {/* Top Navbar spacer */}
      <div className="h-16 w-full border-b border-outline-variant/30 bg-background-white" />

      {/* Hero Banner Skeleton */}
      <div className="relative h-[340px] sm:h-[380px] w-full bg-inverse-surface/90 overflow-hidden flex items-end">
        <div className="mx-auto w-full max-w-container px-edge-margin-mobile pb-10 md:px-edge-margin-desktop space-y-4">
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-10 w-96 max-w-full bg-white/20" />
          <Skeleton className="h-4 w-80 max-w-full bg-white/20" />
          <Skeleton className="h-11 w-44 rounded bg-white/30" />
        </div>
      </div>

      {/* Category Pills Bar Skeleton */}
      <div className="sticky top-[60px] z-30 border-b border-outline-variant/40 bg-background-white/95 px-edge-margin-mobile py-3.5 backdrop-blur md:px-edge-margin-desktop">
        <div className="mx-auto flex max-w-container gap-3 overflow-x-auto no-scrollbar">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full bg-surface-container-high" />
          ))}
        </div>
      </div>

      {/* Main Content Layout Skeleton */}
      <div className="mx-auto max-w-container px-edge-margin-mobile py-stack-lg md:px-edge-margin-desktop">
        <div className="grid gap-gutter lg:grid-cols-[240px_1fr]">
          {/* Aside Sidebar Skeleton */}
          <aside className="hidden lg:block rounded-lg bg-background-white p-stack-md shadow-soft space-y-stack-lg h-fit">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
              <Skeleton className="h-5 w-24" />
            </div>

            {/* Collections list */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <div className="space-y-1.5 pt-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded" />
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full rounded" />
              <div className="flex justify-between pt-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-20" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-16" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <div>
            {/* Search bar & Sort bar */}
            <div className="mb-stack-md space-y-stack-md">
              <Skeleton className="h-12 w-full rounded-lg" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-9 w-36 rounded" />
              </div>
            </div>

            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-lg bg-background-white shadow-soft"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3.5 w-10" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-1.5 pt-2">
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-4">
                      <Skeleton className="h-6 w-28" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
