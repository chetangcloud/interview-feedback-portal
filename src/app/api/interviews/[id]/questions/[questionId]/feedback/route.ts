import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, notFound, badRequest, conflict } from "@/lib/api-utils";
import { calculateScore, countEvaluations } from "@/lib/scoring";
import { getInterviewOrThrow, techStatsFrom, overallStatsFrom } from "@/lib/interviews";

const bodySchema = z.object({
  evaluation: z.enum(["correct", "partially_correct", "incorrect", "skipped"]),
  note: z.string().trim().max(2000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const body = bodySchema.parse(await req.json());

    const interview = await prisma.interview.findUnique({ where: { id: params.id } });
    if (!interview) throw notFound("Interview not found");
    if (interview.status !== "in_progress") {
      throw badRequest("This interview is no longer in progress.");
    }

    const interviewQuestion = await prisma.interviewQuestion.findUnique({
      where: { id: params.questionId },
    });
    if (!interviewQuestion || interviewQuestion.interviewId !== interview.id) {
      throw notFound("Question not found for this interview.");
    }
    if (interviewQuestion.evaluation !== null) {
      throw conflict("Feedback has already been submitted for this question.");
    }

    await prisma.interviewQuestion.update({
      where: { id: interviewQuestion.id },
      data: {
        evaluation: body.evaluation,
        interviewerNote: body.note && body.note.length > 0 ? body.note : null,
        answeredAt: new Date(),
      },
    });

    const techQuestions = await prisma.interviewQuestion.findMany({
      where: { interviewId: interview.id, technologyId: interviewQuestion.technologyId },
    });
    const counts = countEvaluations(techQuestions.map((q) => q.evaluation));
    const allResolved = techQuestions.every((q) => q.evaluation !== null);

    let technologyComplete = false;
    if (allResolved) {
      technologyComplete = true;
      await prisma.interviewTechnology.update({
        where: { interviewId_technologyId: { interviewId: interview.id, technologyId: interviewQuestion.technologyId } },
        data: {
          completedAt: new Date(),
          score: calculateScore(counts),
          correctCount: counts.correct,
          partialCount: counts.partial,
          incorrectCount: counts.incorrect,
          skippedCount: counts.skipped,
        },
      });

      // Auto-chain to the next not-yet-finished queued technology, so a
      // straight-through interview keeps flowing without the interviewer
      // needing to manually pick the next one each time. If they've been
      // switching around manually, this still lands on a sensible pick —
      // the next one after this in queue order.
      if (interview.currentTechnologyId === interviewQuestion.technologyId) {
        const remaining = await prisma.interviewTechnology.findMany({
          where: { interviewId: interview.id, completedAt: null },
          orderBy: { order: "asc" },
        });
        if (remaining.length > 0) {
          await prisma.interview.update({
            where: { id: interview.id },
            data: { currentTechnologyId: remaining[0].technologyId },
          });
        }
      }
    }

    const updated = await getInterviewOrThrow(interview.id);
    const techStats = techStatsFrom(updated).find((t) => t.technologyId === interviewQuestion.technologyId)!;

    return NextResponse.json({
      technologyComplete,
      techStats,
      overall: overallStatsFrom(updated),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
