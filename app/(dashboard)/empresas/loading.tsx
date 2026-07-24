import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[74px]" />
        ))}
      </div>

      <div className="flex gap-1.5">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>

      <ul className="space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-2xl" />
              <Skeleton className="h-9 w-20 rounded-2xl" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
