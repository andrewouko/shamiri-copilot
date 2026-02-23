function ShimmerBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

export function InsightCardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Main card skeleton */}
      <div className="card p-6">
        {/* Header row */}
        <div className="mb-5 flex items-center justify-between">
          <ShimmerBlock className="h-5 w-36" />
          <div className="flex items-center gap-3">
            <ShimmerBlock className="h-6 w-16 rounded-full" />
            <ShimmerBlock className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Summary block */}
        <div className="mb-6 space-y-2 rounded-lg bg-slate-50 p-4">
          <ShimmerBlock className="h-3 w-28" />
          <ShimmerBlock className="h-3 w-full" />
          <ShimmerBlock className="h-3 w-5/6" />
          <ShimmerBlock className="h-3 w-2/3" />
        </div>

        {/* Metric rows x3 */}
        <div className="space-y-4">
          <ShimmerBlock className="h-3 w-36" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <ShimmerBlock className="h-3 w-32" />
                  <ShimmerBlock className="h-2 w-48" />
                </div>
                <ShimmerBlock className="h-10 w-10 flex-shrink-0 rounded-full" />
              </div>
              <ShimmerBlock className="h-1.5 w-full rounded-full" />
              <ShimmerBlock className="h-2 w-full" />
              <ShimmerBlock className="h-2 w-4/5" />
            </div>
          ))}
        </div>

        {/* Footer chips */}
        <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          {[0, 1, 2, 3].map((i) => (
            <ShimmerBlock key={i} className="h-5 w-20" />
          ))}
        </div>
      </div>
    </div>
  );
}