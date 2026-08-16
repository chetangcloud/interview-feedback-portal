"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Printer, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiSummaryContent } from "@/components/interview/AiSummaryContent";
import { TechnologySummaryPanel } from "@/components/interview/TechnologySummaryPanel";
import { api, ApiError } from "@/lib/api-client";
import type { InterviewDto, SummaryDto } from "@/types";

export function SummaryReport({ interview }: { interview: InterviewDto }) {
  const [summary, setSummary] = useState<SummaryDto | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExisting = useCallback(async () => {
    setLoadingExisting(true);
    try {
      const existing = await api.getSummary(interview.id);
      setSummary(existing);
    } catch {
      setSummary(null);
    } finally {
      setLoadingExisting(false);
    }
  }, [interview.id]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generateSummary(interview.id);
      setSummary(result);
      toast.success("AI summary generated");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Unable to generate AI summary. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 print:max-w-full">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>
      </div>

      <Card className="print:border-none print:shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Interview Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-5 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Candidate</p>
              <p className="text-sm font-semibold text-slate-900">{interview.candidateName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Interviewer</p>
              <p className="text-sm font-semibold text-slate-900">{interview.interviewerName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Date</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(interview.startedAt), "MMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Duration</p>
              <p className="text-sm font-semibold text-slate-900">{interview.durationMinutes} minutes</p>
            </div>
          </div>

          {(interview.totalItExperience !== null ||
            interview.relevantExperience !== null ||
            interview.primaryCloud ||
            interview.secondaryCloud) && (
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 py-5 sm:grid-cols-4">
              {interview.totalItExperience !== null && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Total IT Experience
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{interview.totalItExperience} yrs</p>
                </div>
              )}
              {interview.relevantExperience !== null && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Relevant Experience
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{interview.relevantExperience} yrs</p>
                </div>
              )}
              {interview.primaryCloud && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Primary Cloud</p>
                  <p className="text-sm font-semibold text-slate-900">{interview.primaryCloud}</p>
                </div>
              )}
              {interview.secondaryCloud && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Secondary Cloud
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{interview.secondaryCloud}</p>
                </div>
              )}
            </div>
          )}

          <div className="border-b border-slate-100 py-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Technologies</p>
            {interview.mode === "freehand" ? (
              <div className="flex flex-col gap-3">
                {interview.technologies.map((t) => (
                  <div key={t.technologyId} className="rounded-lg border border-slate-200 p-3">
                    <p className="mb-1.5 text-sm font-semibold text-slate-900">{t.name}</p>
                    {t.freehandNotes?.trim() ? (
                      <p className="whitespace-pre-wrap text-sm text-slate-600">{t.freehandNotes}</p>
                    ) : (
                      <p className="text-sm text-slate-400">No notes recorded.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {interview.technologies.map((t) => (
                  <div key={t.technologyId} className="rounded-lg border border-slate-200 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className="text-sm font-semibold text-indigo-600">{t.score}%</p>
                    </div>
                    <p className="text-xs text-slate-500">{t.questionCount} questions</p>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
                      <span className="text-emerald-600">Correct: {t.correct}</span>
                      <span className="text-amber-600">Partial: {t.partial}</span>
                      <span className="text-rose-600">Incorrect: {t.incorrect}</span>
                      {t.skipped > 0 && <span className="text-slate-400">Skipped: {t.skipped}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {interview.mode === "structured" && (
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 py-5 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Overall Score</p>
                <p className="text-lg font-bold text-indigo-600">{interview.overall.score}%</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total Questions</p>
                <p className="text-lg font-bold text-slate-900">{interview.overall.answered}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Correct</p>
                <p className="text-lg font-bold text-emerald-600">{interview.overall.correct}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Partial / Incorrect
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {interview.overall.partial} / {interview.overall.incorrect}
                </p>
              </div>
              {interview.overall.skipped > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Skipped (Not Asked)
                  </p>
                  <p className="text-lg font-bold text-slate-500">{interview.overall.skipped}</p>
                </div>
              )}
            </div>
          )}

          {interview.technologies.some((t) =>
            interview.mode === "freehand" ? !!t.freehandNotes?.trim() : t.answered > 0
          ) && (
            <div className="border-b border-slate-100 py-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Per-Technology AI Summaries
              </p>
              <div className="flex flex-col gap-3">
                {interview.technologies
                  .filter((t) => (interview.mode === "freehand" ? !!t.freehandNotes?.trim() : t.answered > 0))
                  .map((t) => (
                    <TechnologySummaryPanel
                      key={t.technologyId}
                      interviewId={interview.id}
                      technologyId={t.technologyId}
                      technologyName={t.name}
                    />
                  ))}
              </div>
            </div>
          )}

          <div className="py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Overall AI Interview Summary
              </p>
              {!loadingExisting && (
                <Button size="sm" variant="secondary" onClick={handleGenerate} disabled={generating} className="no-print">
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {summary ? "Regenerate AI Summary" : "Generate AI Summary"}
                </Button>
              )}
            </div>

            {loadingExisting ? (
              <p className="text-sm text-slate-400">Checking for an existing summary...</p>
            ) : summary ? (
              <AiSummaryContent text={summary.summaryText} />
            ) : error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No AI summary generated yet. Click &quot;Generate AI Summary&quot; to create one from the
                recorded interview feedback.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
