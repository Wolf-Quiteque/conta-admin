"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-label="Sair"
      disabled={pending}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-danger/40 hover:text-danger active:scale-95 disabled:opacity-60"
    >
      {pending ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <LogOut className="h-4 w-4" strokeWidth={2} />
      )}
    </button>
  );
}
