# Arquitetura

> **Atualizar sempre que uma decisão arquitetural mudar** — nova abstração, nova camada, novo provider, refator estrutural. Não duplicar o ROADMAP; aqui é o **estado real do código**, não o plano.
>
> Última atualização: 2026-05-15

---

## Stack em uso

| Camada | Tecnologia | Onde mora |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) | raiz |
| UI | React 19 + Tailwind v4 + CSS vars semânticas | `src/app/`, `src/components/` |
| DB | Postgres (Neon serverless) + pgvector | `drizzle/migrations/` |
| ORM | Drizzle | `src/lib/db/` |
| Auth | NextAuth v5 (credenciais demo por enquanto) | `src/lib/auth/` |
| LLM gateway | Vercel AI SDK + OpenRouter | `src/lib/llm/` |
| Storage | Vercel Blob via abstração | `src/lib/storage/` |
| Hosting | Vercel (região `gru1` — São Paulo) | `vercel.json` |

## Estrutura de pastas

```
src/
  app/                # rotas (App Router)
    aluno/            # área Aluno (A1-A6)
    professor/        # área Professor (P1-P8)
    secretaria/       # área Secretaria (S1-S9)
    admin/            # área Admin Nexus (N2-N9)
    login/
    api/              # API routes
  components/         # UI compartilhada
  lib/
    db/               # Drizzle schema + cliente + seed-demo
    chat/             # persistência de conversations/messages
    llm/              # gateway + providers + capabilities + prompts
    auth/             # NextAuth config
    storage/          # abstração Vercel Blob
    tenants/          # middleware helpers + config
  middleware.ts       # ⚠️ em Next 16 será migrado para `proxy.ts`
drizzle/migrations/   # SQL versionado
docs/                 # ROADMAP, contexto, arquitetura, histórico
```

## Decisões arquiteturais ativas

### Multi-tenancy
- **Single Postgres + `tenant_id` em todas as tabelas + Postgres RLS** como segunda barreira (políticas estão no SQL mas conexão atual bypassa — pendente).
- **Não** schema-per-tenant.
- Resolução de tenant por subdomínio em prod (`alfenas.nexus.edu`), por path/header em dev.
- `getCurrentTenant()` (em `src/lib/tenants/server.ts`) carrega a row do Postgres via `loadTenantFromDb()` (cacheado por request com `cache()` do React). `ensureTenantsSeeded()` faz o INSERT idempotente das 3 prefeituras no primeiro hit por instância.
- Sem `DATABASE_URL` ou row inexistente: cai pra `TENANTS` in-code (mesmo shape `Tenant`) — dev sem DB continua funcionando.
- Campos derivados (`population`, `students`, `teachers`, `schools`) ainda vêm do overlay in-code até COUNT real existir.

### LLM gateway
- Tudo passa por `src/lib/llm/gateway.ts`. Componentes nunca chamam OpenRouter direto.
- Roteamento por **capability** (chat-student, plan-generation, essay-correction, embeddings), não por modelo direto. Permite trocar provider sem deploy.
- Observability (tokens, latência, custo por tenant) passa pelo gateway.

### White-label
- CSS vars semânticas injetadas via `<style>` no layout raiz, lidas da tabela `tenants`.
- Sem rebuild por tenant.

### Auditoria
- `audit_log` e `consent_log` são tabelas obrigatórias. Toda ação sensível vira log (acesso a dado de aluno, envio de mensagem, alerta SRE).

### Persistência de chat (Aluno)
- `src/lib/chat/persistence.ts` é a única porta de entrada pra `conversations`/`messages`. Componentes nunca tocam Drizzle direto.
- Todas as funções são **graceful**: sem `DATABASE_URL` retornam `null`/`[]` sem propagar erro — o chat continua streamando em modo efêmero.
- IDs gerados com `crypto.randomUUID()` no app (nunca no DB). Convenção do schema (`text PK`).
- A API `/api/chat` envia chunk SSE `{ type: "meta", conversationId }` no início do stream pra o cliente atualizar URL via `history.replaceState` — refresh preserva a conversa.
- Ownership de conversation validado por `studentId` derivado da sessão antes de retomar (`?id=`) ou continuar via API (proteção contra IDOR).

### Auth + autorização
- NextAuth v5 (Credentials provider com whitelist demo enquanto `DATABASE_URL` não tem users seedados).
- **Server**: `src/lib/auth/session.ts` exporta `requireAuth()` e `requireRole(...)` — Server Components/layouts chamam isso no topo. Não logado vira redirect pra `/entrar?callbackUrl=<x-pathname>`; papel errado vira redirect pra própria home do papel (`getLayerHomePath`).
- **Client**: `src/lib/auth/session-paths.ts` é client-safe (sem `next/headers`, sem `redirect`) — login form importa daqui pra computar destino pós-signIn.
- **API routes**: chamam `auth()` direto + retornam 401/403 conforme caso. Ex: `/api/chat`.
- **Mapa de papéis → home**: `aluno/responsavel → /aluno/chat`, `professor/coordenador/diretor/orientador → /professor`, `secretaria → /secretaria`, `admin_nexus → /admin`.
- **Resolução de `studentId`** centralizada em `src/lib/db/student-resolver.ts` — para o demo `u-joao`, dispara seed idempotente; pros demais, lookup em `students` por `(userId, tenantId)`. Retorna `null` se nada bater — chamador trata como efêmero.

### Headers do middleware
`src/middleware.ts` injeta dois headers em toda request: `x-tenant-id` (tenant resolvido) e `x-pathname` (path original) — Server Components leem via `headers()`.

## Convenções de código

- TS strict. Variáveis e identificadores em inglês; strings de UI em pt-BR.
- Server Actions preferidas sobre API routes para mutações dentro do app.
- Nunca query sem `tenantId` explícito ou via helper que injeta.
- Commits em pt-BR, imperativo, descritivo (ver `git log` recente).

## Pontos de atenção / dívida técnica

- `src/middleware.ts` precisa virar `proxy.ts` (deprecação Next 16).
- RLS escrita no SQL mas sem testes que validem isolamento.
- Mock data ainda em várias telas — migrar pra DB conforme features fecham.
