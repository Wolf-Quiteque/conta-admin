import { clsx } from "clsx";

export type UserStatus = "pendente" | "aprovado" | "rejeitado";

const LABELS: Record<UserStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export function StatusBadge({
  status,
  className,
}: {
  status: UserStatus;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium",
        {
          pendente: "bg-warning/15 text-warning",
          aprovado: "bg-success/15 text-success",
          rejeitado: "bg-danger/15 text-danger",
        }[status],
        className,
      )}
    >
      <span
        className={clsx("h-1.5 w-1.5 rounded-full", {
          pendente: "bg-warning",
          aprovado: "bg-success",
          rejeitado: "bg-danger",
        }[status])}
      />
      {LABELS[status]}
    </span>
  );
}
