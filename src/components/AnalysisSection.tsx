"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InsightCardSkeleton } from "./InsightCardSkeleton";
import { CpuChipIcon } from "@heroicons/react/24/outline";
import { type ApiResponse, type AnalyzeErrorCode, type AnalyzeResponseData } from "@/lib/types";

interface Props {
  sessionId: string;
  hasAnalysis: boolean;
  children?: React.ReactNode;
}

export function AnalysisSection({ sessionId, hasAnalysis, children }: Readonly<Props>) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (hasAnalysis) {
    return <>{children}</>;
  }

  async function handleAnalyze() {
    setError(null);
    setIsAnalyzing(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/analyze`, {
        method: "POST",
      });
      const json: ApiResponse<AnalyzeResponseData, AnalyzeErrorCode> = await res.json();
      if (!json.success) {
        setError(json.error.message ?? "Analysis failed. Please try again.");
        setIsAnalyzing(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
      setIsAnalyzing(false);
    }
  }

  if (isAnalyzing) {
    return (
      <div className="space-y-3">
        <p className="text-right text-xs text-slate-400">
          AI analysis in progress — this may take 10–20 seconds…
        </p>
        <InsightCardSkeleton />
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-center justify-center px-8 py-16 text-center">
      <CpuChipIcon className="mb-4 h-12 w-12 text-slate-300" />
      <h3 className="mb-2 text-lg font-semibold text-slate-800">
        No AI Analysis Yet
      </h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">
        Click &ldquo;Run AI Analysis&rdquo; to generate an insight card for
        this session. The AI will evaluate Content Coverage, Facilitation
        Quality, Protocol Safety, and detect any risk indicators.
      </p>
      <button onClick={handleAnalyze} className="btn-primary">
        <CpuChipIcon className="h-4 w-4" />
        Run AI Analysis
      </button>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </div>
  );
}