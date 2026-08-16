import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, notFound } from "@/lib/api-utils";

const updateSchema = z.object({
  category: z.string().trim().min(1).max(60).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  questionText: z.string().trim().min(5).max(1000).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = updateSchema.parse(await req.json());

    const existing = await prisma.question.findUnique({ where: { id: params.id } });
    if (!existing) throw notFound("Question not found");

    const question = await prisma.question.update({ where: { id: params.id }, data: body });
    return NextResponse.json(question);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.question.findUnique({
      where: { id: params.id },
      include: { _count: { select: { interviewQuestions: true } } },
    });
    if (!existing) throw notFound("Question not found");

    if (existing._count.interviewQuestions > 0) {
      // Used in an interview already — soft delete only, to preserve history.
      const question = await prisma.question.update({
        where: { id: params.id },
        data: { active: false },
      });
      return NextResponse.json(question);
    }

    await prisma.question.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
