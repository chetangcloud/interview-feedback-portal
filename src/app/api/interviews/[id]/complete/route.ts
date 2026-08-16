import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, notFound, badRequest } from "@/lib/api-utils";
import { calculateScore, countEvaluations } from "@/lib/scoring";
import { getInterviewOrThrow, serializeInterview } from "@/lib/interviews";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
      include: { technologies: true, questions: true },
    });
    if (!interview) throw notFound("Interview not found");
    if (interview.status === "cancelled") {
      throw badRequest("This interview was cancelled and cannot be completed.");
    }

    if (interview.status === "in_progress") {
      const now = new Date();
      for (const tech of interview.technologies) {
        if (tech.completedAt) continue;
        const questions = interview.questions.filter((q) => q.technologyId === tech.technologyId);
        const counts = countEvaluations(questions.map((q) => q.evaluation));
        await prisma.interviewTechnology.update({
          where: { id: tech.id },
          data: {
            completedAt: now,
            score: calculateScore(counts),
            correctCount: counts.correct,
            partialCount: counts.partial,
            incorrectCount: counts.incorrect,
            skippedCount: counts.skipped,
          },
        });
      }

      await prisma.interview.update({
        where: { id: interview.id },
        data: { status: "completed", completedAt: now },
      });
    }

    const updated = await getInterviewOrThrow(interview.id);
    return NextResponse.json(serializeInterview(updated));
  } catch (error) {
    return handleApiError(error);
  }
}
