"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation";

export type AuthFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (
    !user ||
    user.role !== "admin" ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    return { message: "Credenciais inválidas ou acesso não autorizado." };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect("/utilizadores");
}

export async function logout() {
  await deleteSession();
  redirect("/entrar");
}
