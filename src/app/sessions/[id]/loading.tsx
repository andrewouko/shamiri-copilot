import { InsightCardSkeleton } from "@/components/InsightCardSkeleton";

export default function SessionDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar skeleton */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 h-4 w-40 animate-pulse rounded bg-slate-200" />

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 flex gap-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Transcript skeleton */}
          <div className="card h-fit max-h-[70vh] overflow-hidden lg:col-span-1">
            <div className="border-b border-slate-200 px-5 py-3">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="space-y-2 px-5 py-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 animate-pulse rounded bg-slate-100"
                  style={{ width: `${60 + (i % 5) * 8}%` }}
                />
              ))}
            </div>
          </div>

          {/* Insight card skeleton */}
          <div className="space-y-6 lg:col-span-2">
            <InsightCardSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}