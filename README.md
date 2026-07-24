# NAWA Contas — Admin

Painel de administração para aprovar contas de clientes e consultar todos os
recibos que enviaram (com valor e data).

## Stack

- Next.js 16 (App Router, Server Actions, Proxy)
- Neon Postgres + Drizzle ORM
- Tailwind CSS v4
- Sessões com cookie assinado (JWT via `jose`)

## Configuração

1. Copie `.env.example` para `.env.local` e preencha:
   - `DATABASE_URL_UNPOOLED` — connection string do Neon (Vercel → Storage → Neon).
   - `BLOB_READ_WRITE_TOKEN` — token do Vercel Blob (Vercel → Storage → Blob).
   - `SESSION_SECRET` — gerar com `openssl rand -base64 32`.

   **Importante:** `DATABASE_URL_UNPOOLED` e `BLOB_READ_WRITE_TOKEN` devem ser os
   mesmos usados no projeto `conta-clientes`, porque ambas as apps partilham
   a mesma base de dados e o mesmo espaço de armazenamento.

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie as tabelas na base de dados (basta correr uma vez, a partir de
   qualquer um dos dois projetos):

   ```bash
   npm run db:push
   ```

4. Crie o primeiro administrador:

   ```bash
   npm run seed:admin -- "O Seu Nome" admin@exemplo.com uma-palavra-passe-forte
   ```

   Este comando cria (ou promove, se o email já existir) um utilizador com
   `role = admin` e `status = aprovado`. Volte a correr o comando sempre que
   precisar de criar mais administradores ou repor a palavra-passe de um.

5. Arranque em desenvolvimento:

   ```bash
   npm run dev
   ```

## Fluxo

1. Novos clientes registam-se em `conta-clientes` e ficam **pendentes**.
2. Em `/utilizadores`, aprove ou rejeite cada conta.
3. Clique em "Ver" para consultar todos os recibos de um cliente (imagem,
   valor, data e nota), com o total acumulado.

## Deploy

Faça deploy como um projeto Vercel normal, com as três variáveis de ambiente
acima configuradas em Production/Preview, ligadas ao mesmo recurso Neon e ao
mesmo Blob Store usados pelo `conta-clientes`.
