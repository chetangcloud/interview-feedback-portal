import Link from "next/link";
import { ArrowLeft, Clock, User } from "lucide-react";
import { TechnologyProgressRow, ProgressBar } from "@/components/interview/InterviewProgress";
import type { InterviewDto } from "@/types";

export function InterviewSidebar({
  interview,
  activeTechnologyId,
  onSelectTechnology,
}: {
  interview: InterviewDto;
  activeTechnologyId: string | null;
  onSelectTechnology?: (name: string) => void;
}) {
  const totalAnswered = interview.overall.resolved;
  const totalQuestions = interview.technologies.reduce((sum, t) => sum + t.questionCount, 0);
  const overallPct = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <Link href="/" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Interview</p>

        <div className="mt-2 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <User className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{interview.candidateName}</p>
            <p className="text-xs text-slate-500">{interview.interviewerName}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          Duration: {interview.durationMinutes} min
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Technologies</p>
        <div className="flex flex-col gap-1">
          {interview.technologies.map((tech) => (
            <TechnologyProgressRow
              key={tech.technologyId}
              tech={tech}
              active={tech.technologyId === activeTechnologyId}
              onSelect={onSelectTechnology}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Interview Progress</span>
          <span>
            {totalAnswered} / {totalQuestions}
          </span>
        </div>
        <ProgressBar value={overallPct} />
      </div>
    </aside>
  );
}
