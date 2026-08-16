import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, notFound } from "@/lib/api-utils";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const summary = await prisma.interviewSummary.findUnique({ where: { interviewId: params.id } });
    if (!summary) throw notFound("No AI summary has been generated for this interview yet.");

    return NextResponse.json({
      interviewId: summary.interviewId,
      summaryText: summary.summaryText,
      generatedBy: summary.generatedBy,
      generatedAt: summary.generatedAt.toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
