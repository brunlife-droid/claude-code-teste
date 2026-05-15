@AGENTS.md

# Nexus Education — contexto do produto

Plataforma SaaS multi-tenant white-label de IA pedagógica para redes municipais de educação no Brasil.

**4 camadas de usuário**: Aluno (mobile/WhatsApp), Professor (web), Secretaria (web), Admin Nexus (interno).

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4. Backend via Server Actions e API Routes do Next. Postgres (Neon) + Drizzle + pgvector. AI SDK (Vercel) com **OpenRouter** como gateway unificado (Claude Haiku 4.5 primário; GPT, Gemini, Llama via mesma chave).

**Multi-tenancy**: single Postgres com `tenant_id` + RLS. Tenant resolvido por subdomínio (`alfenas.nexus.edu`). White-label via CSS vars semânticas — cor, nome do tutor, voz mudam por tenant.

**Roadmap completo em [`docs/ROADMAP.md`](./docs/ROADMAP.md)**. Sempre ler antes de começar trabalho novo — fases, decisões pendentes e riscos estão lá.

## Workflow obrigatório de cada sessão

**Antes de escrever qualquer código nesse repo**, leia (nessa ordem):

1. [`docs/contexto.md`](./docs/contexto.md) — estado atual: o que funciona, o que está mockado, o que ainda não foi tocado.
2. [`docs/arquitetura.md`](./docs/arquitetura.md) — decisões arquiteturais ativas e estrutura real do código.
3. [`docs/historico.md`](./docs/historico.md) — últimas mudanças e por quê (especialmente as 3-5 entradas mais recentes).

Pular essa leitura quebra trabalho já feito. Não é opcional.

**Depois de qualquer mudança de código**, atualize:

- `docs/historico.md` → entrada nova no **topo** com data, o que mudou e o porquê.
- `docs/arquitetura.md` → se mexeu em estrutura, abstração, provider, decisão de design.
- `docs/contexto.md` → se mudou o que está pronto/pendente/mockado.

Atualização entra no **mesmo commit** da mudança de código, não em commit separado.

## Princípios para escrever código aqui

1. **Auditabilidade default-on**: ações sensíveis (acesso a dados de aluno, envio de mensagem, alerta SRE) precisam virar log em `audit_log`.
2. **Mobile-first real**: layouts devem funcionar em Android barato/3G. Testar com throttling antes de marcar feature como pronta.
3. **Multi-tenant sempre**: nunca escrever query sem filtro de tenant. Usar middleware/helpers que injetam `tenantId` no contexto. Postgres RLS é a segunda barreira.
4. **LGPD com menor**: dados de aluno são PII de menor — exigem cuidado extra. Consentimento do responsável obrigatório.
5. **Tom institucional, não infantil**: aluno de 12 anos não é criança de 6. Linguagem firme, respeitosa, brasileira.
6. **WhatsApp é o canal principal do aluno**: ao desenhar UX/lógica, pensar primeiro em como funciona no Whats, web é fallback.
7. **LLM gateway é obrigatório**: nunca chamar OpenRouter/OpenAI direto de componente. Tudo via `src/lib/llm/`.

## Convenções

- Português do Brasil em UI, mensagens de erro, commits.
- Variáveis e identificadores em inglês; strings de UI em pt-BR.
- Commits seguem o padrão atual (descritivo, no imperativo, em pt-BR).
