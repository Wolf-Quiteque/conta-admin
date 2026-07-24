# NAWA Contas — Admin

Painel de administração para aprovar empresas e consultar todos os recibos
enviados pelos seus membros (com valor e data).

## Stack

- Next.js 16 (App Router, Server Actions, Proxy)
- Neon Postgres + Drizzle ORM
- Tailwind CSS v4
- Sessões com cookie assinado (JWT via `jose`)

## Configuração

1. Copie `.env.example` para `.env.local` e preencha:
   - `DATABASE_URL_UNPOOLED` — connection string do Neon (Vercel → Storage → Neon).
   - `BLOB_READ_WRITE_TOKEN` — só é usado como *fallback* local. O código nunca
     lê esta variável diretamente (`upload()`/`handleUpload()` são chamados
     sem `token`), por isso em produção, se a loja Blob estiver ligada via
     `BLOB_STORE_ID` + `BLOB_WEBHOOK_PUBLIC_KEY` (Vercel → Storage → Blob),
     não precisa de configurar nada aqui — o `VERCEL_OIDC_TOKEN` é injetado
     automaticamente pela Vercel em runtime e a biblioteca `@vercel/blob`
     usa-o sozinha.
   - `SESSION_SECRET` — gerar com `openssl rand -base64 32`.

   **Importante:** `DATABASE_URL_UNPOOLED` deve ser o mesmo usado no projeto
   `conta-clientes`, porque ambas as apps partilham a mesma base de dados.
   Em produção, a Vercel pode expor esta variável com um prefixo específico
   do projeto (ex.: `nawabus_cliene_conta_DATABASE_URL_UNPOOLED`) — o código
   já trata isso (`lib/db/connection-string.ts`), não precisa de igualar os
   nomes manualmente.

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

1. Uma empresa regista-se em `conta-clientes` (o primeiro utilizador fica
   como dono/admin dessa empresa) e fica **pendente**.
2. Em `/empresas`, aprove ou rejeite cada empresa.
3. Clique em "Ver" para consultar a empresa: membros (com a sua função —
   Admin ou Gestor) e todos os recibos enviados por qualquer membro (imagem,
   valor, data e nota), com o total acumulado.

Depois de aprovada, membros com função **Admin** podem adicionar mais
membros à empresa a partir de `conta-clientes` (`/equipa`); membros
**Gestor** só podem enviar recibos.

## Deploy

Faça deploy como um projeto Vercel normal, ligado ao mesmo recurso Neon e à
mesma loja Blob usados pelo `conta-clientes`, com `SESSION_SECRET` definido
(cada app pode ter o seu próprio valor). `DATABASE_URL_UNPOOLED` e as
variáveis do Blob costumam já vir configuradas automaticamente pelas
integrações Vercel-Neon e Vercel-Blob.
