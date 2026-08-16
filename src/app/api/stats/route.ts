import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-utils";
import { calculateScore, countEvaluations } from "@/lib/scoring";

export async function GET() {
  try {
    const [totalInterviews, totalQuestionsAnswered, distinctTechnologies, completedInterviews] =
      await Promise.all([
        prisma.interview.count({ where: { status: { not: "cancelled" } } }),
        prisma.interviewQuestion.count({
          where: { evaluation: { in: ["correct", "partially_correct", "incorrect"] } },
        }),
        prisma.interviewTechnology.findMany({ distinct: ["technologyId"], select: { technologyId: true } }),
        prisma.interview.findMany({
          // Freehand interviews have no evaluations, so a computed 0% would
          // wrongly drag the average down — only structured-mode interviews
          // have a meaningful score.
          where: { status: "completed", mode: "structured" },
          include: { questions: true },
        }),
      ]);

    const scores = completedInterviews.map((interview) => {
      const counts = countEvaluations(interview.questions.map((q) => q.evaluation));
      return calculateScore(counts);
    });

    const avgCorrectPercent =
      scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;

    return NextResponse.json({
      totalInterviews,
      totalQuestions: totalQuestionsAnswered,
      technologiesCovered: distinctTechnologies.length,
      avgCorrectPercent,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
