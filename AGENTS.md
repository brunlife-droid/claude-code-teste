<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nexus Education - contexto do produto

Plataforma SaaS multi-tenant white-label de IA pedagogica para redes municipais de educacao no Brasil.

**4 camadas de usuario**: Aluno (mobile/WhatsApp), Professor (web), Secretaria (web), Admin Nexus (interno).

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4. Backend via Server Actions e API Routes do Next. Postgres (Neon) + Drizzle + pgvector. AI SDK (Vercel) com **OpenRouter** como gateway unificado (Claude Haiku 4.5 primario; GPT, Gemini, Llama via mesma chave).

**Multi-tenancy**: single Postgres com `tenant_id` + RLS. Tenant resolvido por subdominio (`alfenas.nexus.edu`). White-label via CSS vars semanticas: cor, nome do tutor e voz mudam por tenant.

**Roadmap completo em [`docs/ROADMAP.md`](./docs/ROADMAP.md)**. Sempre ler antes de comecar trabalho novo: fases, decisoes pendentes e riscos estao la.

## Workflow obrigatorio de cada sessao

**Antes de escrever qualquer codigo nesse repo**, leia novamente, nessa ordem:

1. [`docs/contexto.md`](./docs/contexto.md): estado atual; o que funciona, o que esta mockado e o que ainda nao foi tocado.
2. [`docs/arquitetura.md`](./docs/arquitetura.md): decisoes arquiteturais ativas e estrutura real do codigo.
3. [`docs/historico.md`](./docs/historico.md): ultimas mudancas e por que, especialmente as 3-5 entradas mais recentes.

Pular essa leitura quebra trabalho ja feito. Nao e opcional.

**Depois de qualquer mudanca de codigo ou feature**, atualize:

- `docs/historico.md`: entrada nova no **topo** com data, o que mudou e o porque.
- `docs/arquitetura.md`: se mexeu em estrutura, abstracao, provider ou decisao de design.
- `docs/contexto.md`: se mudou o que esta pronto, pendente ou mockado.

A atualizacao da documentacao entra no **mesmo commit** da mudanca de codigo, nao em commit separado.

## Principios para escrever codigo aqui

1. **Auditabilidade default-on**: acoes sensiveis, como acesso a dados de aluno, envio de mensagem e alerta SRE, precisam virar log em `audit_log`.
2. **Mobile-first real**: layouts devem funcionar em Android barato/3G. Testar com throttling antes de marcar feature como pronta.
3. **Multi-tenant sempre**: nunca escrever query sem filtro de tenant. Usar middleware/helpers que injetam `tenantId` no contexto. Postgres RLS e a segunda barreira.
4. **LGPD com menor**: dados de aluno sao PII de menor e exigem cuidado extra. Consentimento do responsavel e obrigatorio.
5. **Tom institucional, nao infantil**: aluno de 12 anos nao e crianca de 6. Linguagem firme, respeitosa e brasileira.
6. **WhatsApp e o canal principal do aluno**: ao desenhar UX/logica, pensar primeiro em como funciona no WhatsApp; web e fallback.
7. **LLM gateway e obrigatorio**: nunca chamar OpenRouter/OpenAI direto de componente. Tudo via `src/lib/llm/`.

## Convencoes

- Portugues do Brasil em UI, mensagens de erro, commits e respostas ao usuario.
- Variaveis e identificadores em ingles; strings de UI em pt-BR.
- Commits seguem o padrao atual: descritivo, no imperativo e em pt-BR.

## Fechamento de cada acao

Ao terminar qualquer acao para o Bruno, sempre incluir no fechamento 3 sugestoes objetivas de melhorias ou tarefas pendentes relacionadas ao que acabou de ser feito.
