import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function notFound(message = "Not found") {
  return new HttpError(404, message);
}

export function badRequest(message = "Invalid request") {
  return new HttpError(400, message);
}

export function conflict(message = "Conflict") {
  return new HttpError(409, message);
}

/**
 * Central error handler for API route handlers. Never leaks internal
 * error details to the client — logs server-side, returns a generic
 * message for unexpected failures.
 */
export function handleApiError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request", details: error.flatten() },
      { status: 400 }
    );
  }
  if (error instanceof Error && error.message === "NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  console.error("API error:", error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
