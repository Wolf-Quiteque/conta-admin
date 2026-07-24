import { eq } from "drizzle-orm";
import { db } from "../lib/db/client";
import { users } from "../lib/db/schema";
import { hashPassword } from "../lib/auth/password";

const TEST_PASSWORD = "Teste@1234";

async function upsertUser(input: {
  name: string;
  email: string;
  role: "admin" | "cliente";
  status: "pendente" | "aprovado" | "rejeitado";
}) {
  const passwordHash = await hashPassword(TEST_PASSWORD);
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({
        name: input.name,
        passwordHash,
        role: input.role,
        status: input.status,
      })
      .where(eq(users.id, existing.id));
    console.log(`Atualizado: ${input.email} (${input.role}, ${input.status})`);
  } else {
    await db.insert(users).values({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      status: input.status,
    });
    console.log(`Criado: ${input.email} (${input.role}, ${input.status})`);
  }
}

async function main() {
  await upsertUser({
    name: "Admin Teste",
    email: "admin@teste.com",
    role: "admin",
    status: "aprovado",
  });

  await upsertUser({
    name: "Cliente Teste",
    email: "cliente@teste.com",
    role: "cliente",
    status: "aprovado",
  });

  console.log(`\nPalavra-passe para ambos: ${TEST_PASSWORD}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
