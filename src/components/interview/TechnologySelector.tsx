"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { TechnologyDto } from "@/types";

export function TechnologySelector({
  value,
  onChange,
  excludeNames = [],
  autoFocus = false,
}: {
  value: string;
  onChange: (name: string) => void;
  excludeNames?: string[];
  autoFocus?: boolean;
}) {
  const [technologies, setTechnologies] = useState<TechnologyDto[]>([]);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    api.technologies().then(setTechnologies).catch(() => setTechnologies([]));
  }, []);

  useEffect(() => setQuery(value), [value]);

  const excluded = useMemo(() => new Set(excludeNames.map((n) => n.toLowerCase())), [excludeNames]);

  const filtered = technologies
    .filter((t) => !excluded.has(t.name.toLowerCase()))
    .filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          autoFocus={autoFocus}
          placeholder="Search technology, or type your own..."
          className="pl-9"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filtered.length === 0 && query.trim() ? (
          <p className="text-xs text-slate-500">
            No matching technology in the bank — &quot;{query.trim()}&quot; will be added as a new one.
          </p>
        ) : (
          filtered.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setQuery(t.name);
                onChange(t.name);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                value.trim().toLowerCase() === t.name.toLowerCase()
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-700"
              )}
            >
              {t.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
