import Skeleton from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Top Navbar Placeholder */}
      <div className="h-16 w-full border-b border-outline-variant/30 bg-background-white" />

      {/* Hero Shimmer */}
      <div className="h-[420px] w-full bg-inverse-surface/80 flex items-center">
        <div className="mx-auto w-full max-w-container px-edge-margin-mobile md:px-edge-margin-desktop space-y-4">
          <Skeleton className="h-4 w-32 bg-white/20" />
          <Skeleton className="h-12 w-[480px] max-w-full bg-white/20" />
          <Skeleton className="h-4 w-80 max-w-full bg-white/20" />
          <Skeleton className="h-11 w-44 rounded bg-white/30" />
        </div>
      </div>

      {/* Section Grid Placeholder */}
      <div className="mx-auto max-w-container px-edge-margin-mobile py-16 md:px-edge-margin-desktop space-y-12">
        <div className="space-y-3 text-center flex flex-col items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-background-white p-4 space-y-3 shadow-soft">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
