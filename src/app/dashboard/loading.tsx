export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar skeleton */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-200" />
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card flex flex-col p-5">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-8 w-12 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-6 py-4">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
