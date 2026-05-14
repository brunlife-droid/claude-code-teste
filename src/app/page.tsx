export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-zinc-50 to-white text-zinc-900 dark:from-zinc-950 dark:to-black dark:text-zinc-100">
      <header className="border-b border-zinc-200/70 dark:border-zinc-800/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div
              aria-hidden
              className="h-7 w-7 rounded-md bg-gradient-to-br from-emerald-500 to-sky-600"
            />
            <span className="text-sm font-semibold tracking-tight">
              Nexus Governamental
            </span>
          </div>
          <nav className="hidden gap-6 text-sm text-zinc-600 dark:text-zinc-400 sm:flex">
            <a href="#recursos" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Recursos
            </a>
            <a href="#stack" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Stack
            </a>
            <a href="#contato" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Contato
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6">
        <section className="flex flex-col items-start gap-6 py-20 sm:py-28">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            Plataforma em desenvolvimento
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Orquestração de IA para o setor público, com{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-sky-600 bg-clip-text text-transparent">
              auditoria e governança
            </span>{" "}
            por padrão.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Conecte múltiplos modelos de IA, defina fluxos de trabalho e
            mantenha rastreabilidade completa das decisões — tudo em
            conformidade com a LGPD e padrões de acessibilidade.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#recursos"
              className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Conhecer recursos
            </a>
            <a
              href="#contato"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Entrar em contato
            </a>
          </div>
        </section>

        <section id="recursos" className="grid gap-6 py-12 sm:grid-cols-3">
          <FeatureCard
            title="Multi-modelo"
            description="Integre provedores como Anthropic, OpenAI e modelos open-source através de uma camada única de orquestração."
          />
          <FeatureCard
            title="Auditoria total"
            description="Cada prompt, resposta e decisão fica registrado para revisão, conformidade e prestação de contas."
          />
          <FeatureCard
            title="LGPD-ready"
            description="Controle granular de dados sensíveis, anonimização e políticas de retenção configuráveis por órgão."
          />
        </section>

        <section
          id="stack"
          className="rounded-2xl border border-zinc-200 bg-white/60 p-8 dark:border-zinc-800 dark:bg-zinc-950/40"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Stack técnica</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Construído sobre tecnologias modernas e amplamente adotadas no
            mercado.
          </p>
          <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <StackItem label="Next.js 16" detail="App Router + Server Actions" />
            <StackItem label="React 19" detail="Streaming nativo" />
            <StackItem label="TypeScript" detail="Segurança de tipos" />
            <StackItem label="Tailwind CSS v4" detail="Design system rápido" />
          </ul>
        </section>

        <section id="contato" className="py-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Quer saber mais?
          </h2>
          <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
            Este é um projeto em fase inicial. Em breve disponibilizaremos um
            canal direto para órgãos públicos interessados em piloto.
          </p>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 dark:border-zinc-800/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Nexus Governamental</span>
          <span>Construído com Next.js</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function StackItem({ label, detail }: { label: string; detail: string }) {
  return (
    <li className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <span className="font-medium">{label}</span>
      <span className="text-zinc-500 dark:text-zinc-400">{detail}</span>
    </li>
  );
}
