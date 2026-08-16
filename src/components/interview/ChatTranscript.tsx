import { Bot, CheckCircle2, HelpCircle, XCircle, SkipForward } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TechnologySummaryPanel } from "@/components/interview/TechnologySummaryPanel";
import { cn } from "@/lib/utils";
import type { InterviewDto } from "@/types";

const evalMeta = {
  correct: { label: "Correct", icon: CheckCircle2, className: "text-emerald-600" },
  partially_correct: { label: "Partially Correct", icon: HelpCircle, className: "text-amber-600" },
  incorrect: { label: "Incorrect", icon: XCircle, className: "text-rose-600" },
  skipped: { label: "Not Asked (Skipped)", icon: SkipForward, className: "text-slate-400" },
} as const;

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
        <Bot className="h-4 w-4" />
      </span>
      <div className="flex-1 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
        {children}
      </div>
    </div>
  );
}

export function ChatTranscript({
  interview,
  activeTechnologyId,
}: {
  interview: InterviewDto;
  activeTechnologyId: string | null;
}) {
  const started = interview.technologies.filter(
    (tech) => tech.resolved > 0 || tech.completed || tech.technologyId === activeTechnologyId
  );

  return (
    <div className="flex flex-col gap-4">
      {started.map((tech) => {
        const items = interview.transcript
          .filter((t) => t.technologyId === tech.technologyId && t.evaluation !== null)
          .sort((a, b) => a.questionOrder - b.questionOrder);

        return (
          <div key={tech.technologyId} className="flex flex-col gap-3">
            <BotBubble>
              <p className="text-sm text-slate-700">
                Starting <span className="font-semibold">{tech.name}</span> interview section.
              </p>
            </BotBubble>

            {items.map((item) => {
              const meta = evalMeta[item.evaluation!];
              return (
                <BotBubble key={item.id}>
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge variant="slate">
                      Question {item.questionOrder} of {tech.questionCount}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-900">{item.questionText}</p>
                  <div className={cn("mt-2 flex items-center gap-1.5 text-sm font-medium", meta.className)}>
                    <meta.icon className="h-4 w-4" />
                    {meta.label}
                  </div>
                  {item.note && (
                    <p className="mt-1.5 rounded-md bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
                      &ldquo;{item.note}&rdquo;
                    </p>
                  )}
                </BotBubble>
              );
            })}

            {tech.completed && (
              <BotBubble>
                <p className="text-sm font-semibold text-slate-900">{tech.name} completed.</p>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600 sm:grid-cols-4">
                  <span>Questions: {tech.questionCount}</span>
                  <span className="text-emerald-600">Correct: {tech.correct}</span>
                  <span className="text-amber-600">Partial: {tech.partial}</span>
                  <span className="text-rose-600">Incorrect: {tech.incorrect}</span>
                  {tech.skipped > 0 && <span className="text-slate-400">Skipped: {tech.skipped}</span>}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-700">Accuracy: {tech.score}%</p>
              </BotBubble>
            )}

            {tech.answered > 0 && (
              <TechnologySummaryPanel
                interviewId={interview.id}
                technologyId={tech.technologyId}
                technologyName={tech.name}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
