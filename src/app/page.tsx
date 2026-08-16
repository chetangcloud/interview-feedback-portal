import Link from "next/link";
import { prisma } from "@/lib/db";
import { getInterviewOrThrow, serializeInterview } from "@/lib/interviews";
import { calculateScore, countEvaluations } from "@/lib/scoring";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Layers, Percent, Plus, Users, BookOpen, History } from "lucide-react";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [totalInterviews, totalQuestionsAnswered, distinctTechnologies, completed, recentInterviews] =
    await Promise.all([
      prisma.interview.count({ where: { status: { not: "cancelled" } } }),
      prisma.interviewQuestion.count({
        where: { evaluation: { in: ["correct", "partially_correct", "incorrect"] } },
      }),
      prisma.interviewTechnology.findMany({ distinct: ["technologyId"], select: { technologyId: true } }),
      prisma.interview.findMany({
        where: { status: "completed", mode: "structured" },
        include: { questions: true },
      }),
      prisma.interview.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  const scores = completed.map((interview) => {
    const counts = countEvaluations(interview.questions.map((q) => q.evaluation));
    return calculateScore(counts);
  });
  const avgCorrectPercent =
    scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;

  const recent = await Promise.all(
    recentInterviews.map(async (i) => serializeInterview(await getInterviewOrThrow(i.id)))
  );

  return {
    stats: {
      totalInterviews,
      totalQuestions: totalQuestionsAnswered,
      technologiesCovered: distinctTechnologies.length,
      avgCorrectPercent,
    },
    recent,
  };
}

const statusStyles: Record<string, "amber" | "emerald" | "slate"> = {
  in_progress: "amber",
  completed: "emerald",
  cancelled: "slate",
};

export default async function DashboardPage() {
  const { stats, recent } = await getDashboardData();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            DevOps & Cloud technical interview feedback portal.
          </p>
        </div>
        <Link href="/interview/new">
          <Button size="lg">
            <Plus className="h-4 w-4" />
            Start New Interview
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Interviews" value={stats.totalInterviews} icon={Users} accent="indigo" />
        <StatCard label="Total Questions" value={stats.totalQuestions} icon={ClipboardList} accent="slate" />
        <StatCard label="Technologies Covered" value={stats.technologiesCovered} icon={Layers} accent="amber" />
        <StatCard label="Average Correct %" value={`${stats.avgCorrectPercent}%`} icon={Percent} accent="emerald" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle>Previous Interviews</CardTitle>
            <Link href="/interviews" className="text-sm font-medium text-indigo-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <History className="h-8 w-8 text-slate-300" />
                <p className="text-sm text-slate-500">No interviews yet. Start your first one.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent.map((interview) => (
                  <Link
                    key={interview.id}
                    href={`/interview/${interview.id}`}
                    className="flex items-center justify-between gap-4 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {interview.candidateName}
                        {interview.mode === "freehand" && (
                          <span className="ml-1.5 text-xs font-normal text-indigo-500">Free Hand</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {interview.interviewerName} &middot;{" "}
                        {interview.technologies.map((t) => t.name).join(", ") || "No technologies yet"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700">
                        {interview.mode === "structured" && interview.overall.answered > 0
                          ? `${interview.overall.score}%`
                          : "—"}
                      </span>
                      <Badge variant={statusStyles[interview.status]}>{interview.status.replace("_", " ")}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Link href="/interview/new">
              <Button variant="secondary" className="w-full justify-start">
                <Plus className="h-4 w-4" /> Start New Interview
              </Button>
            </Link>
            <Link href="/question-bank">
              <Button variant="secondary" className="w-full justify-start">
                <BookOpen className="h-4 w-4" /> Question Bank
              </Button>
            </Link>
            <Link href="/interviews">
              <Button variant="secondary" className="w-full justify-start">
                <History className="h-4 w-4" /> Previous Interviews
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
