# Histórico

> **Adicionar uma entrada nova no TOPO depois de qualquer mudança de código.** Foco no *porquê* e em consequências, não em detalhes triviais que o `git log` já tem.
>
> Formato: `## YYYY-MM-DD — título curto` + bullets.

---

## 2026-05-15 — Setup de docs vivos (contexto, arquitetura, histórico)

- Criados `docs/contexto.md`, `docs/arquitetura.md`, `docs/historico.md`.
- `CLAUDE.md` agora exige leitura desses 3 arquivos antes de programar e atualização depois.
- Objetivo: evitar que sessões novas de agente quebrem trabalho já feito por falta de contexto sobre o estado real do código.

---

## Histórico anterior (consolidado do git log)

Antes deste arquivo existir. Reconstrução resumida — para detalhe ver `git log`.

- **2026-05-14** — Migrations aplicadas no Neon (pgvector, schema, índices).
- **chore** — Vercel forçada na região `gru1` (São Paulo).
- **refactor** — LLM gateway migrado pra OpenRouter (substitui chamada Anthropic direta).
- **feat** — Storage abstrato + Vercel Blob + upload de foto no chat.
- **feat** — NextAuth v5 com credenciais demo + página de login.
- **feat** — LLM gateway com mock provider + chat streaming real.
- **feat** — Drizzle schema multi-tenant + Neon serverless.
- **refactor** — Área Aluno como webapp tipo Claude (sem phone frames).
- **feat** — Telas Admin N2-N9 completas.
- **feat** — Telas Secretaria S1-S9 com dashboards estratégicos.
- **feat** — Telas Professor P1-P8 com dados mockados.
- **feat** — Telas Aluno A1-A6 (onboarding, chat, histórico, trilha, mural, a11y).
- **feat** — Mock data layer com tipos do domínio.
- **feat** — Multi-tenant foundation com white-label dinâmico.
- **feat** — Layout shell (sidebar + topbar) e rota `/admin` de demo.
- **feat** — Design system inicial + rota `/internal` de visualização.
- **feat** — Migra design tokens e fontes do protótipo.
- **docs** — Renomeado para Nexus Education e adiciona roadmap completo.
- **chore** — Scaffold Nexus Governamental com Next.js 16.
