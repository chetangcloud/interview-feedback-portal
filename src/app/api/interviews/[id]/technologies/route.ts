import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, notFound, badRequest } from "@/lib/api-utils";
import { selectQuestionsForTechnology } from "@/lib/questions";
import { getInterviewOrThrow, serializeInterview } from "@/lib/interviews";

const bodySchema = z.object({
  technologyName: z.string().trim().min(1).max(80),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { technologyName } = bodySchema.parse(await req.json());

    const interview = await prisma.interview.findUnique({
      where: { id: params.id },
      include: { technologies: true },
    });
    if (!interview) throw notFound("Interview not found");
    if (interview.status !== "in_progress") {
      throw badRequest("This interview is no longer in progress.");
    }

    let technology = await prisma.technology.findFirst({
      where: { name: { equals: technologyName, mode: "insensitive" } },
    });
    if (!technology) {
      technology = await prisma.technology.create({
        data: { name: technologyName.trim(), active: true },
      });
    } else if (!technology.active) {
      throw badRequest(`"${technology.name}" is not currently active in the question bank.`);
    }

    const alreadyQueued = interview.technologies.some((it) => it.technologyId === technology!.id);

    if (alreadyQueued) {
      // Structured mode: the interviewer is switching focus back to a
      // technology already in this interview's queue — just move the active
      // pointer, no new questions needed. Freehand mode: all boxes are shown
      // at once, so this is simply a no-op — nothing to switch.
      if (interview.mode === "structured") {
        await prisma.interview.update({
          where: { id: interview.id },
          data: { currentTechnologyId: technology.id },
        });
      }
      const updated = await getInterviewOrThrow(interview.id);
      return NextResponse.json(serializeInterview(updated));
    }

    if (interview.mode === "freehand") {
      // Freehand mode has no fixed question list — just queue the
      // technology with an empty notes box for the interviewer to fill in.
      await prisma.interviewTechnology.create({
        data: {
          interviewId: interview.id,
          technologyId: technology.id,
          questionCount: 0,
          order: interview.technologies.length,
        },
      });
      const updated = await getInterviewOrThrow(interview.id);
      return NextResponse.json(serializeInterview(updated), { status: 201 });
    }

    const selected = await selectQuestionsForTechnology(technology.id, interview.questionsPerTech);
    if (selected.length === 0) {
      throw badRequest(
        `No active questions found for "${technology.name}". Add questions in the Question Bank first.`
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.interviewTechnology.create({
        data: {
          interviewId: interview.id,
          technologyId: technology!.id,
          questionCount: selected.length,
          order: interview.technologies.length,
        },
      });

      await tx.interviewQuestion.createMany({
        data: selected.map((q, idx) => ({
          interviewId: interview.id,
          technologyId: technology!.id,
          questionId: q.id,
          questionOrder: idx + 1,
        })),
      });

      await tx.interview.update({
        where: { id: interview.id },
        data: { currentTechnologyId: technology!.id },
      });
    });

    const updated = await getInterviewOrThrow(interview.id);
    return NextResponse.json(serializeInterview(updated), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
