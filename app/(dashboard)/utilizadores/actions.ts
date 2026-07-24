"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifySession } from "@/lib/auth/dal";

export async function approveUser(formData: FormData) {
  await verifySession();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  await db.update(users).set({ status: "aprovado" }).where(eq(users.id, userId));
  revalidatePath("/utilizadores");
  revalidatePath(`/utilizadores/${userId}`);
}

export async function rejectUser(formData: FormData) {
  await verifySession();
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  await db.update(users).set({ status: "rejeitado" }).where(eq(users.id, userId));
  revalidatePath("/utilizadores");
  revalidatePath(`/utilizadores/${userId}`);
}
