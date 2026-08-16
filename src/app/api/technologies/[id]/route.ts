import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, notFound } from "@/lib/api-utils";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = updateSchema.parse(await req.json());

    const existing = await prisma.technology.findUnique({ where: { id: params.id } });
    if (!existing) throw notFound("Technology not found");

    const technology = await prisma.technology.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(technology);
  } catch (error) {
    return handleApiError(error);
  }
}
