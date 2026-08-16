"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChatCommandBar({
  onCommand,
  disabled,
}: {
  onCommand: (raw: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onCommand(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Type a technology name, "next", or "finish"...'
        disabled={disabled}
      />
      <Button type="submit" size="icon" variant="secondary" disabled={disabled || !value.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
