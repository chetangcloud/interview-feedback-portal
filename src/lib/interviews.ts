import { prisma } from "@/lib/db";
import { calculateScore, countEvaluations, resolvedOf, answeredOf } from "@/lib/scoring";

export async function getInterviewOrThrow(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      technologies: {
        include: { technology: true },
        orderBy: { order: "asc" },
      },
      questions: {
        include: { question: true, technology: true },
        orderBy: { questionOrder: "asc" },
      },
      summary: true,
    },
  });
  if (!interview) {
    throw new Error("NOT_FOUND");
  }
  return interview;
}

export type TechStats = {
  technologyId: string;
  name: string;
  questionCount: number;
  resolved: number;
  answered: number;
  correct: number;
  partial: number;
  incorrect: number;
  skipped: number;
  score: number;
  completed: boolean;
  freehandNotes: string | null;
};

export function techStatsFrom(
  interview: Awaited<ReturnType<typeof getInterviewOrThrow>>
): TechStats[] {
  return interview.technologies.map((it) => {
    const questions = interview.questions.filter((q) => q.technologyId === it.technologyId);
    const counts = countEvaluations(questions.map((q) => q.evaluation));
    const resolved = resolvedOf(counts);
    return {
      technologyId: it.technologyId,
      name: it.technology.name,
      questionCount: questions.length,
      resolved,
      answered: answeredOf(counts),
      correct: counts.correct,
      partial: counts.partial,
      incorrect: counts.incorrect,
      skipped: counts.skipped,
      score: calculateScore(counts),
      completed:
        interview.mode === "freehand" ? !!it.completedAt : questions.length > 0 && resolved === questions.length,
      freehandNotes: it.freehandNotes,
    };
  });
}

export function overallStatsFrom(interview: Awaited<ReturnType<typeof getInterviewOrThrow>>) {
  const counts = countEvaluations(interview.questions.map((q) => q.evaluation));
  return {
    totalQuestions: interview.questions.length,
    resolved: resolvedOf(counts),
    answered: answeredOf(counts),
    correct: counts.correct,
    partial: counts.partial,
    incorrect: counts.incorrect,
    skipped: counts.skipped,
    score: calculateScore(counts),
  };
}

export function durationMinutes(interview: { startedAt: Date; completedAt: Date | null }) {
  const end = interview.completedAt ?? new Date();
  return Math.max(0, Math.round((end.getTime() - interview.startedAt.getTime()) / 60000));
}

export function serializeInterview(interview: Awaited<ReturnType<typeof getInterviewOrThrow>>) {
  return {
    id: interview.id,
    candidateName: interview.candidateName,
    interviewerName: interview.interviewerName,
    interviewType: interview.interviewType,
    questionsPerTech: interview.questionsPerTech,
    totalItExperience: interview.totalItExperience,
    relevantExperience: interview.relevantExperience,
    primaryCloud: interview.primaryCloud,
    secondaryCloud: interview.secondaryCloud,
    currentTechnologyId: interview.currentTechnologyId,
    mode: interview.mode,
    status: interview.status,
    startedAt: interview.startedAt.toISOString(),
    completedAt: interview.completedAt ? interview.completedAt.toISOString() : null,
    technologies: techStatsFrom(interview),
    overall: overallStatsFrom(interview),
    durationMinutes: durationMinutes(interview),
    transcript: interview.questions.map((q) => ({
      id: q.id,
      technologyId: q.technologyId,
      technologyName: q.technology.name,
      questionOrder: q.questionOrder,
      questionText: q.question.questionText,
      category: q.question.category,
      difficulty: q.question.difficulty,
      evaluation: q.evaluation,
      note: q.interviewerNote,
      answeredAt: q.answeredAt ? q.answeredAt.toISOString() : null,
    })),
  };
}
