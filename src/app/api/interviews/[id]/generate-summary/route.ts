import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, badRequest } from "@/lib/api-utils";
import { getInterviewOrThrow } from "@/lib/interviews";
import {
  generateAiSummary,
  generateFreehandSummary,
  AiSummaryUnavailableError,
  type AiSummaryTechnology,
} from "@/lib/ai-summary";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const interview = await getInterviewOrThrow(params.id);

    if (interview.status === "in_progress") {
      throw badRequest("Finish the interview before generating the AI summary.");
    }

    let summaryText: string;

    if (interview.mode === "freehand") {
      const techsWithNotes = interview.technologies.filter((it) => it.freehandNotes?.trim());
      if (techsWithNotes.length === 0) {
        throw badRequest("This interview has no recorded notes to summarize.");
      }
      summaryText = await generateFreehandSummary({
        candidate: interview.candidateName,
        interviewer: interview.interviewerName,
        technologies: techsWithNotes.map((it) => ({
          name: it.technology.name,
          notes: it.freehandNotes!.trim(),
        })),
      });
    } else {
      if (interview.questions.length === 0) {
        throw badRequest("This interview has no recorded questions to summarize.");
      }

      const byTech = new Map<string, AiSummaryTechnology>();
      for (const it of interview.technologies) {
        byTech.set(it.technologyId, { name: it.technology.name, questions: [] });
      }
      for (const q of interview.questions) {
        // Only summarize questions that were actually asked and evaluated —
        // skipped questions carry no feedback and would confuse the AI summary.
        if (!q.evaluation || q.evaluation === "skipped") continue;
        const entry = byTech.get(q.technologyId);
        if (!entry) continue;
        entry.questions.push({
          question: q.question.questionText,
          evaluation: q.evaluation,
          note: q.interviewerNote,
        });
      }

      summaryText = await generateAiSummary({
        candidate: interview.candidateName,
        interviewer: interview.interviewerName,
        technologies: Array.from(byTech.values()).filter((t) => t.questions.length > 0),
      });
    }

    const summary = await prisma.interviewSummary.upsert({
      where: { interviewId: interview.id },
      update: { summaryText, generatedAt: new Date() },
      create: { interviewId: interview.id, summaryText, generatedBy: "ai" },
    });

    return NextResponse.json({
      interviewId: summary.interviewId,
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
