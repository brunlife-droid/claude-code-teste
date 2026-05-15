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
    db/               # Drizzle schema + cliente
    llm/              # gateway + providers + capabilities + prompts
    auth/             # NextAuth config
    storage/          # abstração Vercel Blob
    tenant/           # middleware + helpers de tenant
  middleware.ts       # ⚠️ em Next 16 será migrado para `proxy.ts`
drizzle/migrations/   # SQL versionado
docs/                 # ROADMAP, contexto, arquitetura, histórico
```

## Decisões arquiteturais ativas

### Multi-tenancy
- **Single Postgres + `tenant_id` em todas as tabelas + Postgres RLS** como segunda barreira.
- **Não** schema-per-tenant.
- Resolução de tenant por subdomínio em prod (`alfenas.nexus.edu`), por path/header em dev.

### LLM gateway
- Tudo passa por `src/lib/llm/gateway.ts`. Componentes nunca chamam OpenRouter direto.
- Roteamento por **capability** (chat-student, plan-generation, essay-correction, embeddings), não por modelo direto. Permite trocar provider sem deploy.
- Observability (tokens, latência, custo por tenant) passa pelo gateway.

### White-label
- CSS vars semânticas injetadas via `<style>` no layout raiz, lidas da tabela `tenants`.
- Sem rebuild por tenant.

### Auditoria
- `audit_log` e `consent_log` são tabelas obrigatórias. Toda ação sensível vira log (acesso a dado de aluno, envio de mensagem, alerta SRE).

## Convenções de código

- TS strict. Variáveis e identificadores em inglês; strings de UI em pt-BR.
- Server Actions preferidas sobre API routes para mutações dentro do app.
- Nunca query sem `tenantId` explícito ou via helper que injeta.
- Commits em pt-BR, imperativo, descritivo (ver `git log` recente).

## Pontos de atenção / dívida técnica

- `src/middleware.ts` precisa virar `proxy.ts` (deprecação Next 16).
- RLS escrita no SQL mas sem testes que validem isolamento.
- Mock data ainda em várias telas — migrar pra DB conforme features fecham.
