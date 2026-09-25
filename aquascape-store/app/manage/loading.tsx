import Skeleton from "@/components/ui/Skeleton";

export default function ManageLoading() {
  return (
    <div className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
      <div className="mx-auto max-w-container space-y-stack-lg">
        {/* Top Admin Navigation Tabs Skeleton */}
        <div className="mb-stack-lg flex gap-4 overflow-x-auto border-b border-outline-variant/60 pb-1">
          <Skeleton className="h-10 w-44 rounded-t-lg" />
          <Skeleton className="h-10 w-44 rounded-t-lg" />
          <Skeleton className="h-10 w-44 rounded-t-lg" />
          <Skeleton className="h-10 w-44 rounded-t-lg" />
        </div>

        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <Skeleton className="h-8 w-32 rounded" />
        </div>

        {/* 4 Metric Cards Grid Skeleton */}
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-outline-variant/40 bg-background-white p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>

        {/* 2 Panels Skeleton */}
        <div className="grid gap-gutter lg:grid-cols-2">
          <div className="rounded-xl bg-background-white p-6 shadow-soft space-y-4">
            <Skeleton className="h-5 w-48" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-background-white p-6 shadow-soft space-y-4">
            <Skeleton className="h-5 w-44" />
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
