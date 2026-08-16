"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, PenLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { NoteSuggestionChips } from "@/components/interview/NoteSuggestionChips";
import { TechnologySummaryPanel } from "@/components/interview/TechnologySummaryPanel";
import { api } from "@/lib/api-client";
import type { TechStatsDto } from "@/types";

export function FreehandTechBox({
  interviewId,
  tech,
  disabled,
}: {
  interviewId: string;
  tech: TechStatsDto;
  disabled?: boolean;
}) {
  const [notes, setNotes] = useState(tech.freehandNotes ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  function scheduleSave(value: string) {
    setSaveState("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      api
        .updateTechNotes(interviewId, tech.technologyId, value)
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("idle"));
    }, 800);
  }

  function handleChange(value: string) {
    setNotes(value);
    scheduleSave(value);
  }

  function handleInsert(text: string) {
    const next = notes.trim() ? `${notes.trim()} ${text}` : text;
    handleChange(next);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50 px-5 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <PenLine className="h-4 w-4 text-indigo-600" />
          {tech.name}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          {saveState === "saving" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </>
          )}
          {saveState === "saved" && (
            <>
              <Check className="h-3 w-3 text-emerald-500" /> Saved
            </>
          )}
        </span>
      </div>

      <div className="p-5">
        <NoteSuggestionChips technologyId={tech.technologyId} onInsert={handleInsert} disabled={disabled} />
        <Textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Type your observations about the candidate's ${tech.name} knowledge as you go — grammar and typos are fine, it'll be cleaned up in the summary.`}
          disabled={disabled}
          className="min-h-[160px]"
        />

        {notes.trim().length > 0 && (
          <div className="mt-4">
            <TechnologySummaryPanel interviewId={interviewId} technologyId={tech.technologyId} technologyName={tech.name} />
          </div>
        )}
      </div>
    </div>
  );
}
