import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FeedbackForm } from "@/components/interview/FeedbackForm";
import type { Evaluation } from "@/types";

const difficultyVariant = { easy: "emerald", medium: "amber", hard: "rose" } as const;

export function QuestionCard({
  technologyId,
  technologyName,
  questionOrder,
  totalForTech,
  question,
  category,
  difficulty,
  onSubmit,
  submitting,
}: {
  technologyId: string;
  technologyName: string;
  questionOrder: number;
  totalForTech: number;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  onSubmit: (evaluation: Evaluation, note: string) => Promise<void> | void;
  submitting: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 rounded-t-2xl border-b border-slate-100 bg-slate-50 px-5 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white">
          <Bot className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-slate-700">Interview Bot</span>
        <span className="ml-auto text-xs font-medium text-slate-500">{technologyName}</span>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="indigo">
            Question {questionOrder} of {totalForTech}
          </Badge>
          <Badge variant="slate">{category}</Badge>
          <Badge variant={difficultyVariant[difficulty]}>{difficulty}</Badge>
        </div>

        <p className="mb-5 text-lg font-medium leading-relaxed text-slate-900">{question}</p>

        <div className="my-4 border-t border-dashed border-slate-200" />

        <FeedbackForm
          technologyId={technologyId}
          category={category}
          onSubmit={onSubmit}
          disabled={submitting}
        />
      </div>
    </div>
  );
}
