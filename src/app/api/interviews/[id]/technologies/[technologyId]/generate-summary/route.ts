import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, notFound, badRequest } from "@/lib/api-utils";
import { generateAiSummary, generateFreehandSummary, AiSummaryUnavailableError } from "@/lib/ai-summary";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; technologyId: string } }
) {
  try {
    const interview = await prisma.interview.findUnique({ where: { id: params.id } });
    if (!interview) throw notFound("Interview not found");

    const technology = await prisma.technology.findUnique({ where: { id: params.technologyId } });
    if (!technology) throw notFound("Technology not found");

    let summaryText: string;

    if (interview.mode === "freehand") {
      const interviewTechnology = await prisma.interviewTechnology.findUnique({
        where: { interviewId_technologyId: { interviewId: interview.id, technologyId: technology.id } },
      });
      const notes = interviewTechnology?.freehandNotes?.trim();
      if (!notes) {
        throw badRequest(`No notes recorded for ${technology.name} yet — nothing to summarize.`);
      }
      summaryText = await generateFreehandSummary({
        candidate: interview.candidateName,
        interviewer: interview.interviewerName,
        technologies: [{ name: technology.name, notes }],
      });
    } else {
      const questions = await prisma.interviewQuestion.findMany({
        where: { interviewId: interview.id, technologyId: technology.id },
        include: { question: true },
        orderBy: { questionOrder: "asc" },
      });

      const answered = questions.filter((q) => q.evaluation && q.evaluation !== "skipped");

      if (answered.length === 0) {
        throw badRequest(
          `No answered questions recorded for ${technology.name} yet — nothing to summarize.`
        );
      }

      summaryText = await generateAiSummary({
        candidate: interview.candidateName,
        interviewer: interview.interviewerName,
        technologies: [
          {
            name: technology.name,
            questions: answered.map((q) => ({
              question: q.question.questionText,
              evaluation: q.evaluation as "correct" | "partially_correct" | "incorrect",
              note: q.interviewerNote,
            })),
          },
        ],
      });
    }

    const summary = await prisma.interviewTechnologySummary.upsert({
      where: { interviewId_technologyId: { interviewId: interview.id, technologyId: technology.id } },
      update: { summaryText, generatedAt: new Date() },
      create: {
        interviewId: interview.id,
        technologyId: technology.id,
        summaryText,
        generatedBy: "ai",
      },
    });

    return NextResponse.json({
      interviewId: summary.interviewId,
      technologyId: summary.technologyId,
      technologyName: technology.name,
      summaryText: summary.summaryText,
      generatedBy: summary.generatedBy,
      generatedAt: summary.generatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AiSummaryUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return handleApiError(error);
  }
}
