"use client";

import { useMemo, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechnologySelector } from "@/components/interview/TechnologySelector";
import { FreehandTechBox } from "@/components/interview/FreehandTechBox";
import type { InterviewDto } from "@/types";

export function FreehandInterviewRoom({
  interview,
  onAddTechnology,
  addingTech,
}: {
  interview: InterviewDto;
  onAddTechnology: (name: string) => Promise<void>;
  addingTech: boolean;
}) {
  const [newTech, setNewTech] = useState("");
  const usedNames = useMemo(() => interview.technologies.map((t) => t.name), [interview.technologies]);

  async function handleAdd() {
    if (!newTech.trim()) return;
    await onAddTechnology(newTech.trim());
    setNewTech("");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      {interview.technologies.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No technologies queued yet — add one below to get started.
        </p>
      )}

      {interview.technologies.map((tech) => (
        <FreehandTechBox key={tech.technologyId} interviewId={interview.id} tech={tech} />
      ))}

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Add another technology</p>
        <TechnologySelector value={newTech} onChange={setNewTech} excludeNames={usedNames} />
        <Button className="mt-3" onClick={handleAdd} disabled={!newTech.trim() || addingTech}>
          {addingTech ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Technology
        </Button>
      </div>
    </div>
  );
}
