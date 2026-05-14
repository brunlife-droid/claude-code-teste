# Nexus Governamental

Orquestrador de IA para o setor público — uma plataforma para gerenciar, conectar e auditar múltiplos modelos de IA e agentes em fluxos de trabalho governamentais.

## Visão

- **Orquestração multi-modelo**: integra diferentes provedores de IA (Anthropic, OpenAI, modelos open-source) em uma única interface.
- **Foco no setor público**: acessibilidade (WCAG), rastreabilidade de decisões, conformidade com LGPD.
- **Fluxos auditáveis**: cada execução fica registrada para revisão e prestação de contas.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- ESLint

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando         | O que faz                            |
| --------------- | ------------------------------------ |
| `npm run dev`   | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção             |
| `npm run start` | Roda o build de produção             |
| `npm run lint`  | Roda o linter                        |

## Estrutura

```
src/
  app/
    layout.tsx   # Layout raiz
    page.tsx     # Landing page
    globals.css  # Estilos globais
```
