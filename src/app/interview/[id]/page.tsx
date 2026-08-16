"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Flag } from "lucide-react";
import { InterviewSidebar } from "@/components/interview/InterviewSidebar";
import { ChatTranscript } from "@/components/interview/ChatTranscript";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { NextTechnologyPrompt } from "@/components/interview/NextTechnologyPrompt";
import { ChatCommandBar } from "@/components/interview/ChatCommandBar";
import { FinishInterviewDialog } from "@/components/interview/FinishInterviewDialog";
import { ErrorState } from "@/components/interview/ErrorState";
import { SummaryReport } from "@/components/interview/SummaryReport";
import { FreehandInterviewRoom } from "@/components/interview/FreehandInterviewRoom";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import type { Evaluation, InterviewDto, NextQuestionDto } from "@/types";

type NextState = (NextQuestionDto & { reason?: string }) | null;

export default function InterviewRoomPage({ params }: { params: { id: string } }) {
  const interviewId = params.id;

  const [interview, setInterview] = useState<InterviewDto | null>(null);
  const [nextQ, setNextQ] = useState<NextState>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [addingTech, setAddingTech] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const iv = await api.getInterview(interviewId);
      setInterview(iv);
      if (iv.status === "in_progress" && iv.mode === "structured") {
        const nq = await api.nextQuestion(interviewId);
        setNextQ(nq);
      } else {
        setNextQ(null);
      }
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : "Unable to load this interview."
      );
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    load();
    // Keep duration live and survive refreshes by polling lightly.
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  async function refreshNext() {
    try {
      const nq = await api.nextQuestion(interviewId);
      setNextQ(nq);
    } catch {
      toast.error("Unable to load the next question.");
    }
  }

  async function handleSubmitFeedback(evaluation: Evaluation, note: string) {
    if (!nextQ || nextQ.done) return;
    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(interviewId, nextQ.interviewQuestionId, {
        evaluation,
        note: note || undefined,
      });
      const iv = await api.getInterview(interviewId);
      setInterview(iv);
      await refreshNext();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Unable to save feedback. Your feedback has not been submitted.";
      toast.error(message);
      throw err;
    } finally {
      setSubmittingFeedback(false);
    }
  }

  async function handleAddTechnology(name: string) {
    setAddingTech(true);
    try {
      const iv = await api.addTechnology(interviewId, name);
      setInterview(iv);
      await refreshNext();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to switch to that technology.");
    } finally {
      setAddingTech(false);
    }
  }

  async function handleFinish() {
    setFinishing(true);
    try {
      const iv = await api.completeInterview(interviewId);
      setInterview(iv);
      setNextQ(null);
      setFinishDialogOpen(false);
      toast.success("Interview completed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to finish the interview.");
    } finally {
      setFinishing(false);
    }
  }

  function handleCommand(raw: string) {
    const cmd = raw.toLowerCase();
    if (cmd === "finish") {
      setFinishDialogOpen(true);
      return;
    }
    if (cmd === "next") {
      if (!interview) return;
      const techs = interview.technologies;
      const currentIdx = techs.findIndex((t) => t.technologyId === interview.currentTechnologyId);
      const upcoming =
        techs.slice(currentIdx + 1).find((t) => !t.completed) ??
        techs.find((t, i) => i !== currentIdx && !t.completed);
      if (upcoming) {
        handleAddTechnology(upcoming.name);
      } else {
        toast.error("No more queued technologies. Type a technology name to add one.");
      }
      return;
    }
    handleAddTechnology(raw);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (loadError || !interview) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm">
          <ErrorState message={loadError ?? "Interview not found."} onRetry={load} />
        </div>
      </div>
    );
  }

  if (interview.status === "completed") {
    return <SummaryReport interview={interview} />;
  }

  if (interview.mode === "freehand") {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {interview.candidateName} <span className="font-normal text-slate-400">&middot; Free Hand</span>
            </p>
            <p className="text-xs text-slate-500">
              {interview.interviewerName} &middot; {interview.durationMinutes} min &middot;{" "}
              {interview.technologies.length} technolog{interview.technologies.length === 1 ? "y" : "ies"}
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setFinishDialogOpen(true)}>
            <Flag className="h-4 w-4" /> Finish Interview
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <FreehandInterviewRoom interview={interview} onAddTechnology={handleAddTechnology} addingTech={addingTech} />
        </div>

        <FinishInterviewDialog
          interview={interview}
          open={finishDialogOpen}
          onOpenChange={setFinishDialogOpen}
          onConfirm={handleFinish}
          confirming={finishing}
        />
      </div>
    );
  }

  const activeTechnologyId = interview.currentTechnologyId;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <InterviewSidebar
        interview={interview}
        activeTechnologyId={activeTechnologyId}
        onSelectTechnology={handleAddTechnology}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{interview.interviewType}</p>
            <p className="text-xs text-slate-500">
              {interview.technologies.length} technolog{interview.technologies.length === 1 ? "y" : "ies"} &middot;{" "}
              {interview.overall.answered} question{interview.overall.answered === 1 ? "" : "s"} answered
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setFinishDialogOpen(true)}>
            <Flag className="h-4 w-4" /> Finish Interview
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <ChatTranscript interview={interview} activeTechnologyId={activeTechnologyId} />

            {nextQ && !nextQ.done && (
              <QuestionCard
                technologyId={nextQ.technologyId}
                technologyName={nextQ.technologyName}
                questionOrder={nextQ.questionOrder}
                totalForTech={nextQ.totalForTech}
                question={nextQ.question}
                category={nextQ.category}
                difficulty={nextQ.difficulty}
                onSubmit={handleSubmitFeedback}
                submitting={submittingFeedback}
              />
            )}

            {nextQ && nextQ.done && (
              <NextTechnologyPrompt interview={interview} onStart={handleAddTechnology} starting={addingTech} />
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <ChatCommandBar onCommand={handleCommand} disabled={addingTech} />
        </div>
      </div>

      <FinishInterviewDialog
        interview={interview}
        open={finishDialogOpen}
        onOpenChange={setFinishDialogOpen}
        onConfirm={handleFinish}
        confirming={finishing}
      />
    </div>
  );
}
