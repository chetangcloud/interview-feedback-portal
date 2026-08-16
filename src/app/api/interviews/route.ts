import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-utils";
import { getInterviewOrThrow, serializeInterview } from "@/lib/interviews";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") ?? undefined;

    const interviews = await prisma.interview.findMany({
      where: status ? { status: status as "in_progress" | "completed" | "cancelled" } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const detailed = await Promise.all(
      interviews.map(async (i) => serializeInterview(await getInterviewOrThrow(i.id)))
    );

    return NextResponse.json(detailed);
  } catch (error) {
    return handleApiError(error);
  }
}

const createSchema = z.object({
  candidateName: z.string().trim().min(1).max(120),
  interviewerName: z.string().trim().min(1).max(120),
  interviewType: z.string().trim().min(1).max(80).optional(),
  questionsPerTech: z.number().int().min(1).max(20).optional(),
  totalItExperience: z.number().min(0).max(60).optional(),
  relevantExperience: z.number().min(0).max(60).optional(),
  primaryCloud: z.string().trim().min(1).max(60).optional(),
  secondaryCloud: z.string().trim().min(1).max(60).optional(),
  mode: z.enum(["structured", "freehand"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = createSchema.parse(await req.json());

    const interview = await prisma.interview.create({
      data: {
        candidateName: body.candidateName,
        interviewerName: body.interviewerName,
        interviewType: body.interviewType ?? "Technical Interview",
        questionsPerTech: body.questionsPerTech ?? 5,
        totalItExperience: body.totalItExperience,
        relevantExperience: body.relevantExperience,
        primaryCloud: body.primaryCloud,
        secondaryCloud: body.secondaryCloud,
        mode: body.mode ?? "structured",
      },
    });

    return NextResponse.json(serializeInterview(await getInterviewOrThrow(interview.id)), {
      status: 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
