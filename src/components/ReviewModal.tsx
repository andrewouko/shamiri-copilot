"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { ReviewDecision, type RiskFlag } from "@prisma/client";
import { type ApiResponse, type ReviewErrorCode, type ReviewResponseData } from "@/lib/types";

interface Analysis {
  contentScore: number;
  facilitationScore: number;
  safetyScore: number;
  riskFlag: RiskFlag;
}

interface Review {
  id: string;
  decision: ReviewDecision;
  contentOverride: number | null;
  facilitationOverride: number | null;
  safetyOverride: number | null;
  riskOverride: RiskFlag | null;
  note: string | null;
  createdAt: Date;
  supervisor?: { name: string };
}

interface Props {
  sessionId: string;
  analysis: Analysis;
  existingReview: Review | null;
  supervisorId: string;
}

const SUBMIT_LABELS: Record<ReviewDecision, string> = {
  VALIDATED: "Submit Validation",
  REJECTED: "Submit Rejection",
};

const SCORE_OPTIONS = [
  { value: "", label: "Accept AI score" },
  { value: "1", label: "1 — Needs improvement" },
  { value: "2", label: "2 — Adequate" },
  { value: "3", label: "3 — Excellent" },
];

export function ReviewModal({
  sessionId,
  analysis,
  existingReview,
  supervisorId: _supervisorId,
}: Readonly<Props>) {
  const router = useRouter();

  const [decision, setDecision] = useState<ReviewDecision>(
    existingReview?.decision === ReviewDecision.REJECTED ? ReviewDecision.REJECTED : ReviewDecision.VALIDATED,
  );
  const [note, setNote] = useState(existingReview?.note ?? "");
  const [contentOverride, setContentOverride] = useState(
    existingReview?.contentOverride?.toString() ?? "",
  );
  const [facilitationOverride, setFacilitationOverride] = useState(
    existingReview?.facilitationOverride?.toString() ?? "",
  );
  const [safetyOverride, setSafetyOverride] = useState(
    existingReview?.safetyOverride?.toString() ?? "",
  );
  const [riskOverride, setRiskOverride] = useState(
    existingReview?.riskOverride ?? "",
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(!!existingReview);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const body = {
        decision,
        note: note.trim() || undefined,
        contentOverride: contentOverride
          ? Number.parseInt(contentOverride, 10)
          : null,
        facilitationOverride: facilitationOverride
          ? Number.parseInt(facilitationOverride, 10)
          : null,
        safetyOverride: safetyOverride
          ? Number.parseInt(safetyOverride, 10)
          : null,
        riskOverride: riskOverride || null,
      };

      const res = await fetch(`/api/sessions/${sessionId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json: ApiResponse<ReviewResponseData, ReviewErrorCode> = await res.json();
      if (!json.success) {
        setSubmitError(json.error.message ?? "Failed to submit review.");
        return;
      }

      setSubmitted(true);
      router.refresh();
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Supervisor Review</h2>
        {submitted && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            ✓ Review submitted
          </span>
        )}
      </div>

      {/* Submitted state — show summary with option to revise */}
      {submitted && existingReview ? (
        <ReviewSummary
          review={existingReview}
          analysis={analysis}
          onRevise={() => setSubmitted(false)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Decision */}
          <div>
            <p className="label mb-2">Decision *</p>
            <div className="flex gap-3">
              <DecisionButton
                active={decision === ReviewDecision.VALIDATED}
                onClick={() => setDecision(ReviewDecision.VALIDATED)}
                variant="validate"
              >
                ✓ Validate AI Findings
              </DecisionButton>
              <DecisionButton
                active={decision === ReviewDecision.REJECTED}
                onClick={() => setDecision(ReviewDecision.REJECTED)}
                variant="reject"
              >
                ✗ Reject AI Findings
              </DecisionButton>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {decision === ReviewDecision.VALIDATED
                ? "You agree with the AI analysis. Overrides are optional."
                : "You disagree with the AI analysis. Please provide overrides and/or a note."}
            </p>
          </div>

          {/* Score overrides */}
          <div>
            <p className="label mb-2">
              Score Overrides{" "}
              <span className="text-xs font-normal text-slate-400">
                (leave blank to accept AI score)
              </span>
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ScoreOverride
                label={`Content (AI: ${analysis.contentScore})`}
                value={contentOverride}
                onChange={setContentOverride}
              />
              <ScoreOverride
                label={`Facilitation (AI: ${analysis.facilitationScore})`}
                value={facilitationOverride}
                onChange={setFacilitationOverride}
              />
              <ScoreOverride
                label={`Safety (AI: ${analysis.safetyScore})`}
                value={safetyOverride}
                onChange={setSafetyOverride}
              />
            </div>
          </div>

          {/* Risk override */}
          <div>
            <label className="label mb-1">
              Risk Override{" "}
              <span className="text-xs font-normal text-slate-400">
                (AI flagged:{" "}
                <span
                  className={
                    analysis.riskFlag === "RISK"
                      ? "font-bold text-red-600"
                      : "font-bold text-green-600"
                  }
                >
                  {analysis.riskFlag}
                </span>
                {" "})
              </span>
            </label>
            <select
              value={riskOverride}
              onChange={(e) => setRiskOverride(e.target.value)}
              className="input"
            >
              <option value="">Accept AI risk assessment</option>
              <option value="SAFE">Override to SAFE</option>
              <option value="RISK">Override to RISK</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="label mb-1">
              Notes{" "}
              <span className="text-xs font-normal text-slate-400">
                (optional — explain overrides or add context)
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              rows={3}
              className="input resize-none"
              placeholder="e.g. The AI flagged a quote as risky, but in context it was the Fellow redirecting the participant appropriately…"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {note.length} / 1000
            </p>
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2.5 ${
              decision === "VALIDATED" ? "btn-primary" : "btn-danger"
            }`}
          >
            {submitting ? "Submitting…" : SUBMIT_LABELS[decision]}
          </button>
        </form>
      )}
    </div>
  );
}

function ReviewSummary({
  review,
  analysis,
  onRevise,
}: Readonly<{
  review: Review;
  analysis: Analysis;
  onRevise: () => void;
}>) {
  const effectiveContent = review.contentOverride ?? analysis.contentScore;
  const effectiveFacilitation =
    review.facilitationOverride ?? analysis.facilitationScore;
  const effectiveSafety = review.safetyOverride ?? analysis.safetyScore;
  const effectiveRisk = review.riskOverride ?? analysis.riskFlag;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            review.decision === "VALIDATED"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {review.decision === "VALIDATED" ? "✓ Validated" : "✗ Rejected"}
        </span>
        <span className="text-xs text-slate-500">
          {new Date(review.createdAt).toLocaleString()}
          {review.supervisor ? ` · ${review.supervisor.name}` : ""}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="font-bold text-slate-700">Content</div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            {effectiveContent}
            {review.contentOverride !== null && (
              <span className="ml-1 text-xs font-normal text-amber-600">
                (override)
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="font-bold text-slate-700">Facilitation</div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            {effectiveFacilitation}
            {review.facilitationOverride !== null && (
              <span className="ml-1 text-xs font-normal text-amber-600">
                (override)
              </span>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="font-bold text-slate-700">Safety</div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            {effectiveSafety}
            {review.safetyOverride !== null && (
              <span className="ml-1 text-xs font-normal text-amber-600">
                (override)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-600">Risk:</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
            effectiveRisk === "RISK"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {effectiveRisk}
        </span>
        {review.riskOverride && (
          <span className="text-xs text-amber-600">(supervisor override)</span>
        )}
      </div>

      {review.note && (
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Note: </span>
          {review.note}
        </div>
      )}

      <button onClick={onRevise} className="btn-secondary w-full text-xs">
        ✏️ Revise Review
      </button>
    </div>
  );
}

function DecisionButton({
  active,
  onClick,
  variant,
  children,
}: Readonly<{
  active: boolean;
  onClick: () => void;
  variant: "validate" | "reject";
  children: React.ReactNode;
}>) {
  const base =
    "flex-1 rounded-lg border py-2.5 text-sm font-semibold transition";
  const styles = {
    validate: active
      ? "border-green-500 bg-green-50 text-green-700"
      : "border-slate-200 bg-white text-slate-600 hover:border-green-300",
    reject: active
      ? "border-red-500 bg-red-50 text-red-700"
      : "border-slate-200 bg-white text-slate-600 hover:border-red-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

function ScoreOverride({
  label,
  value,
  onChange,
}: Readonly<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}>) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input text-xs"
      >
        {SCORE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
