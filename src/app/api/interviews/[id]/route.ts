import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-utils";
import { getInterviewOrThrow, serializeInterview } from "@/lib/interviews";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const interview = await getInterviewOrThrow(params.id);
    return NextResponse.json(serializeInterview(interview));
  } catch (error) {
    return handleApiError(error);
  }
}
