"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSummaryContent } from "@/components/interview/AiSummaryContent";
import { api, ApiError } from "@/lib/api-client";
import type { TechSummaryDto } from "@/types";

export function TechnologySummaryPanel({
  interviewId,
  technologyId,
  technologyName,
}: {
  interviewId: string;
  technologyId: string;
  technologyName: string;
}) {
  const [summary, setSummary] = useState<TechSummaryDto | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExisting = useCallback(async () => {
    setLoadingExisting(true);
    try {
      const existing = await api.getTechSummary(interviewId, technologyId);
      setSummary(existing);
    } catch {
      setSummary(null);
    } finally {
      setLoadingExisting(false);
    }
  }, [interviewId, technologyId]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generateTechSummary(interviewId, technologyId);
      setSummary(result);
      toast.success(`${technologyName} summary generated`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : `Unable to generate the ${technologyName} summary.`;
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  }

  if (loadingExisting) {
    return <p className="text-xs text-slate-400">Checking for an existing {technologyName} summary...</p>;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {technologyName} AI Summary
        </p>
        <Button size="sm" variant="secondary" onClick={handleGenerate} disabled={generating}>
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {summary ? "Regenerate" : "Generate"}
        </Button>
      </div>

      {summary ? (
        <AiSummaryContent text={summary.summaryText} />
      ) : error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : (
        <p className="text-xs text-slate-400">
          No {technologyName} summary yet. Generate one from the recorded feedback for this technology.
        </p>
      )}
    </div>
  );
}
