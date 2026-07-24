import Link from "next/link";
import { clsx } from "clsx";
import { count, desc, eq, sum } from "drizzle-orm";
import {
  Building2,
  ChevronRight,
  Clock,
  Receipt,
  Wallet,
} from "lucide-react";
import { db } from "@/lib/db/client";
import { companies, receipts, users } from "@/lib/db/schema";
import { formatCurrencyKz, formatDate } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBadge, type UserStatus } from "@/components/ui/status-badge";
import { approveCompany, rejectCompany } from "./actions";

export const metadata = { title: "Empresas" };

type Tab = UserStatus | "todos";

const TABS: { value: Tab; label: string }[] = [
  { value: "pendente", label: "Pendentes" },
  { value: "aprovado", label: "Aprovadas" },
  { value: "rejeitado", label: "Rejeitadas" },
  { value: "todos", label: "Todas" },
];

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeTab: Tab = TABS.some((t) => t.value === status)
    ? (status as Tab)
    : "pendente";

  const [statusCounts, [receiptStats], memberCounts, companyRows] =
    await Promise.all([
      db.select({ status: companies.status, total: count() }).from(companies).groupBy(companies.status),
      db.select({ totalReceipts: count(), totalValue: sum(receipts.amount) }).from(receipts),
      db
        .select({ companyId: users.companyId, total: count() })
        .from(users)
        .where(eq(users.role, "cliente"))
        .groupBy(users.companyId),
      activeTab === "todos"
        ? db.select().from(companies).orderBy(desc(companies.createdAt))
        : db
            .select()
            .from(companies)
            .where(eq(companies.status, activeTab))
            .orderBy(desc(companies.createdAt)),
    ]);

  const counts: Record<UserStatus, number> = {
    pendente: 0,
    aprovado: 0,
    rejeitado: 0,
  };
  for (const row of statusCounts) counts[row.status] = row.total;
  const totalCompanies = counts.pendente + counts.aprovado + counts.rejeitado;

  const memberCountByCompany = new Map<string, number>();
  for (const row of memberCounts) {
    if (row.companyId) memberCountByCompany.set(row.companyId, row.total);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Empresas"
          value={String(totalCompanies)}
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
            href={`/empresas?status=${tab.value}`}
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

      {companyRows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-16 text-center text-[14px] text-muted-foreground">
          Sem empresas nesta categoria.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {companyRows.map((company) => (
            <li
              key={company.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{company.name}</p>
                  <StatusBadge status={company.status} />
                </div>
                <p className="truncate text-[13px] text-muted-foreground">
                  NIF {company.nif} · {company.contact}
                </p>
                <p className="text-[12px] text-muted">
                  {memberCountByCompany.get(company.id) ?? 0} membro(s) ·
                  registada em {formatDate(company.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {company.status !== "aprovado" && (
                  <form action={approveCompany}>
                    <input type="hidden" name="companyId" value={company.id} />
                    <SubmitButton variant="primary" size="sm">
                      Aprovar
                    </SubmitButton>
                  </form>
                )}
                {company.status !== "rejeitado" && (
                  <form action={rejectCompany}>
                    <input type="hidden" name="companyId" value={company.id} />
                    <SubmitButton variant="secondary" size="sm">
                      Rejeitar
                    </SubmitButton>
                  </form>
                )}
                <Link
                  href={`/empresas/${company.id}`}
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
