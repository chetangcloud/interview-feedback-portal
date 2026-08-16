import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, conflict } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim();
    const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "true";

    const technologies = await prisma.technology.findMany({
      where: {
        ...(includeInactive ? {} : { active: true }),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(technologies);
  } catch (error) {
    return handleApiError(error);
  }
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = createSchema.parse(await req.json());

    const existing = await prisma.technology.findFirst({
      where: { name: { equals: body.name, mode: "insensitive" } },
    });
    if (existing) throw conflict(`Technology "${body.name}" already exists.`);

    const technology = await prisma.technology.create({
      data: { name: body.name, description: body.description ?? null },
    });
    return NextResponse.json(technology, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
