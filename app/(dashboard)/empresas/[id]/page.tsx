import Link from "next/link";
import { notFound } from "next/navigation";
import { clsx } from "clsx";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { ChevronLeft, Crown, Receipt as ReceiptIcon } from "lucide-react";
import { db } from "@/lib/db/client";
import { companies, receipts, users } from "@/lib/db/schema";
import { formatCurrencyKz, formatDate, todayISODate } from "@/lib/format";
import { isValidISODate, receiptDateFilter } from "@/lib/receipt-date-filter";
import { SubmitButton } from "@/components/ui/submit-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReceiptGrid } from "@/components/receipts/receipt-grid";
import { DateFilter } from "@/components/receipts/date-filter";
import { approveCompany, rejectCompany } from "../actions";
import { RECEIPTS_PAGE_SIZE } from "@/lib/pagination";

export default async function EmpresaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date: dateParam } = await searchParams;

  const todayISO = todayISODate();
  const date = isValidISODate(dateParam) ? dateParam : todayISO;
  const dayFilter = and(eq(receipts.companyId, id), receiptDateFilter(date));

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);
  if (!company) notFound();

  const [members, receiptStats, firstPage] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        companyRole: users.companyRole,
        isOwner: users.isOwner,
      })
      .from(users)
      .where(eq(users.companyId, id))
      .orderBy(desc(users.isOwner), asc(users.name)),
    db
      .select({
        total: count(),
        vendas: sql<string>`coalesce(sum(case when ${receipts.type} = 'venda' then ${receipts.amount} else 0 end), 0)`,
        compras: sql<string>`coalesce(sum(case when ${receipts.type} = 'compra' then ${receipts.amount} else 0 end), 0)`,
      })
      .from(receipts)
      .where(dayFilter),
    db
      .select({
        id: receipts.id,
        imageUrl: receipts.imageUrl,
        amount: receipts.amount,
        receiptDate: receipts.receiptDate,
        note: receipts.note,
        createdAt: receipts.createdAt,
        type: receipts.type,
        paymentMethod: receipts.paymentMethod,
        uploaderName: users.name,
      })
      .from(receipts)
      .innerJoin(users, eq(users.id, receipts.userId))
      .where(dayFilter)
      .orderBy(desc(receipts.createdAt), desc(receipts.id))
      .limit(RECEIPTS_PAGE_SIZE),
  ]);

  const totalReceipts = receiptStats[0]?.total ?? 0;
  const vendas = parseFloat(receiptStats[0]?.vendas ?? "0");
  const compras = parseFloat(receiptStats[0]?.compras ?? "0");
  const saldo = vendas - compras;

  return (
    <div className="space-y-6">
      <Link
        href="/empresas"
        className="inline-flex items-center gap-1 text-[13.5px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Empresas
      </Link>

      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {company.name}
            </h1>
            <StatusBadge status={company.status} />
          </div>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            NIF {company.nif} · {company.contact}
          </p>
          <p className="mt-0.5 text-[13.5px] text-muted-foreground">
            {company.address}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Registada em {formatDate(company.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {company.status !== "aprovado" && (
            <form action={approveCompany}>
              <input type="hidden" name="companyId" value={company.id} />
              <SubmitButton variant="primary" size="md">
                Aprovar
              </SubmitButton>
            </form>
          )}
          {company.status !== "rejeitado" && (
            <form action={rejectCompany}>
              <input type="hidden" name="companyId" value={company.id} />
              <SubmitButton variant="secondary" size="md">
                Rejeitar
              </SubmitButton>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[12.5px] text-muted-foreground">Membros</p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight">
            {members.length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[12.5px] text-muted-foreground">Recibos (dia)</p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight">
            {totalReceipts}
          </p>
        </div>
        <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
          <p className="text-[12.5px] text-success/80">Vendas</p>
          <p className="mt-1.5 truncate text-xl font-semibold tracking-tight text-success">
            {formatCurrencyKz(vendas)}
          </p>
        </div>
        <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4">
          <p className="text-[12.5px] text-danger/80">Compras</p>
          <p className="mt-1.5 truncate text-xl font-semibold tracking-tight text-danger">
            {formatCurrencyKz(compras)}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-surface p-4 sm:col-span-1">
          <p className="text-[12.5px] text-muted-foreground">Saldo</p>
          <p
            className={clsx(
              "mt-1.5 truncate text-xl font-semibold tracking-tight",
              saldo >= 0 ? "text-success" : "text-danger",
            )}
          >
            {formatCurrencyKz(saldo)}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight">
          Membros
        </h2>
        <ul className="space-y-2.5">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{member.name}</p>
                <p className="truncate text-[13px] text-muted-foreground">
                  {member.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {member.isOwner && (
                  <span className="flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
                    <Crown className="h-3 w-3" />
                    Dono
                  </span>
                )}
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {member.companyRole === "admin" ? "Admin" : "Gestor"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight">
            Recibos enviados
          </h2>
          <DateFilter date={date} todayISO={todayISO} />
        </div>

        {totalReceipts === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border py-16 text-center">
            <ReceiptIcon className="h-6 w-6 text-muted-foreground" />
            <p className="text-[13.5px] text-muted-foreground">
              {date === todayISO
                ? "Ainda não há recibos hoje."
                : "Sem recibos nesta data."}
            </p>
          </div>
        ) : (
          <ReceiptGrid
            key={date}
            companyId={id}
            date={date}
            initialReceipts={firstPage}
            totalCount={totalReceipts}
          />
        )}
      </div>
    </div>
  );
}
