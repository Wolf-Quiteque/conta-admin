"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function DateFilter({
  date,
  todayISO,
}: {
  date: string;
  todayISO: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function goToDate(next: string) {
    router.push(`${pathname}?date=${next}`);
  }

  function shiftDay(delta: number) {
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + delta);
    goToDate(d.toISOString().slice(0, 10));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => shiftDay(-1)}
        aria-label="Dia anterior"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <input
        type="date"
        value={date}
        max={todayISO}
        onChange={(event) => event.target.value && goToDate(event.target.value)}
        className="h-9 rounded-xl border border-border bg-surface px-3 text-[13.5px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
      />

      <button
        type="button"
        onClick={() => shiftDay(1)}
        disabled={date >= todayISO}
        aria-label="Dia seguinte"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {date !== todayISO && (
        <button
          type="button"
          onClick={() => goToDate(todayISO)}
          className="h-9 rounded-xl border border-primary/40 bg-primary/10 px-3 text-[13px] font-medium text-primary"
        >
          Hoje
        </button>
      )}
    </div>
  );
}
