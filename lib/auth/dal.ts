import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { decrypt, getSessionCookie } from "./session";

export const verifySession = cache(async () => {
  const cookie = await getSessionCookie();
  const session = await decrypt(cookie);

  if (!session?.userId || session.role !== "admin") {
    redirect("/entrar");
  }

  return session;
});

export const getOptionalSession = cache(async () => {
  const cookie = await getSessionCookie();
  return decrypt(cookie);
});

export const getCurrentAdmin = cache(async () => {
  const session = await verifySession();

  const [admin] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!admin || admin.role !== "admin") {
    redirect("/entrar");
  }

  return admin;
});
