"use server";

import { revalidatePath } from "next/cache";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companies, receipts, users } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth/dal";
import { RECEIPTS_PAGE_SIZE } from "@/lib/pagination";

export async function loadMoreCompanyReceipts(
  companyId: string,
  offset: number,
) {
  await verifySession();

  return db
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
    .where(eq(receipts.companyId, companyId))
    .orderBy(desc(receipts.createdAt), desc(receipts.id))
    .limit(RECEIPTS_PAGE_SIZE)
    .offset(Math.max(0, offset));
}

export async function approveCompany(formData: FormData) {
  await verifySession();
  const companyId = String(formData.get("companyId") ?? "");
  if (!companyId) return;

  await db
    .update(companies)
    .set({ status: "aprovado" })
    .where(eq(companies.id, companyId));
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${companyId}`);
}

export async function rejectCompany(formData: FormData) {
  await verifySession();
  const companyId = String(formData.get("companyId") ?? "");
  if (!companyId) return;

  await db
    .update(companies)
    .set({ status: "rejeitado" })
    .where(eq(companies.id, companyId));
  revalidatePath("/empresas");
  revalidatePath(`/empresas/${companyId}`);
}
