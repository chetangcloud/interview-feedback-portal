"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { InterviewDto } from "@/types";

export function FinishInterviewDialog({
  interview,
  open,
  onOpenChange,
  onConfirm,
  confirming,
}: {
  interview: InterviewDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirming: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to finish the interview?</DialogTitle>
          <DialogDescription>This will mark the session as completed.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {interview.mode === "freehand" ? "Technologies covered" : "You have completed"}
          </p>
          <div className="flex flex-col gap-1">
            {interview.technologies.map((t) => (
              <div key={t.technologyId} className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{t.name}</span>
                {interview.mode === "freehand" ? (
                  <span className={t.freehandNotes?.trim() ? "text-emerald-600" : "text-slate-400"}>
                    {t.freehandNotes?.trim() ? "Notes added" : "No notes yet"}
                  </span>
                ) : (
                  <span className="text-slate-500">
                    {t.resolved}/{t.questionCount}
                  </span>
                )}
              </div>
            ))}
            {interview.technologies.length === 0 && (
              <p className="text-sm text-slate-500">No technologies started yet.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={confirming}>
            Continue Interview
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={confirming}>
            {confirming && <Loader2 className="h-4 w-4 animate-spin" />}
            Finish Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
