import { Building, CheckCircle, Globe, Search, Sparkles, Upload } from "lucide-react";
import { Button, Card, Chip } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";

const LIBRARIES = [
  { name: "Nacional", icon: Globe, count: 248, active: true },
  { name: "Alfenas-MG", icon: Building, count: 42 },
  { name: "Pouso Alegre-MG", icon: Building, count: 61 },
  { name: "Varginha-MG", icon: Building, count: 38 },
];

const FILTERS = ["BNCC", "Plano de aula", "Avaliações", "Materiais didáticos", "Documentos oficiais"];

const DOCS = [
  { n: "BNCC · Língua Portuguesa · Anos finais.pdf", t: "pdf", tags: ["BNCC", "oficial"], chunks: 412, q: 0.94, v: "3.2" },
  { n: "BNCC · Matemática · Anos finais.pdf", t: "pdf", tags: ["BNCC", "oficial"], chunks: 386, q: 0.93, v: "3.2" },
  { n: "Currículo Referência Minas Gerais.pdf", t: "pdf", tags: ["MG", "currículo"], chunks: 624, q: 0.88, v: "2.1" },
  { n: "Guia de redação para o ensino fundamental.md", t: "md", tags: ["LP", "redação"], chunks: 142, q: 0.91, v: "1.4" },
  { n: "Banco de questões SAEB · 2018-2023.json", t: "json", tags: ["avaliação"], chunks: 1840, q: 0.85, v: "2.0" },
  { n: "Diretrizes BNCC socioemocional.pdf", t: "pdf", tags: ["BNCC", "socioemocional"], chunks: 224, q: 0.89, v: "1.1" },
];

const TYPE_STYLE: Record<string, { bg: string; fg: string }> = {
  pdf: { bg: "var(--danger-soft)", fg: "var(--danger)" },
  md: { bg: "var(--primary-soft)", fg: "var(--primary)" },
  json: { bg: "var(--warning-soft)", fg: "var(--warning-fg)" },
};

export default function BasePage() {
  return (
    <>
      <PageHeader
        title="Base de conhecimento"
        subtitle="Biblioteca nacional compartilhada + bibliotecas por prefeitura · indexação vetorial via pgvector"
        actions={
          <>
            <Button variant="secondary" icon={<Upload size={14} />}>
              Upload
            </Button>
            <Button icon={<Sparkles size={14} />}>Reindexar</Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
          <Card className="p-4">
            <div className="text-text-faint text-[11.5px] font-semibold tracking-wider uppercase">
              Bibliotecas
            </div>
            <div className="mt-2.5 flex flex-col gap-1">
              {LIBRARIES.map((l) => {
                const Icon = l.icon;
                return (
                  <div
                    key={l.name}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] ${
                      l.active ? "bg-primary-soft text-primary font-medium" : "text-text-muted"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="flex-1">{l.name}</span>
                    <span
                      className={`text-[10.5px] ${l.active ? "text-primary" : "text-text-faint"}`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {l.count}
                    </span>
                  </div>
                );
              })}
            </div>
            <hr className="border-border my-4" />
            <div className="text-text-faint text-[11.5px] font-semibold tracking-wider uppercase">
              Filtros
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <Chip key={f}>{f}</Chip>
              ))}
            </div>
          </Card>

          <Card className="p-0">
            <div className="border-border flex items-center gap-3 border-b px-4 py-3">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="text-text-faint absolute top-1/2 left-3 -translate-y-1/2"
                />
                <input
                  className="bg-surface border-border-strong h-9 w-full rounded-md border pr-3 pl-9 text-sm outline-none"
                  placeholder="Buscar título, conteúdo, embedding semântico…"
                />
              </div>
              <div className="text-text-muted flex items-center gap-1.5 text-[11px]">
                <CheckCircle size={11} className="text-success" />
                Indexado · 248 docs · 64.2k chunks
              </div>
            </div>
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {[
                    "Documento",
                    "Tipo",
                    "Tags",
                    "Chunks",
                    "Qualidade retrieval",
                    "Versão",
                  ].map((h) => (
                    <th
                      key={h}
                      className="bg-surface-2 text-text-faint border-border border-b px-4 py-2 text-left text-[11px] font-medium tracking-wide uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DOCS.map((d) => (
                  <tr key={d.n} className="hover:bg-surface-2">
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-7 shrink-0 items-center justify-center rounded text-[10px] font-bold uppercase"
                          style={{
                            background: TYPE_STYLE[d.t].bg,
                            color: TYPE_STYLE[d.t].fg,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {d.t}
                        </div>
                        <span className="text-[12.5px]">{d.n}</span>
                      </div>
                    </td>
                    <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-[11px] uppercase">
                      {d.t}
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {d.tags.map((t) => (
                          <Chip key={t} className="text-[10px]">
                            {t}
                          </Chip>
                        ))}
                      </div>
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                      {d.chunks}
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="bg-surface-3 h-1 w-20 overflow-hidden rounded">
                          <div
                            className="h-full"
                            style={{
                              width: `${d.q * 100}%`,
                              background: d.q > 0.9 ? "var(--success)" : "var(--warning)",
                            }}
                          />
                        </div>
                        <span className="text-text-muted text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                          {d.q.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                      v{d.v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
