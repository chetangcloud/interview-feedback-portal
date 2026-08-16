import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleApiError, badRequest } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const technologyId = req.nextUrl.searchParams.get("technologyId");
    const category = req.nextUrl.searchParams.get("category");
    if (!technologyId) {
      throw badRequest("technologyId is required.");
    }

    const suggestions = await prisma.noteSuggestion.findMany({
      where: { technologyId, active: true, ...(category ? { category } : {}) },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    return handleApiError(error);
  }
}
