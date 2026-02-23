import { ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/20/solid";

interface Analysis {
  id: string;
  summary: string;
  contentScore: number;
  contentRating: string;
  contentJustification: string;
  facilitationScore: number;
  facilitationRating: string;
  facilitationJustification: string;
  safetyScore: number;
  safetyRating: string;
  safetyJustification: string;
  riskFlag: string;
  riskQuote: string | null;
  riskExplanation: string | null;
  aiModel: string;
  promptVersion: string;
  inputTokens: number;
  outputTokens: number;
  createdAt: Date;
}

interface Props {
  analysis: Analysis;
}

export function InsightCard({ analysis }: Readonly<Props>) {
  const isRisk = analysis.riskFlag === "RISK";
  const overallScore = (
    (analysis.contentScore + analysis.facilitationScore + analysis.safetyScore) /
    3
  ).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Risk Alert — shown prominently at top when RISK */}
      {isRisk && (
        <div className="card border-l-4 border-red-500 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="font-bold text-red-800">
                Risk Indicator Detected
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {analysis.riskExplanation}
              </p>
              {analysis.riskQuote && (
                <blockquote className="mt-3 rounded-md border-l-2 border-red-400 bg-red-100/60 px-3 py-2 text-xs italic text-red-800">
                  &ldquo;{analysis.riskQuote}&rdquo;
                </blockquote>
              )}
              <p className="mt-2 text-xs font-medium text-red-600">
                Please review this session immediately and follow Shamiri's
                escalation protocol.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Insight Card */}
      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">AI Session Insight</h2>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${
                isRisk
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isRisk ? (
                <><ExclamationTriangleIcon className="h-3.5 w-3.5" /> RISK</>
              ) : (
                <><CheckCircleIcon className="h-3.5 w-3.5" /> SAFE</>
              )}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
              {overallScore} / 3.0
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-lg bg-slate-50 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Session Summary
          </h3>
          <p className="text-sm leading-relaxed text-slate-700">
            {analysis.summary}
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Quality Index Scores
          </h3>

          <MetricRow
            label="Content Coverage"
            description="Did the Fellow teach Growth Mindset?"
            score={analysis.contentScore}
            rating={analysis.contentRating}
            justification={analysis.contentJustification}
          />

          <MetricRow
            label="Facilitation Quality"
            description="Was delivery empathetic and engaging?"
            score={analysis.facilitationScore}
            rating={analysis.facilitationRating}
            justification={analysis.facilitationJustification}
          />

          <MetricRow
            label="Protocol Safety"
            description="Did Fellow stay within Shamiri curriculum?"
            score={analysis.safetyScore}
            rating={analysis.safetyRating}
            justification={analysis.safetyJustification}
          />
        </div>

        {/* AI Meta */}
        <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <MetaChip label="Model" value={analysis.aiModel} />
          <MetaChip label="Prompt" value={`v${analysis.promptVersion}`} />
          <MetaChip
            label="Tokens"
            value={`${analysis.inputTokens + analysis.outputTokens}`}
          />
          <MetaChip
            label="Generated"
            value={new Date(analysis.createdAt).toLocaleString()}
          />
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  description,
  score,
  rating,
  justification,
}: Readonly<{
  label: string;
  description: string;
  score: number;
  rating: string;
  justification: string;
}>) {
  const scoreConfig = {
    1: { bar: "w-1/3 bg-red-400", text: "text-red-700", bg: "bg-red-50 border-red-200" },
    2: { bar: "w-2/3 bg-amber-400", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
    3: { bar: "w-full bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200" },
  };
  const config = scoreConfig[score as 1 | 2 | 3] ?? scoreConfig[1];

  return (
    <div className={`rounded-lg border p-4 ${config.bg}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            <span
              className={`rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold ${config.text}`}
            >
              {rating}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        {/* Score circle */}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold shadow-sm ${config.text}`}
        >
          {score}
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-3 h-1.5 w-full rounded-full bg-white/60">
        <div className={`h-1.5 rounded-full transition-all ${config.bar}`} />
      </div>

      {/* Justification */}
      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        {justification}
      </p>
    </div>
  );
}

function MetaChip({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
    </span>
  );
}
