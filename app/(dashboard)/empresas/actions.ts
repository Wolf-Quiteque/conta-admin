"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { companies } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth/dal";

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
