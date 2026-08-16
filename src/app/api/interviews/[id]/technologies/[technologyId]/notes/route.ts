import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, notFound, badRequest } from "@/lib/api-utils";

const bodySchema = z.object({
  notes: z.string().max(20000),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; technologyId: string } }
) {
  try {
    const { notes } = bodySchema.parse(await req.json());

    const interview = await prisma.interview.findUnique({ where: { id: params.id } });
    if (!interview) throw notFound("Interview not found");
    if (interview.mode !== "freehand") {
      throw badRequest("This interview is not in Free Hand mode.");
    }
    if (interview.status !== "in_progress") {
      throw badRequest("This interview is no longer in progress.");
    }

    const interviewTechnology = await prisma.interviewTechnology.findUnique({
      where: { interviewId_technologyId: { interviewId: interview.id, technologyId: params.technologyId } },
    });
    if (!interviewTechnology) throw notFound("Technology not found for this interview.");

    const updated = await prisma.interviewTechnology.update({
      where: { id: interviewTechnology.id },
      data: { freehandNotes: notes },
    });

    return NextResponse.json({
      technologyId: updated.technologyId,
      freehandNotes: updated.freehandNotes,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
