import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/db";
import { getInterviewOrThrow, serializeInterview } from "@/lib/interviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, "amber" | "emerald" | "slate"> = {
  in_progress: "amber",
  completed: "emerald",
  cancelled: "slate",
};

export default async function InterviewsPage() {
  const interviews = await prisma.interview.findMany({ orderBy: { createdAt: "desc" } });
  const detailed = await Promise.all(
    interviews.map(async (i) => serializeInterview(await getInterviewOrThrow(i.id)))
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">Previous Interviews</h1>
      <p className="mt-1 text-sm text-slate-500">All interview sessions, most recent first.</p>

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle>{detailed.length} interview{detailed.length === 1 ? "" : "s"}</CardTitle>
        </CardHeader>
        <CardContent>
          {detailed.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
              <History className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No interviews recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-4">Candidate</th>
                    <th className="py-2 pr-4">Interviewer</th>
                    <th className="py-2 pr-4">Mode</th>
                    <th className="py-2 pr-4">Technologies</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Questions</th>
                    <th className="py-2 pr-4">Score</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detailed.map((interview) => (
                    <tr key={interview.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="py-3 pr-4">
                        <Link href={`/interview/${interview.id}`} className="font-medium text-indigo-600 hover:underline">
                          {interview.candidateName}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{interview.interviewerName}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={interview.mode === "freehand" ? "indigo" : "slate"}>
                          {interview.mode === "freehand" ? "Free Hand" : "Structured"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {interview.technologies.map((t) => t.name).join(", ") || "—"}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {format(new Date(interview.startedAt), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {interview.mode === "freehand" ? "—" : interview.overall.answered}
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {interview.mode === "structured" && interview.overall.answered > 0
                          ? `${interview.overall.score}%`
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusStyles[interview.status]}>{interview.status.replace("_", " ")}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
