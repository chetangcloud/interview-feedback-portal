"use client";

import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import type { NoteSuggestionDto } from "@/types";

export function NoteSuggestionChips({
  technologyId,
  category,
  onInsert,
  disabled,
}: {
  technologyId: string;
  category?: string;
  onInsert: (text: string) => void;
  disabled?: boolean;
}) {
  const [suggestions, setSuggestions] = useState<NoteSuggestionDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .listNoteSuggestions(technologyId, category)
      .then((data) => {
        if (!cancelled) setSuggestions(data);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [technologyId, category]);

  if (suggestions.length === 0) return null;

  const positive = suggestions.filter((s) => s.sentiment === "positive");
  const negative = suggestions.filter((s) => s.sentiment === "negative");

  return (
    <div className="mb-2 flex flex-col gap-1.5">
      <p className="text-xs font-medium text-slate-400">Tap a phrase to add it to notes</p>
      <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1">
        {positive.map((s) => (
          <Chip key={s.id} sentiment="positive" text={s.text} onClick={() => onInsert(s.text)} disabled={disabled} />
        ))}
        {negative.map((s) => (
          <Chip key={s.id} sentiment="negative" text={s.text} onClick={() => onInsert(s.text)} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}

function Chip({
  sentiment,
  text,
  onClick,
  disabled,
}: {
  sentiment: "positive" | "negative";
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex max-w-full items-start gap-1 rounded-full border px-2.5 py-1 text-left text-xs transition-colors disabled:opacity-50",
        sentiment === "positive"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400"
          : "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400"
      )}
    >
      {sentiment === "positive" ? (
        <ThumbsUp className="mt-0.5 h-3 w-3 shrink-0" />
      ) : (
        <ThumbsDown className="mt-0.5 h-3 w-3 shrink-0" />
      )}
      <span className="line-clamp-2">{text}</span>
    </button>
  );
}
