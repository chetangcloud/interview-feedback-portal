import { cn } from "@/lib/utils";
import type { TechStatsDto } from "@/types";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all",
          value >= 100 ? "bg-emerald-500" : "bg-indigo-500"
        )}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export function TechnologyProgressRow({
  tech,
  active,
  onSelect,
}: {
  tech: TechStatsDto;
  active: boolean;
  onSelect?: (name: string) => void;
}) {
  const pct = tech.questionCount > 0 ? (tech.resolved / tech.questionCount) * 100 : 0;
  return (
    <button
      type="button"
      onClick={() => onSelect?.(tech.name)}
      disabled={!onSelect}
      title={onSelect ? `Switch to ${tech.name}` : undefined}
      className={cn(
        "w-full rounded-lg px-2 py-2 text-left transition-colors",
        active && "bg-indigo-50",
        onSelect && !active && "hover:bg-slate-50",
        onSelect && "cursor-pointer"
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className={cn("flex items-center gap-1.5 text-sm font-medium", active ? "text-indigo-700" : "text-slate-700")}>
          {tech.completed ? (
            <span className="text-emerald-600">✓</span>
          ) : active ? (
            <span className="text-indigo-600">→</span>
          ) : (
            <span className="text-slate-300">○</span>
          )}
          {tech.name}
        </span>
        <span className="text-xs text-slate-500">
          {tech.resolved}/{tech.questionCount}
        </span>
      </div>
      <ProgressBar value={pct} />
    </button>
  );
}
