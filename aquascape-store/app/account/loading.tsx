import Skeleton from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-container px-edge-margin-mobile pb-section-gap-mobile pt-28 md:px-edge-margin-desktop">
      {/* Account Header Skeleton */}
      <div className="mb-stack-lg flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-outline-variant/40 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-10 w-28 rounded" />
      </div>

      {/* Tabs Bar Skeleton */}
      <div className="mb-stack-lg flex gap-3 border-b border-outline-variant/40 pb-3">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Main Account Content Skeleton */}
      <div className="space-y-6">
        <div className="rounded-lg bg-background-white p-6 shadow-soft space-y-4">
          <div className="flex justify-between items-center border-b border-outline-variant/40 pb-4">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Delivery Card Skeletons */}
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-outline-variant/40 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-3.5 w-48" />
                </div>
                <Skeleton className="h-6 w-28" />
              </div>

              {/* Stepper skeleton */}
              <div className="py-4">
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <Skeleton className="h-12 w-12 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
