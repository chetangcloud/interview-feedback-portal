import type { Evaluation } from "@prisma/client";

export type EvaluationCounts = {
  correct: number;
  partial: number;
  incorrect: number;
  skipped: number;
};

export function emptyCounts(): EvaluationCounts {
  return { correct: 0, partial: 0, incorrect: 0, skipped: 0 };
}

/**
 * Tallies a list of evaluations into correct/partial/incorrect/skipped buckets.
 * "skipped" means the interviewer moved past the question without asking it —
 * it counts toward progress but is excluded from scoring entirely.
 */
export function countEvaluations(evaluations: (Evaluation | null)[]): EvaluationCounts {
  return evaluations.reduce((acc, evaluation) => {
    if (evaluation === "correct") acc.correct += 1;
    else if (evaluation === "partially_correct") acc.partial += 1;
    else if (evaluation === "incorrect") acc.incorrect += 1;
    else if (evaluation === "skipped") acc.skipped += 1;
    return acc;
  }, emptyCounts());
}

/** Questions the interviewer has moved past, either scored or skipped. */
export function resolvedOf(counts: EvaluationCounts): number {
  return counts.correct + counts.partial + counts.incorrect + counts.skipped;
}

/** Questions that were actually asked and scored (excludes skipped). */
export function answeredOf(counts: EvaluationCounts): number {
  return counts.correct + counts.partial + counts.incorrect;
}

/**
 * Score = (Correct + Partially Correct * 0.5) / Answered * 100
 * Skipped questions are excluded from both the numerator and denominator.
 */
export function calculateScore(counts: EvaluationCounts): number {
  const total = answeredOf(counts);
  if (total === 0) return 0;
  const raw = (counts.correct + counts.partial * 0.5) / total;
  return Math.round(raw * 1000) / 10; // one decimal place
}
