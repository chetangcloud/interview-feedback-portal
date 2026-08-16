import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError, notFound } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const technologyId = sp.get("technologyId") ?? undefined;
    const difficulty = sp.get("difficulty") ?? undefined;
    const category = sp.get("category") ?? undefined;
    const search = sp.get("search")?.trim();
    const includeInactive = sp.get("includeInactive") === "true";

    const questions = await prisma.question.findMany({
      where: {
        ...(technologyId ? { technologyId } : {}),
        ...(difficulty ? { difficulty: difficulty as "easy" | "medium" | "hard" } : {}),
        ...(category ? { category } : {}),
        ...(includeInactive ? {} : { active: true }),
        ...(search ? { questionText: { contains: search, mode: "insensitive" } } : {}),
      },
      include: { technology: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    return handleApiError(error);
  }
}

const createSchema = z.object({
  technologyId: z.string().uuid(),
  category: z.string().trim().min(1).max(60),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionText: z.string().trim().min(5).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    const body = createSchema.parse(await req.json());

    const technology = await prisma.technology.findUnique({ where: { id: body.technologyId } });
    if (!technology) throw notFound("Technology not found");

    const question = await prisma.question.create({ data: body });
    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
