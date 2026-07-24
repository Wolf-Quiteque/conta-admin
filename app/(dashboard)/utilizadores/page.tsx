import Link from "next/link";
import { clsx } from "clsx";
import { and, count, desc, eq, sum } from "drizzle-orm";
import { ChevronRight, Clock, Receipt, Users as UsersIcon, Wallet } from "lucide-react";
import { db } from "@/lib/db/client";
import { receipts, users } from "@/lib/db/schema";
import { formatCurrencyKz, formatDate } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { StatusBadge, type UserStatus } from "@/components/ui/status-badge";
import { approveUser, rejectUser } from "./actions";

export const metadata = { title: "Utilizadores" };

type Tab = UserStatus | "todos";

const TABS: { value: Tab; label: string }[] = [
  { value: "pendente", label: "Pendentes" },
  { value: "aprovado", label: "Aprovados" },
  { value: "rejeitado", label: "Rejeitados" },
  { value: "todos", label: "Todos" },
];

export default async function UtilizadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeTab: Tab = TABS.some((t) => t.value === status)
    ? (status as Tab)
    : "pendente";

  const [statusCounts, [receiptStats], clientUsers] = await Promise.all([
    db
      .select({ status: users.status, total: count() })
      .from(users)
      .where(eq(users.role, "cliente"))
      .groupBy(users.status),
    db
      .select({ totalReceipts: count(), totalValue: sum(receipts.amount) })
      .from(receipts),
    db
      .select()
      .from(users)
      .where(
        activeTab === "todos"
          ? eq(users.role, "cliente")
          : and(eq(users.role, "cliente"), eq(users.status, activeTab)),
      )
      .orderBy(desc(users.createdAt)),
  ]);

  const counts: Record<UserStatus, number> = {
    pendente: 0,
    aprovado: 0,
    rejeitado: 0,
  };
  for (const row of statusCounts) counts[row.status] = row.total;
  const totalUsers = counts.pendente + counts.aprovado + counts.rejeitado;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<UsersIcon className="h-4 w-4" />}
          label="Utilizadores"
          value={String(totalUsers)}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Pendentes"
          value={String(counts.pendente)}
          highlight={counts.pendente > 0}
        />
        <StatCard
          icon={<Receipt className="h-4 w-4" />}
          label="Recibos"
          value={String(receiptStats?.totalReceipts ?? 0)}
        />
        <StatCard
          icon={<Wallet className="h-4 w-4" />}
          label="Valor total"
          value={formatCurrencyKz(receiptStats?.totalValue ?? 0)}
        />
      </div>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/utilizadores?status=${tab.value}`}
            className={clsx(
              "shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors",
              activeTab === tab.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.value !== "todos" && ` (${counts[tab.value]})`}
          </Link>
        ))}
      </div>

      {clientUsers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-16 text-center text-[14px] text-muted-foreground">
          Sem utilizadores nesta categoria.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {clientUsers.map((user) => (
            <li
              key={user.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{user.name}</p>
                  <StatusBadge status={user.status} />
                </div>
                <p className="truncate text-[13px] text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-[12px] text-muted">
                  Registado em {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {user.status !== "aprovado" && (
                  <form action={approveUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className={buttonClasses({ variant: "primary", size: "sm" })}
                    >
                      Aprovar
                    </button>
                  </form>
                )}
                {user.status !== "rejeitado" && (
                  <form action={rejectUser}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className={buttonClasses({ variant: "secondary", size: "sm" })}
                    >
                      Rejeitar
                    </button>
                  </form>
                )}
                <Link
                  href={`/utilizadores/${user.id}`}
                  className={buttonClasses({ variant: "ghost", size: "sm" })}
                >
                  Ver
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border p-4",
        highlight ? "border-warning/40 bg-warning/10" : "border-border bg-surface",
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[12.5px]">{label}</span>
      </div>
      <p className="mt-1.5 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
