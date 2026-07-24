import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ChevronLeft, Receipt as ReceiptIcon } from "lucide-react";
import { db } from "@/lib/db/client";
import { receipts, users } from "@/lib/db/schema";
import { formatCurrencyKz, formatDate, formatDateTime } from "@/lib/format";
import { buttonClasses } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { approveUser, rejectUser } from "../actions";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user || user.role !== "cliente") notFound();

  const userReceipts = await db
    .select()
    .from(receipts)
    .where(eq(receipts.userId, id))
    .orderBy(desc(receipts.createdAt));

  const total = userReceipts.reduce(
    (sum, r) => sum + (r.amount ? parseFloat(r.amount) : 0),
    0,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/utilizadores"
        className="inline-flex items-center gap-1 text-[13.5px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Utilizadores
      </Link>

      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {user.name}
            </h1>
            <StatusBadge status={user.status} />
          </div>
          <p className="mt-1 text-[13.5px] text-muted-foreground">{user.email}</p>
          <p className="mt-0.5 text-[12.5px] text-muted">
            Registado em {formatDate(user.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {user.status !== "aprovado" && (
            <form action={approveUser}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className={buttonClasses({ variant: "primary", size: "md" })}
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
                className={buttonClasses({ variant: "secondary", size: "md" })}
              >
                Rejeitar
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[12.5px] text-muted-foreground">Recibos</p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight">
            {userReceipts.length}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-surface p-4 sm:col-span-2">
          <p className="text-[12.5px] text-muted-foreground">Valor total</p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight">
            {formatCurrencyKz(total)}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight">
          Recibos enviados
        </h2>

        {userReceipts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border py-16 text-center">
            <ReceiptIcon className="h-6 w-6 text-muted-foreground" />
            <p className="text-[13.5px] text-muted-foreground">
              Este utilizador ainda não enviou recibos.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {userReceipts.map((receipt) => (
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
                    <span className="text-[15px] font-medium">
                      {formatCurrencyKz(receipt.amount)}
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {formatDate(receipt.receiptDate ?? receipt.createdAt)}
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
