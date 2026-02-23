import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { SessionsTable } from "@/components/SessionsTable";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [auth, sessions] = await Promise.all([
    requireAuth().catch(() => null),
    db.session.findMany({
      orderBy: { date: "desc" },
      include: {
        fellow: { select: { id: true, name: true } },
        analysis: {
          select: {
            riskFlag: true,
            contentScore: true,
            facilitationScore: true,
            safetyScore: true,
          },
        },
        review: {
          select: { decision: true },
        },
      },
    }),
  ]);

  if (!auth) return null;

  const stats = {
    total: sessions.length,
    pending: sessions.filter((s) => s.status === "PENDING").length,
    flagged: sessions.filter((s) => s.status === "FLAGGED").length,
    reviewed: sessions.filter(
      (s) => s.status === "SAFE" || s.status === "REVIEWED",
    ).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar supervisorName={auth.name} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Session Review Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review AI-analysed therapy sessions conducted by Shamiri Fellows in
            your cohort.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Sessions" value={stats.total} color="slate" />
          <StatCard
            label="Awaiting Review"
            value={stats.pending}
            color="amber"
          />
          <StatCard
            label="Flagged for Review"
            value={stats.flagged}
            color="red"
            urgent={stats.flagged > 0}
          />
          <StatCard label="Reviewed" value={stats.reviewed} color="green" />
        </div>

        {/* Sessions table */}
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Completed Sessions</h2>
          </div>
          <SessionsTable sessions={sessions} />
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  urgent,
}: Readonly<{
  label: string;
  value: number;
  color: "slate" | "amber" | "red" | "green";
  urgent?: boolean;
}>) {
  const colours = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };

  const colorMap: Record<string, string> = {
    red: "text-red-600",
    amber: "text-amber-600",
    green: "text-green-700",
    slate: "text-slate-800",
  };

  return (
    <div
      className={`card flex flex-col p-5 ${urgent ? "ring-2 ring-red-400" : ""}`}
    >
      <span
        className={`text-xs font-medium uppercase tracking-wide ${colours[color].split(" ")[1]}`}
      >
        {label}
      </span>
      <span className={`mt-2 text-3xl font-bold ${colorMap[color]}`}>{value}</span>
      {urgent && (
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-500">
          <ExclamationTriangleIcon className="h-3.5 w-3.5" />
          Needs urgent attention
        </span>
      )}
    </div>
  );
}
