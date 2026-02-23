import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { InsightCard } from "@/components/InsightCard";
import { AnalysisSection } from "@/components/AnalysisSection";
import { ReviewModal } from "@/components/ReviewModal";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;

  const [auth, session] = await Promise.all([
    requireAuth().catch(() => null),
    db.session.findUnique({
      where: { id },
      include: {
        fellow: { select: { id: true, name: true } },
        analysis: true,
        review: {
          include: {
            supervisor: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  if (!auth) return null;
  if (!session) notFound();

  const sessionDate = new Date(session.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar supervisorName={auth.name} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-shamiri-green">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800">Session Detail</span>
        </nav>

        {/* Page Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {session.fellow.name}
              </h1>
              <StatusBadge status={session.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>
                <span className="font-medium text-slate-700">Group:</span>{" "}
                {session.groupId}
              </span>
              <span>
                <span className="font-medium text-slate-700">Date:</span>{" "}
                {sessionDate}
              </span>
              <span>
                <span className="font-medium text-slate-700">Session ID:</span>{" "}
                <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                  {session.id.slice(-8)}
                </code>
              </span>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: Transcript */}
          <div className="lg:col-span-1">
            <div className="card h-fit max-h-[70vh] overflow-auto">
              <div className="sticky top-0 border-b border-slate-200 bg-white px-5 py-3">
                <h2 className="text-sm font-semibold text-slate-700">
                  Session Transcript
                </h2>
              </div>
              <pre className="whitespace-pre-wrap px-5 py-4 font-sans text-xs leading-relaxed text-slate-600">
                {session.transcript}
              </pre>
            </div>
          </div>

          {/* Right column: AI Insight + Review */}
          <div className="space-y-6 lg:col-span-2">
            <AnalysisSection
              sessionId={session.id}
              hasAnalysis={!!session.analysis}
            >
              {session.analysis && (
                <>
                  <InsightCard analysis={session.analysis} />
                  <ReviewModal
                    sessionId={session.id}
                    analysis={session.analysis}
                    existingReview={session.review ?? null}
                    supervisorId={auth.supervisorId}
                  />
                </>
              )}
            </AnalysisSection>
          </div>
        </div>
      </main>
    </div>
  );
}
