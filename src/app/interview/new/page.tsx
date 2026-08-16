"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TechnologyMultiSelect } from "@/components/interview/TechnologyMultiSelect";
import { api, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Loader2, ListChecks, PenLine } from "lucide-react";
import type { InterviewMode } from "@/types";

const DEFAULT_QUESTIONS_PER_TECH = 5;
const CLOUD_OPTIONS = ["AWS", "Azure", "GCP", "Multi-cloud"];

export default function StartInterviewPage() {
  const router = useRouter();
  const [mode, setMode] = useState<InterviewMode>("structured");
  const [candidateName, setCandidateName] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [interviewType, setInterviewType] = useState("Technical Interview");
  const [totalItExperience, setTotalItExperience] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [primaryCloud, setPrimaryCloud] = useState("");
  const [secondaryCloud, setSecondaryCloud] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    candidateName.trim().length > 0 &&
    interviewerName.trim().length > 0 &&
    technologies.length > 0 &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const interview = await api.createInterview({
        candidateName: candidateName.trim(),
        interviewerName: interviewerName.trim(),
        interviewType,
        questionsPerTech: DEFAULT_QUESTIONS_PER_TECH,
        totalItExperience: totalItExperience.trim() ? Number(totalItExperience) : undefined,
        relevantExperience: relevantExperience.trim() ? Number(relevantExperience) : undefined,
        primaryCloud: primaryCloud.trim() || undefined,
        secondaryCloud: secondaryCloud.trim() || undefined,
        mode,
      });

      let addedCount = 0;
      for (const tech of technologies) {
        try {
          await api.addTechnology(interview.id, tech);
          addedCount++;
        } catch (err) {
          toast.error(err instanceof ApiError ? `${tech}: ${err.message}` : `Unable to add ${tech}.`);
        }
      }

      if (addedCount === 0) {
        toast.error("Unable to start the interview — none of the selected technologies could be added.");
        setSubmitting(false);
        return;
      }

      toast.success("Interview started");
      router.push(`/interview/${interview.id}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to start the interview.";
      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">Start Interview</h1>
      <p className="mt-1 text-sm text-slate-500">
        Set up the interview session, then queue up the technologies to cover.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
          <CardDescription>Candidate name, interviewer, and technologies are required to begin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Candidate Name</label>
              <Input
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Interviewer</label>
              <Input
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Interview Type</label>
              <Input
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                placeholder="Technical Interview"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Total IT Experience <span className="font-normal text-slate-400">(years)</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  step={0.5}
                  value={totalItExperience}
                  onChange={(e) => setTotalItExperience(e.target.value)}
                  placeholder="e.g. 8"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Relevant Experience <span className="font-normal text-slate-400">(years)</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  max={60}
                  step={0.5}
                  value={relevantExperience}
                  onChange={(e) => setRelevantExperience(e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Primary Cloud</label>
                <Input
                  list="cloud-options"
                  value={primaryCloud}
                  onChange={(e) => setPrimaryCloud(e.target.value)}
                  placeholder="e.g. AWS"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Secondary Cloud <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <Input
                  list="cloud-options"
                  value={secondaryCloud}
                  onChange={(e) => setSecondaryCloud(e.target.value)}
                  placeholder="e.g. Azure"
                />
              </div>
              <datalist id="cloud-options">
                {CLOUD_OPTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Select Technologies</label>
              <TechnologyMultiSelect value={technologies} onChange={setTechnologies} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Interview Mode</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ModeCard
                  active={mode === "structured"}
                  onClick={() => setMode("structured")}
                  icon={ListChecks}
                  title="Structured"
                  description="Question bank, one at a time, Correct / Partial / Incorrect per question."
                />
                <ModeCard
                  active={mode === "freehand"}
                  onClick={() => setMode("freehand")}
                  icon={PenLine}
                  title="Free Hand"
                  description="Ask your own questions. One open notes box per technology — AI turns your notes into a clean summary."
                />
              </div>
            </div>

            <Button type="submit" size="lg" disabled={!canSubmit} className="mt-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Start Interview
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof ListChecks;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1.5 rounded-lg border-2 p-3 text-left transition-colors",
        active ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <span className={cn("flex items-center gap-1.5 text-sm font-semibold", active ? "text-indigo-700" : "text-slate-800")}>
        <Icon className="h-4 w-4" />
        {title}
      </span>
      <span className="text-xs text-slate-500">{description}</span>
    </button>
  );
}
