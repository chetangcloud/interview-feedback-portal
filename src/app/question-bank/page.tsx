"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, EyeOff, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionDialog } from "@/components/question-bank/QuestionDialog";
import { TechnologyDialog } from "@/components/question-bank/TechnologyDialog";
import { api, ApiError } from "@/lib/api-client";
import type { Difficulty, QuestionDto, TechnologyDto } from "@/types";

type QuestionRow = QuestionDto & { technology: TechnologyDto };

const difficultyVariant: Record<Difficulty, "emerald" | "amber" | "rose"> = {
  easy: "emerald",
  medium: "amber",
  hard: "rose",
};

export default function QuestionBankPage() {
  const [technologies, setTechnologies] = useState<TechnologyDto[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [technologyFilter, setTechnologyFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionDto | null>(null);
  const [techDialogOpen, setTechDialogOpen] = useState(false);

  const loadTechnologies = useCallback(async () => {
    const techs = await api.technologies();
    setTechnologies(techs);
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api.listQuestions({
        technologyId: technologyFilter || undefined,
        difficulty: difficultyFilter || undefined,
        category: categoryFilter || undefined,
        search: search || undefined,
        includeInactive: true,
      });
      setQuestions(rows);
    } catch {
      toast.error("Unable to load questions.");
    } finally {
      setLoading(false);
    }
  }, [technologyFilter, difficultyFilter, categoryFilter, search]);

  useEffect(() => {
    loadTechnologies();
  }, [loadTechnologies]);

  useEffect(() => {
    const t = setTimeout(loadQuestions, 200);
    return () => clearTimeout(t);
  }, [loadQuestions]);

  const categories = useMemo(
    () => Array.from(new Set(questions.map((q) => q.category))).sort(),
    [questions]
  );

  async function handleSaveQuestion(data: {
    id?: string;
    technologyId: string;
    category: string;
    difficulty: Difficulty;
    questionText: string;
  }) {
    try {
      if (data.id) {
        await api.updateQuestion(data.id, {
          category: data.category,
          difficulty: data.difficulty,
          questionText: data.questionText,
        });
        toast.success("Question updated");
      } else {
        await api.createQuestion(data);
        toast.success("Question added");
      }
      await loadQuestions();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to save question.");
      throw err;
    }
  }

  async function handleToggleActive(q: QuestionRow) {
    try {
      await api.updateQuestion(q.id, { active: !q.active });
      toast.success(q.active ? "Question deactivated" : "Question activated");
      await loadQuestions();
    } catch {
      toast.error("Unable to update question.");
    }
  }

  async function handleDelete(q: QuestionRow) {
    if (!confirm("Remove this question from the bank?")) return;
    try {
      await api.deleteQuestion(q.id);
      toast.success("Question removed");
      await loadQuestions();
    } catch {
      toast.error("Unable to delete question.");
    }
  }

  async function handleSaveTechnology(data: { name: string; description?: string }) {
    try {
      await api.createTechnology(data);
      toast.success("Technology added");
      await loadTechnologies();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to add technology.");
      throw err;
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Question Bank</h1>
          <p className="mt-1 text-sm text-slate-500">Manage technologies and interview questions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setTechDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Add Technology
          </Button>
          <Button
            onClick={() => {
              setEditingQuestion(null);
              setQuestionDialogOpen(true);
            }}
            disabled={technologies.length === 0}
          >
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm"
              value={technologyFilter}
              onChange={(e) => setTechnologyFilter(e.target.value)}
            >
              <option value="">All Technologies</option>
              {technologies.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle>
            {loading ? "Loading..." : `${questions.length} question${questions.length === 1 ? "" : "s"}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!loading && questions.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No questions match these filters.</p>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {questions.map((q) => (
                <div key={q.id} className="flex items-start justify-between gap-4 py-3">
                  <div className={q.active ? "" : "opacity-50"}>
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="indigo">{q.technology.name}</Badge>
                      <Badge variant="slate">{q.category}</Badge>
                      <Badge variant={difficultyVariant[q.difficulty]}>{q.difficulty}</Badge>
                      {!q.active && <Badge variant="default">inactive</Badge>}
                    </div>
                    <p className="text-sm text-slate-800">{q.questionText}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingQuestion(q);
                        setQuestionDialogOpen(true);
                      }}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(q)}
                      title={q.active ? "Deactivate" : "Activate"}
                    >
                      {q.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(q)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <QuestionDialog
        open={questionDialogOpen}
        onOpenChange={setQuestionDialogOpen}
        technologies={technologies}
        editing={editingQuestion}
        onSave={handleSaveQuestion}
      />
      <TechnologyDialog open={techDialogOpen} onOpenChange={setTechDialogOpen} onSave={handleSaveTechnology} />
    </main>
  );
}
