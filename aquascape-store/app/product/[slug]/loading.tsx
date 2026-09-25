import Skeleton from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-surface-container-low pb-section-gap-mobile pt-24 md:pb-section-gap md:pt-28">
      <div className="mx-auto max-w-container px-edge-margin-mobile md:px-edge-margin-desktop">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <span className="text-outline-variant/60">/</span>
          <Skeleton className="h-4 w-16" />
          <span className="text-outline-variant/60">/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        {/* 2-Column Product Detail Layout */}
        <div className="grid gap-gutter lg:grid-cols-2">
          {/* Left: Gallery & Image Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl shadow-soft" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 shrink-0 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Right: Info, Price, Actions Skeleton */}
          <div className="rounded-2xl bg-background-white p-stack-md shadow-soft sm:p-stack-lg space-y-stack-md">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <Skeleton className="h-10 w-3/4" />

            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="border-y border-outline-variant/40 py-4 space-y-2">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-4 w-28" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-12 flex-1 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Specs Table Skeleton */}
            <div className="mt-6 rounded-xl bg-surface-container-low p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <div className="mt-16 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-background-white p-3 space-y-3 shadow-soft">
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
