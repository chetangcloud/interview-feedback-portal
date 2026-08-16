import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, notFound } from "@/lib/api-utils";
import { calculateScore, countEvaluations } from "@/lib/scoring";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
      include: {
        technologies: { include: { technology: true }, orderBy: { order: "asc" } },
        questions: { include: { question: true }, orderBy: { questionOrder: "asc" } },
      },
    });
    if (!interview) throw notFound("Interview not found");

    if (interview.status !== "in_progress") {
      return NextResponse.json({ done: true, reason: "interview_finished" });
    }
    if (interview.mode === "freehand") {
      return NextResponse.json({ done: true, reason: "freehand_mode" });
    }

    // The interviewer can freely switch which technology is "active" (even
    // mid-question, even back to one already touched), so the active
    // technology is whatever they last selected — falling back to the first
    // unfinished one in queue order only when nothing has been explicitly
    // selected yet (e.g. right after the interview was created).
    const activeTech =
      (interview.currentTechnologyId &&
        interview.technologies.find((it) => it.technologyId === interview.currentTechnologyId)) ||
      interview.technologies.find((it) => !it.completedAt);
    if (!activeTech) {
      return NextResponse.json({ done: true, reason: "no_active_technology" });
    }

    const techQuestions = interview.questions.filter((q) => q.technologyId === activeTech.technologyId);
    const next = techQuestions.find((q) => q.evaluation === null);

    if (!next) {
      if (!activeTech.completedAt) {
        const counts = countEvaluations(techQuestions.map((q) => q.evaluation));
        await prisma.interviewTechnology.update({
          where: { id: activeTech.id },
          data: {
            completedAt: new Date(),
            score: calculateScore(counts),
            correctCount: counts.correct,
            partialCount: counts.partial,
            incorrectCount: counts.incorrect,
            skippedCount: counts.skipped,
          },
        });
      }
      return NextResponse.json({ done: true, reason: "technology_complete" });
    }

    return NextResponse.json({
      done: false,
      interviewQuestionId: next.id,
      technologyId: activeTech.technologyId,
      technologyName: activeTech.technology.name,
      questionOrder: next.questionOrder,
      totalForTech: techQuestions.length,
      question: next.question.questionText,
      category: next.question.category,
      difficulty: next.question.difficulty,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
