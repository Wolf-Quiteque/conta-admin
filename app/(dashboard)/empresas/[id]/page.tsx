import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clsx } from "clsx";
import { asc, desc, eq } from "drizzle-orm";
import {
  ChevronLeft,
  Crown,
  Receipt as ReceiptIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db/client";
import { companies, receipts, users } from "@/lib/db/schema";
import { formatCurrencyKz, formatDate, formatDateTime } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { approveCompany, rejectCompany } from "../actions";

export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, id))
    .limit(1);
  if (!company) notFound();

  const [members, companyReceipts] = await Promise.all([
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
      .where(eq(receipts.companyId, id))
      .orderBy(desc(receipts.createdAt)),
  ]);

  const totals = companyReceipts.reduce(
    (acc, r) => {
      const value = r.amount ? parseFloat(r.amount) : 0;
      if (r.type === "venda") acc.vendas += value;
      else acc.compras += value;
      return acc;
    },
    { vendas: 0, compras: 0 },
  );
  const saldo = totals.vendas - totals.compras;

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
              <button
                type="submit"
                className={buttonClasses({ variant: "primary", size: "md" })}
              >
                Aprovar
              </button>
            </form>
          )}
          {company.status !== "rejeitado" && (
            <form action={rejectCompany}>
              <input type="hidden" name="companyId" value={company.id} />
              <button
                type="submit"
                className={buttonClasses({ variant: "secondary", size: "md" })}
              >
                Rejeitar
              </button>
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
          <p className="text-[12.5px] text-muted-foreground">Recibos</p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight">
            {companyReceipts.length}
          </p>
        </div>
        <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
          <p className="text-[12.5px] text-success/80">Vendas</p>
          <p className="mt-1.5 truncate text-xl font-semibold tracking-tight text-success">
            {formatCurrencyKz(totals.vendas)}
          </p>
        </div>
        <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4">
          <p className="text-[12.5px] text-danger/80">Compras</p>
          <p className="mt-1.5 truncate text-xl font-semibold tracking-tight text-danger">
            {formatCurrencyKz(totals.compras)}
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
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight">
          Recibos enviados
        </h2>

        {companyReceipts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border py-16 text-center">
            <ReceiptIcon className="h-6 w-6 text-muted-foreground" />
            <p className="text-[13.5px] text-muted-foreground">
              Esta empresa ainda não enviou recibos.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {companyReceipts.map((receipt) => (
              <li key={receipt.id}>
                <a
                  href={receipt.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-primary/30"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    <Image
                      src={receipt.imageUrl}
                      alt="Recibo"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={clsx(
                          "flex items-center gap-1 truncate text-[15px] font-semibold",
                          receipt.type === "venda"
                            ? "text-success"
                            : "text-danger",
                        )}
                      >
                        {receipt.type === "venda" ? (
                          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                        )}
                        {formatCurrencyKz(receipt.amount)}
                      </span>
                      <span className="shrink-0 truncate rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted-foreground">
                        {receipt.uploaderName}
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      {formatDate(receipt.receiptDate ?? receipt.createdAt)}
                      <span className="text-muted">·</span>
                      {receipt.paymentMethod === "dinheiro"
                        ? "Dinheiro"
                        : "Banco"}
                    </span>
                    {receipt.note && (
                      <span className="truncate text-[12.5px] text-muted">
                        {receipt.note}
                      </span>
                    )}
                    <span className="text-[11.5px] text-muted">
                      Enviado em {formatDateTime(receipt.createdAt)}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
