import Skeleton from "@/components/ui/Skeleton";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-container px-edge-margin-mobile pb-section-gap-mobile pt-24 md:px-edge-margin-desktop md:pt-28">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-64" />
      </div>

      <div className="grid gap-gutter lg:grid-cols-[1fr_420px]">
        {/* Left Column: Form Fields Skeleton */}
        <div className="space-y-6">
          <div className="rounded-lg bg-background-white p-6 shadow-soft space-y-4">
            <Skeleton className="h-6 w-44" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-11 w-full rounded" />
              <Skeleton className="h-11 w-full rounded" />
            </div>
            <Skeleton className="h-11 w-full rounded" />
          </div>

          <div className="rounded-lg bg-background-white p-6 shadow-soft space-y-4">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-20 w-full rounded" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-11 w-full rounded" />
              <Skeleton className="h-11 w-full rounded" />
              <Skeleton className="h-11 w-full rounded" />
            </div>
          </div>

          <div className="rounded-lg bg-background-white p-6 shadow-soft space-y-4">
            <Skeleton className="h-6 w-44" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Skeleton */}
        <div className="rounded-lg bg-background-white p-6 shadow-soft space-y-4 h-fit">
          <Skeleton className="h-6 w-36" />
          <div className="space-y-3 border-y border-outline-variant/40 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="h-14 w-14 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3.5 w-1/3" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex justify-between pt-2 border-t border-outline-variant/40">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>

          <Skeleton className="h-12 w-full rounded-lg mt-4" />
        </div>
      </div>
    </div>
  );
}
