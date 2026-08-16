import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
      <AlertTriangle className="h-8 w-8 text-rose-500" />
      <p className="text-sm font-medium text-rose-700">{message}</p>
      <Button variant="destructive" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
