/**
 * The Vercel-Neon integration injects connection vars under a
 * project-specific prefix (e.g. `nawabus_cliene_conta_DATABASE_URL_UNPOOLED`).
 * Locally, `.env.local` may still use the plain Neon names. Try the prefixed
 * name first, then fall back, so the same code works in both places.
 */
export function resolveDatabaseUrl() {
  const url =
    process.env.nawabus_cliene_conta_DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "Nenhuma variável de ligação à base de dados foi encontrada (procurou-se " +
        "nawabus_cliene_conta_DATABASE_URL_UNPOOLED, DATABASE_URL_UNPOOLED e DATABASE_URL).",
    );
  }

  return url;
}
