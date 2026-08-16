"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TechnologyDto } from "@/types";

export function TechnologyMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (names: string[]) => void;
}) {
  const [technologies, setTechnologies] = useState<TechnologyDto[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.technologies().then(setTechnologies).catch(() => setTechnologies([]));
  }, []);

  const selectedLower = useMemo(() => new Set(value.map((n) => n.toLowerCase())), [value]);

  const filtered = technologies.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));

  const exactMatch = technologies.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  function toggle(name: string) {
    const lower = name.toLowerCase();
    if (selectedLower.has(lower)) {
      onChange(value.filter((n) => n.toLowerCase() !== lower));
    } else {
      onChange([...value, name]);
    }
  }

  function addCustom() {
    const trimmed = query.trim();
    if (!trimmed || selectedLower.has(trimmed.toLowerCase())) return;
    onChange([...value, trimmed]);
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((name) => (
            <span
              key={name}
              className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white"
            >
              {name}
              <button
                type="button"
                onClick={() => toggle(name)}
                className="rounded-full p-0.5 hover:bg-indigo-700"
                aria-label={`Remove ${name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search technology, or type your own..."
          className="pl-9 pr-20"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        {query.trim() && !exactMatch && (
          <button
            type="button"
            onClick={addCustom}
            className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-800"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filtered.map((t) => {
          const isSelected = selectedLower.has(t.name.toLowerCase());
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.name)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isSelected
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-700"
              )}
            >
              {isSelected ? "✓ " : ""}
              {t.name}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">
        Select one or more technologies to queue for this interview. You can add more later from
        the interview chat.
      </p>
    </div>
  );
}
