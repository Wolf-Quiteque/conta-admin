import { eq } from "drizzle-orm";
import { db } from "../lib/db/client";
import { companies, users } from "../lib/db/schema";
import { hashPassword } from "../lib/auth/password";

const TEST_PASSWORD = "Teste@1234";

async function upsertAdmin() {
  const passwordHash = await hashPassword(TEST_PASSWORD);
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@teste.com"))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ name: "Admin Teste", passwordHash, role: "admin" })
      .where(eq(users.id, existing.id));
    console.log("Atualizado: admin@teste.com (admin da plataforma)");
  } else {
    await db.insert(users).values({
      name: "Admin Teste",
      email: "admin@teste.com",
      passwordHash,
      role: "admin",
    });
    console.log("Criado: admin@teste.com (admin da plataforma)");
  }
}

async function upsertNawabus() {
  const [existingCompany] = await db
    .select()
    .from(companies)
    .where(eq(companies.nif, "5000451738"))
    .limit(1);

  const companyId = existingCompany
    ? existingCompany.id
    : (
        await db
          .insert(companies)
          .values({
            name: "Nawabus",
            nif: "5000451738",
            address: "Benfica, Travessa 26",
            contact: "922692380",
            status: "aprovado",
          })
          .returning({ id: companies.id })
      )[0].id;

  if (existingCompany) {
    await db
      .update(companies)
      .set({
        name: "Nawabus",
        address: "Benfica, Travessa 26",
        contact: "922692380",
        status: "aprovado",
      })
      .where(eq(companies.id, companyId));
    console.log("Atualizada: Nawabus (empresa)");
  } else {
    console.log("Criada: Nawabus (empresa, aprovada)");
  }

  const passwordHash = await hashPassword(TEST_PASSWORD);
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, "cliente@teste.com"))
    .limit(1);

  if (existingUser) {
    await db
      .update(users)
      .set({
        name: "Cliente Teste",
        passwordHash,
        role: "cliente",
        companyId,
        companyRole: "admin",
        isOwner: true,
      })
      .where(eq(users.id, existingUser.id));
    console.log("Atualizado: cliente@teste.com (dono/admin da Nawabus)");
  } else {
    await db.insert(users).values({
      name: "Cliente Teste",
      email: "cliente@teste.com",
      passwordHash,
      role: "cliente",
      companyId,
      companyRole: "admin",
      isOwner: true,
    });
    console.log("Criado: cliente@teste.com (dono/admin da Nawabus)");
  }
}

async function main() {
  await upsertAdmin();
  await upsertNawabus();

  console.log(`\nPalavra-passe para ambos: ${TEST_PASSWORD}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
