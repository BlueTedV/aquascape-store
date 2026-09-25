import Skeleton from "@/components/ui/Skeleton";

export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-surface-container-low px-edge-margin-mobile pb-section-gap-mobile pt-32 md:px-edge-margin-desktop">
      <div className="mx-auto max-w-container">
        {/* Header Skeleton */}
        <div className="mb-stack-lg max-w-2xl space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-96 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/40 pb-4 mb-6">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Masonry Skeletons */}
        <div className="columns-1 gap-gutter sm:columns-2 lg:columns-3">
          {[
            "aspect-[4/5]",
            "aspect-square",
            "aspect-[4/3]",
            "aspect-square",
            "aspect-[4/5]",
            "aspect-[4/3]",
          ].map((aspect, i) => (
            <div
              key={i}
              className="mb-gutter break-inside-avoid overflow-hidden rounded-xl bg-background-white p-3 shadow-soft space-y-3"
            >
              <Skeleton className={`w-full ${aspect} rounded-lg`} />
              <div className="flex justify-between items-center px-1">
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-7 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
