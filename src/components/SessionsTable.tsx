"use client";

import Link from "next/link";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { StatusBadge } from "./StatusBadge";

interface SessionRow {
  id: string;
  groupId: string;
  date: Date;
  status: string;
  fellow: { name: string };
  analysis: {
    riskFlag: string;
    contentScore: number;
    facilitationScore: number;
    safetyScore: number;
  } | null;
  review: { decision: string } | null;
}

interface Props {
  sessions: SessionRow[];
}

export function SessionsTable({ sessions }: Readonly<Props>) {
  if (sessions.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-slate-400">
        No sessions found. Seed your database to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left">
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fellow
            </th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Group
            </th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date
            </th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Scores
            </th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Risk
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SessionRow({ session }: Readonly<{ session: SessionRow }>) {
  const date = new Date(session.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isRisk = session.analysis?.riskFlag === "RISK";

  return (
    <tr
      className={`transition hover:bg-slate-50 ${isRisk ? "bg-red-50/50" : ""}`}
    >
      <td className="px-6 py-4 font-medium text-slate-800">
        {session.fellow.name}
        {isRisk && (
          <span className="ml-2 inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">
            <ExclamationTriangleIcon className="h-3 w-3" />
            RISK
          </span>
        )}
      </td>
      <td className="px-6 py-4 text-slate-600">{session.groupId}</td>
      <td className="px-6 py-4 text-slate-500">{date}</td>
      <td className="px-6 py-4">
        <StatusBadge status={session.status} size="sm" />
      </td>
      <td className="px-6 py-4">
        {session.analysis ? (
          <div className="flex gap-1">
            <ScoreDot score={session.analysis.contentScore} label="C" />
            <ScoreDot score={session.analysis.facilitationScore} label="F" />
            <ScoreDot score={session.analysis.safetyScore} label="S" />
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-6 py-4">
        {session.analysis ? (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              isRisk
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isRisk ? "RISK" : "SAFE"}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-6 py-4">
        <Link
          href={`/sessions/${session.id}`}
          className="text-xs font-medium text-shamiri-green hover:underline"
        >
          Review →
        </Link>
      </td>
    </tr>
  );
}

function ScoreDot({ score, label }: Readonly<{ score: number; label: string }>) {
  const colours = {
    1: "bg-red-100 text-red-700",
    2: "bg-amber-100 text-amber-700",
    3: "bg-green-100 text-green-700",
  };
  return (
    <span
      title={label}
      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${colours[score as 1 | 2 | 3] ?? "bg-slate-100 text-slate-500"}`}
    >
      {score}
    </span>
  );
}
