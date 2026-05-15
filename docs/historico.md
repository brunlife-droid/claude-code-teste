# Histórico

> **Adicionar uma entrada nova no TOPO depois de qualquer mudança de código.** Foco no *porquê* e em consequências, não em detalhes triviais que o `git log` já tem.
>
> Formato: `## YYYY-MM-DD — título curto` + bullets.

---

## 2026-05-15 — P3 Correção de redação com GPT-4o-mini

- **Novo prompt** `src/lib/llm/prompts/essay-correction.ts` v1.0 — avalia redação nas 5 competências ENEM (C1-C5), feedback no tom "colega corretor sugerindo devolutiva ao professor", não nota final. Inclui "Sugestão de devolutiva ao aluno" como parágrafo de fechamento.
- **Gateway extendido**: `injectSystemPrompt` agora cobre 3 capabilities (`chat_student`, `plan_generation`, `essay_correction`). A `essay_correction` resolve pra `gpt-4o-mini` via OpenRouter (fallback claude-haiku-4-5 já configurado em `routes.ts`).
- **Novo route handler** `/api/essay-correction` (POST, SSE stream) — exige sessão professor/coordenador/diretor/orientador. Body: `{ studentName, topic, essay }`. Limite de 8000 caracteres no texto.
- **`/professor/correcao` refatorado**: Server Component delega pra `CorrecaoClient`. Form com nome do aluno, tema, textarea grande (min 420px) pra colar a redação e botão de corrigir. Streaming Markdown na direita com cursor blinking. Texto de exemplo já vem preenchido pra demo.
- **Demo coerente**: a UI tem amostra de redação sobre desigualdade social (com "as pessoas" repetido 3x propositalmente pra IA marcar problema de coesão).
- Sem persistência ainda (correções não salvam em DB).
- Build/lint limpos.

**Por quê**: P2 (copiloto) usa Claude. P3 (correção) usa GPT-4o-mini — exercita o roteamento real do gateway por capability e mostra que a abstração funciona. Também é o feature LLM mais "vendável" pra professor: corrigir redação leva ~15min por aluno × 28 alunos = 7h por bimestre. Com IA, vira 3min de revisão por aluno.

**Ainda pendente em /professor**: P4 (gerar prova), P6 (perfil aluno), P7 (diário), P8 (biblioteca), persistência de planos+correções, alertas reais.

---

## 2026-05-15 — P5 Turma real + S1 Secretaria real + P2 Copiloto LLM

Três features em uma sessão (escopo: telas de leitura + primeira feature LLM do professor).

**P5 — `/professor/turma` real:**
- `loadClassHeatmap()` em `teacher/queries.ts` — matriz students × habilities com scores reais de `student_proficiency`.
- `loadClassRoster()` — lista com avg proficiency, nº de conversas e última atividade (max(updatedAt) por aluno).
- Página refatorada pra Server Component: KPIs (alunos, engajados, em risco, proficiência média), heatmap real e roster ordenado por avg score. Empty states pra turma sem dado.

**S1 — `/secretaria` real:**
- Nova camada `src/lib/secretaria/queries.ts` — espelha o padrão do teacher.
- `loadNetworkKpis()` agrega rede inteira por tenant: total alunos, engajados últimos 7d, professores (via memberships), escolas, turmas, em risco e proficiência média.
- `loadSchoolsHealth()` exportada mas ainda não renderizada (IDEB/indicadores Nexus em baixo seguem mock — gov data que não temos no DB).
- Página agora exige `requireRole("secretaria")` e KPIs do topo são reais.

**P2 — `/professor/copiloto` com LLM:**
- Novo prompt `src/lib/llm/prompts/lesson-plan.ts` v1.0 — estrutura abertura/investigação/sistematização/avaliação + adaptações, BNCC obrigatória, realista pra rede municipal sem Smart TV.
- `gateway.ts` extendido pra injetar system prompt da capability `plan_generation` (Claude Haiku 4.5 via OpenRouter, fallback mock).
- Novo route handler `/api/lesson-plan` (POST, SSE stream) — exige sessão professor/coordenador/diretor/orientador.
- `copiloto/page.tsx` virou Server Component que delega pra `CopilotoClient` — formulário (disciplina/série/tema/duração) + área de streaming com cursor blinking. Sem persistência ainda (planos não salvam no DB nessa iteração).
- Build/lint limpos.

**Por quê**: P5 era a tela diária do professor (perfeito pra demonstrar valor numa visita à secretaria), S1 era a vitrine pro prefeito ver a rede, P2 era o primeiro contato real com IA na área do professor. Juntas formam uma demo coerente.

**Ainda mockados/pendentes:**
- /professor: alertas (`ALERTAS_PROF`), próximas aulas, P3 (correção), P4 (provas), P6 (perfil aluno), P7 (diário), P8 (biblioteca)
- /secretaria: IDEB gráfico, Indicadores Nexus, tabela "Escolas em risco" (precisaria de IEB no DB)
- Planos de aula gerados não persistem ainda
- Telas Admin N2-N9: intocadas

---

## 2026-05-15 — Dashboard P1 do Professor com dado real + seed da rede

- **Seed expandido** `src/lib/db/seed-network.ts`: cria users de Ricardo/Cláudia/Bruno, `memberships` por papel (Ricardo escopado em `class-demo-7a`), 12 alunos do 7º A (João identificado e linkado ao user `u-joao`), 9 habilidades BNCC, e `student_proficiency` por aluno×habilidade com score jitter realista.
- **Camada `src/lib/teacher/queries.ts`** com helpers graceful:
  - `loadTeacherContext(userId, tenantId)` — turmas que o professor leciona via `memberships`.
  - `loadDashboardKpis()` — total de alunos, engajados nos últimos 7 dias (via `conversations.updatedAt`), em risco (avg de proficiência < 0.45).
  - `loadTopStudents()` — top 3 por proficiência média.
- **P1 (`/professor`) refatorado** pra Server Component com dados reais do DB. KPIs, destaque da turma e nome do professor vêm da sessão+DB; alertas continuam mockados (próxima sessão).
- **`scoreToProficiency()`** helper que mapeia score numérico (0..1) pra enum `proficiency` do schema, mantendo o `ProfBadge` UI.
- Build/lint limpos.

**Por quê**: P1 era o "olá Ricardo" mockado — perfeito pra demo mas inútil pra valida operação real. Agora se eu logo como Cláudia/Bruno cai em rota errada; logo como Ricardo vejo turma de verdade. Destrava P5 (turma), P6 (perfil aluno) e copiloto LLM nas próximas sessões.

**Ainda mockados em /professor**: alertas (`ALERTAS_PROF`), próximas aulas, ferramentas LLM (P2/P3/P4) e telas /alunos /turma /diario /biblioteca.

---

## 2026-05-15 — Tenants vêm do DB (com fallback in-code)

- **`getCurrentTenant()` agora carrega do Postgres** via `loadTenantFromDb(id)`, cacheado por request com React `cache()`.
- **Seed idempotente** `ensureTenantsSeeded()` em `src/lib/tenants/db.ts` insere as 3 prefeituras (`alfenas`, `pousoalegre`, `varginha`) no primeiro carregamento de qualquer request — `onConflictDoNothing`, executa só uma vez por instância.
- **Fallback gracioso**: sem `DATABASE_URL` ou row inexistente, devolve a config in-code (`TENANTS` em `config.ts`) com o mesmo shape. Nada quebra em dev sem DB.
- **Campos derivados** (`population`, `students`, `teachers`, `schools`) continuam vindo do in-code overlay até termos COUNT real — DB hoje não armazena agregados.
- `resolveTenantId()` extraído pra função privada — separação clara entre "qual tenant é?" (headers/cookies) e "carrega o tenant" (DB+fallback).
- Build/lint limpos.

**Por quê**: era pré-requisito pro Wizard de Onboarding (N3) — adicionar prefeitura agora vai ser um INSERT, não um deploy de código. Também alinha o app à arquitetura final (DB como source of truth) sem virar refator de big-bang.

**Ainda pendente** (próximas iterações):
- RLS enforcement real (políticas existem no SQL mas conexão atual bypassa).
- Contagens reais de students/teachers/schools via COUNT em vez de in-code.

---

## 2026-05-15 — Auth real por papel: layouts protegidos, ownership real, redirect por role

- **Layouts protegidos**: `/aluno`, `/professor`, `/secretaria`, `/admin` agora usam `requireRole(...)` no Server Component — não logado vira redirect pra `/entrar?callbackUrl=<rota>`, papel errado vira redirect pra própria home do papel.
- **`/api/chat` exige sessão**: retorna 401 se não logado, 403 se não-aluno. `studentId` agora vem de `resolveStudentId(userId, tenantId)` em vez de `ensureDemoStudent()` hardcoded.
- **Ownership real** das conversations: validação por `studentId` derivado da sessão. Antes era teatro — qualquer um abrindo `/aluno/chat` era tratado como u-joao.
- **Login redireciona por papel**: form chama `getSession()` pós-signIn, lê `role`, vai pra `getLayerHomePath(role)`. Demo aluno → `/aluno/chat`, professor → `/professor`, etc.
- **`x-pathname` header** adicionado no middleware pra `requireAuth` montar `callbackUrl` correto sem ler `request.url`.
- **`src/lib/auth/session-paths.ts`** separado de `session.ts` pra ser client-safe (form usa esse import; o server-only `session.ts` importa `headers` e `redirect`).
- **`src/lib/db/student-resolver.ts`**: helper único pra resolver `studentId` da sessão — para `u-joao` chama `ensureDemoStudent` (compat retro), para outros faz lookup em `students` por `userId+tenantId`. Sem `DATABASE_URL` ou sem match: retorna `null` (chat continua streamando efêmero).
- Build/lint limpos.

**Por quê**: a ownership do chat era teatro e qualquer um logado ou não era tratado como `u-joao`. Sem login real não dá pra validar permissões, testar 2º aluno, nem montar Professor/Secretaria de verdade. Esta camada destrava as próximas (multi-tenant real, onboarding).

**Lembrete pra produção**: `NEXTAUTH_SECRET` precisa ser configurado na Vercel (hoje cai no `"dev-only-secret-replace-me"`). Sem isso, tokens JWT são adivinháveis.

---

## 2026-05-15 — Loop do Aluno fechado: chat persiste e histórico vem do DB

- **API `/api/chat`** agora cria `conversation`, persiste mensagem do user antes do streaming, persiste mensagem do assistente (com model/tokens/latência) ao terminar e bumpa `updatedAt`. Aceita `conversationId` opcional para continuar conversa existente; valida ownership por `studentId`.
- **Novo SSE chunk** `{ type: "meta", conversationId }` enviado no início do stream — cliente atualiza URL via `history.replaceState` pra `?id=...` (refresh preserva conversa).
- **`/aluno/historico`** lê do Postgres via `listConversations()`, agrupa por bucket de data (Hoje/Ontem/Esta semana/Este mês/Anteriores), com empty state quando vazio. Removido mock `GROUPS` hardcoded.
- **`/aluno/chat?id=<uuid>`** carrega mensagens persistidas via `loadMessages()` + valida ownership.
- **Camada nova `src/lib/chat/persistence.ts`** com helpers graceful (sem `DATABASE_URL` retornam null/[] sem quebrar UX de demo).
- **Seed idempotente `src/lib/db/seed-demo.ts`** garante que o demo aluno (`u-joao`) tem rows em `users`, `schools`, `classes`, `students` antes do primeiro insert em `conversations` (FK obrigatória).
- Build/lint limpos.

**Por quê**: era a próxima feature de maior alavanca — A2 streaming já funcionava mas era efêmero, A3 era totalmente mockado. Agora o loop core do produto (chat → histórico → reabrir conversa) roda de ponta a ponta.

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
