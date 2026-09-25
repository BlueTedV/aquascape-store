import Skeleton from "@/components/ui/Skeleton";

export default function ArticlesLoading() {
  return (
    <div className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
      <div className="mx-auto max-w-container">
        {/* Header Skeleton */}
        <div className="mb-stack-lg max-w-2xl space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-96 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        {/* Search & Category Tabs Skeleton */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-12 w-full max-w-lg rounded-xl" />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
            ))}
          </div>
        </div>

        {/* 6 Article Card Skeletons */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-sm space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-5/6 rounded" />
              </div>
              <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                <div className="flex gap-1.5">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-14 rounded" />
                </div>
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
