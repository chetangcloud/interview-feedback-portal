"use client";

import { useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechnologySelector } from "@/components/interview/TechnologySelector";
import type { InterviewDto } from "@/types";

export function NextTechnologyPrompt({
  interview,
  onStart,
  starting,
}: {
  interview: InterviewDto;
  onStart: (technology: string) => Promise<void> | void;
  starting: boolean;
}) {
  const [technology, setTechnology] = useState("");
  // Exclude only the technology currently in focus — every other queued
  // technology (even a completed one) stays selectable so the interviewer
  // can jump back to it at any time.
  const currentName = interview.technologies.find(
    (t) => t.technologyId === interview.currentTechnologyId
  )?.name;
  const excludeNames = currentName ? [currentName] : [];

  async function handleStart() {
    if (!technology.trim()) return;
    await onStart(technology.trim());
    setTechnology("");
  }

  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
        <Bot className="h-4 w-4" />
      </span>
      <div className="flex-1 rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-slate-700">What would you like to do?</p>
        <TechnologySelector value={technology} onChange={setTechnology} excludeNames={excludeNames} autoFocus />
        <Button className="mt-3" onClick={handleStart} disabled={!technology.trim() || starting}>
          {starting && <Loader2 className="h-4 w-4 animate-spin" />}
          Start Technology
        </Button>
      </div>
    </div>
  );
}
