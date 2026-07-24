import { eq } from "drizzle-orm";
import { db } from "../lib/db/client";
import { users } from "../lib/db/schema";
import { hashPassword } from "../lib/auth/password";

async function main() {
  const [name, email, password] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error(
      'Utilização: npm run seed:admin -- "Nome" email@exemplo.com palavra-passe',
    );
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ name, passwordHash, role: "admin" })
      .where(eq(users.id, existing.id));
    console.log(`Administrador atualizado: ${email}`);
  } else {
    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: "admin",
    });
    console.log(`Administrador criado: ${email}`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
