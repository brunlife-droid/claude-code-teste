# Setup · variáveis de ambiente e banco

Este documento descreve como conectar o app aos serviços externos. Tudo é **opcional para Fase 0** — o app roda inteiramente com dados mockados sem nenhuma credencial.

## Variáveis necessárias

Crie `.env.local` na raiz (não vai pro Git):

```bash
# ─── Banco de dados (Bloco G) ──────────────────────────────────
# Obtenha em https://console.neon.tech (plano grátis basta para começar)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/nexus?sslmode=require"

# ─── LLM (Bloco H) ─────────────────────────────────────────────
# Anthropic Claude Haiku 4.5 (modelo primário)
ANTHROPIC_API_KEY="sk-ant-..."

# Opcionais (fallback / capability routing)
OPENAI_API_KEY="sk-..."
GOOGLE_GENERATIVE_AI_API_KEY="..."

# ─── Auth (Bloco I) ────────────────────────────────────────────
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"  # produção: https://seu-dominio

# ─── Storage (Bloco J) ─────────────────────────────────────────
# Habilite Vercel Blob em Project Settings → Storage → Create Blob Store
# (em produção, Vercel injeta a variável automaticamente)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

## Habilitando Vercel Blob

1. Vercel Dashboard → seu projeto → **Storage** → **Create Database**
2. Escolha **Blob** → confirme o nome
3. Vercel conecta o store automaticamente em todos os ambientes (production, preview, development) e injeta `BLOB_READ_WRITE_TOKEN`
4. Para dev local, baixe as envs com `vercel env pull .env.local`

Sem `BLOB_READ_WRITE_TOKEN`, uploads viram data URLs inline (imagens) ou placeholders — útil para desenvolvimento sem custo.

Na Vercel, configure essas mesmas variáveis em **Project Settings → Environment Variables**.

## Conectando o Neon (primeira vez)

```bash
# 1. Crie projeto em https://console.neon.tech
# 2. Copie a connection string para DATABASE_URL no .env.local
# 3. Aplique a preparação manual (pgvector + GUC):
psql "$DATABASE_URL" -f drizzle/migrations/0000_prepare_pgvector_and_rls.sql

# 4. Gere e aplique o schema base:
npm run db:push

# 5. Aplique as políticas RLS:
psql "$DATABASE_URL" -f drizzle/migrations/9999_rls_policies.sql
```

A partir daí, mudanças em `src/lib/db/schema.ts` são aplicadas com `npm run db:push`. Para gerar migrations versionadas (recomendado em produção), use `npm run db:generate` e revise o SQL antes.

## Como o app usa as credenciais

| Variável | Quando é necessária |
|---|---|
| `DATABASE_URL` | A partir do Bloco G — quando começamos a salvar conversas, alunos, etc. de verdade |
| `ANTHROPIC_API_KEY` | A partir do Bloco H — sem isso, o chat usa um mock provider que devolve respostas plausíveis |
| `NEXTAUTH_SECRET` | A partir do Bloco I — sem isso, auth está em "modo dev" e qualquer usuário entra como demo |
| `BLOB_READ_WRITE_TOKEN` | A partir do Bloco J — sem isso, uploads de foto viram data URLs inline (funciona, mas não persiste entre sessões) |

Todos os clientes (db, llm, auth) têm fallback: se a variável não existir, lançam erro descritivo somente quando alguém tenta usar. **Build, lint e renderização de páginas funcionam sem nenhuma credencial.**
