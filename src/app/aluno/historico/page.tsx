import Link from "next/link";
import { MessageSquare, Search } from "lucide-react";
import { Chip } from "@/components/ui";
import { getCurrentTenant } from "@/lib/tenants/server";

const GROUPS = [
  {
    title: "Hoje",
    items: [
      { area: "Matemática", tema: "Frações de uma pizza", hora: "15:32", msgs: 14 },
    ],
  },
  {
    title: "Ontem",
    items: [
      { area: "Língua Portuguesa", tema: "Coesão referencial em redação", hora: "19:08", msgs: 22 },
      { area: "Ciências", tema: "Diferença entre célula animal e vegetal", hora: "14:51", msgs: 8 },
    ],
  },
  {
    title: "Esta semana",
    items: [
      { area: "História", tema: "Brasil Império — Dom Pedro II", hora: "Seg, 09:14", msgs: 17 },
      { area: "Matemática", tema: "Equação do 1º grau — questão da prova", hora: "Dom, 20:40", msgs: 31 },
      { area: "Geografia", tema: "Climas do Brasil — clima tropical", hora: "Sáb, 17:22", msgs: 11 },
    ],
  },
];

const FILTERS = ["Tudo", "Matemática", "Português", "Ciências", "História", "Geografia"];

export default async function HistoricoPage() {
  const tenant = await getCurrentTenant();
  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-10">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Materiais</h1>
          <p className="text-text-muted mt-2 text-[15px]">
            Todas as conversas que você teve com a {tenant.tutorName}. Busque
            por tema ou navegue por disciplina.
          </p>
        </header>

        {/* Busca */}
        <div className="relative mt-6">
          <Search
            size={16}
            className="text-text-faint absolute top-1/2 left-4 -translate-y-1/2"
          />
          <input
            className="bg-surface border-border-strong placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-soft)] h-12 w-full rounded-xl border pr-4 pl-11 text-[15px] outline-none transition-all"
            placeholder="Buscar tema, palavra-chave…"
          />
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f, i) => (
            <Chip
              key={f}
              className="cursor-pointer"
              style={
                i === 0
                  ? {
                      background: tenant.primarySoft,
                      color: tenant.primary,
                      borderColor: "transparent",
                    }
                  : undefined
              }
            >
              {f}
            </Chip>
          ))}
        </div>

        {/* Lista */}
        <div className="mt-8 flex flex-col gap-8">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
                {g.title}
              </div>
              <div className="mt-3 flex flex-col">
                {g.items.map((it, i) => (
                  <Link
                    key={i}
                    href="/aluno/chat"
                    className="hover:bg-surface-2 border-border group flex items-start gap-4 border-b py-4 transition-colors"
                  >
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: tenant.primarySoft,
                        color: tenant.primary,
                      }}
                    >
                      <MessageSquare size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-text-muted text-xs">{it.area}</span>
                        <span className="text-text-faint text-xs">{it.hora}</span>
                      </div>
                      <div className="text-text mt-1 text-[15px]">{it.tema}</div>
                      <div className="text-text-faint mt-1 text-xs">
                        {it.msgs} mensagens
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
