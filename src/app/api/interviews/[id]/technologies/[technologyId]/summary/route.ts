import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, notFound } from "@/lib/api-utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; technologyId: string } }
) {
  try {
    const summary = await prisma.interviewTechnologySummary.findUnique({
      where: { interviewId_technologyId: { interviewId: params.id, technologyId: params.technologyId } },
      include: { technology: true },
    });
    if (!summary) throw notFound("No AI summary has been generated for this technology yet.");

    return NextResponse.json({
      interviewId: summary.interviewId,
      technologyId: summary.technologyId,
      technologyName: summary.technology.name,
      summaryText: summary.summaryText,
      generatedBy: summary.generatedBy,
      generatedAt: summary.generatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
