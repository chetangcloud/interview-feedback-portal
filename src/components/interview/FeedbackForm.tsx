"use client";

import { useState } from "react";
import { CheckCircle2, HelpCircle, XCircle, Loader2, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NoteSuggestionChips } from "@/components/interview/NoteSuggestionChips";
import { cn } from "@/lib/utils";
import type { Evaluation } from "@/types";

const options: { value: Evaluation; label: string; icon: typeof CheckCircle2; active: string }[] = [
  {
    value: "correct",
    label: "Correct",
    icon: CheckCircle2,
    active: "border-emerald-600 bg-emerald-50 text-emerald-700",
  },
  {
    value: "partially_correct",
    label: "Partially Correct",
    icon: HelpCircle,
    active: "border-amber-500 bg-amber-50 text-amber-700",
  },
  {
    value: "incorrect",
    label: "Incorrect",
    icon: XCircle,
    active: "border-rose-600 bg-rose-50 text-rose-700",
  },
];

export function FeedbackForm({
  technologyId,
  category,
  onSubmit,
  disabled,
}: {
  technologyId: string;
  category: string;
  onSubmit: (evaluation: Evaluation, note: string) => Promise<void> | void;
  disabled?: boolean;
}) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitEvaluation(value: Evaluation) {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(value, note.trim());
      setEvaluation(null);
      setNote("");
    } catch {
      // Parent surfaces the error; keep the fields so the interviewer can retry.
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!evaluation) {
      setError("Evaluation is required — or use Skip if this question wasn't asked.");
      return;
    }
    await submitEvaluation(evaluation);
  }

  async function handleSkip() {
    await submitEvaluation("skipped");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">Interviewer Evaluation</p>
        <div
          role="radiogroup"
          aria-label="Evaluation"
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {options.map(({ value, label, icon: Icon, active }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={evaluation === value}
              disabled={disabled || submitting}
              onClick={() => {
                setEvaluation(value);
                setError(null);
              }}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                evaluation === value ? active : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Notes <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <NoteSuggestionChips
          technologyId={technologyId}
          category={category}
          disabled={disabled || submitting}
          onInsert={(text) => setNote((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))}
        />
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Candidate correctly explained restart behavior but could not explain restartPolicy."
          disabled={disabled || submitting}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={disabled || submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Feedback
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={disabled || submitting}
          onClick={handleSkip}
          title="Use this if the question wasn't actually asked in the interview"
        >
          <SkipForward className="h-4 w-4" />
          Skip — Not Asked
        </Button>
      </div>
    </form>
  );
}
