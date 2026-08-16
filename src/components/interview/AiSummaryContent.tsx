const HEADING_RE = /^\d+\.\s+.+$/;

export function AiSummaryContent({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="flex flex-col gap-1.5 text-sm leading-relaxed text-slate-700">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;
        if (HEADING_RE.test(trimmed)) {
          return (
            <p key={idx} className="mt-3 text-sm font-semibold text-slate-900 first:mt-0">
              {trimmed}
            </p>
          );
        }
        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
          return (
            <p key={idx} className="pl-3">
              {trimmed}
            </p>
          );
        }
        return <p key={idx}>{trimmed}</p>;
      })}
    </div>
  );
}
