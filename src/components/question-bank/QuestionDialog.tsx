"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Difficulty, QuestionDto, TechnologyDto } from "@/types";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const DEFAULT_CATEGORIES = [
  "Fundamentals",
  "Architecture",
  "Networking",
  "Security",
  "Troubleshooting",
  "Deployment",
  "Monitoring",
  "CI/CD",
  "Infrastructure",
  "Production",
  "Best Practices",
];

export function QuestionDialog({
  open,
  onOpenChange,
  technologies,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technologies: TechnologyDto[];
  editing: QuestionDto | null;
  onSave: (data: {
    id?: string;
    technologyId: string;
    category: string;
    difficulty: Difficulty;
    questionText: string;
  }) => Promise<void>;
}) {
  const [technologyId, setTechnologyId] = useState("");
  const [category, setCategory] = useState("Fundamentals");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionText, setQuestionText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTechnologyId(editing?.technologyId ?? technologies[0]?.id ?? "");
      setCategory(editing?.category ?? "Fundamentals");
      setDifficulty(editing?.difficulty ?? "medium");
      setQuestionText(editing?.questionText ?? "");
    }
  }, [open, editing, technologies]);

  const canSave = technologyId && category.trim() && questionText.trim().length >= 5 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        id: editing?.id,
        technologyId,
        category: category.trim(),
        difficulty,
        questionText: questionText.trim(),
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Question" : "Add Question"}</DialogTitle>
          <DialogDescription>Questions are added to the shared question bank.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Technology</label>
              <select
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm"
                value={technologyId}
                onChange={(e) => setTechnologyId(e.target.value)}
              >
                {technologies.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Difficulty</label>
              <select
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d[0].toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Category</label>
            <Input
              list="category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Networking"
            />
            <datalist id="category-options">
              {DEFAULT_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Question</label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="How does Kubernetes service discovery work?"
              className="min-h-[110px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
