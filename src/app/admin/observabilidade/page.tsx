import { Activity, AlertTriangle, CheckCircle, Server, Settings } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";

const KPIS = [
  { l: "Status geral", v: "Operacional", sub: "99,98% · 30d", success: true },
  { l: "P95 latência", v: "1,3s", sub: "todos modelos", success: true },
  { l: "Taxa erro", v: "0,04%", sub: "últimas 24h", success: true },
  { l: "Tokens / s", v: "12,4k", sub: "real-time" },
  { l: "Custo / hora", v: "R$ 14,22", sub: "rolling" },
];

const MODELS = [
  { n: "anthropic/claude-haiku-4-5", p: "OpenRouter", use: 72, p95: "1,0s", err: "0,02%", cost: "R$ 6,80", prim: true },
  { n: "google/gemini-2.5-flash", p: "OpenRouter", use: 18, p95: "1,2s", err: "0,05%", cost: "R$ 4,20" },
  { n: "openai/gpt-4o-mini", p: "OpenRouter", use: 8, p95: "1,5s", err: "0,03%", cost: "R$ 8,40" },
  { n: "meta-llama/llama-3.3-70b", p: "OpenRouter", use: 2, p95: "2,2s", err: "0,09%", cost: "R$ 2,10", standby: true },
];

const SWITCHES = [
  { cap: "Chat (aluno)", cur: "anthropic/claude-haiku-4-5", alt: "google/gemini-2.5-flash" },
  { cap: "Geração de plano", cur: "anthropic/claude-haiku-4-5", alt: "—" },
  { cap: "Correção redação", cur: "openai/gpt-4o-mini", alt: "anthropic/claude-haiku-4-5" },
  { cap: "Embeddings RAG", cur: "openai/text-embedding-3-small", alt: "voyage-3" },
];

export default function ObservabilidadePage() {
  return (
    <>
      <PageHeader
        title="Observabilidade"
        subtitle="Foundation models · latência · custos · switch sem deploy"
        actions={
          <>
            <Button variant="secondary" icon={<Activity size={14} />}>
              Live
            </Button>
            <Button icon={<AlertTriangle size={14} />}>Incidentes</Button>
          </>
        }
      />
      <PageBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {KPIS.map((k) => (
            <Card key={k.l} className="p-4">
              <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
                {k.l}
              </div>
              <div
                className="mt-1.5 text-[24px] leading-none font-semibold tracking-tight"
                style={k.success ? { color: "var(--success-fg)" } : undefined}
              >
                {k.v}
              </div>
              <div className="text-text-faint mt-1 text-xs">{k.sub}</div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Card className="p-0">
            <div className="border-border flex items-center justify-between border-b px-6 py-4">
              <div className="text-sm font-semibold">Foundation models · ativos</div>
              <Button variant="ghost" size="sm" icon={<Settings size={12} />}>
                Configurar
              </Button>
            </div>
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {["Modelo", "Uso", "P95", "Erro", "$/1M tokens", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="bg-surface-2 text-text-faint border-border border-b px-3 py-2 text-left text-[11px] font-medium tracking-wide uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m) => (
                  <tr key={m.n} className="hover:bg-surface-2">
                    <td className="border-border h-12 border-b px-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-surface-3 text-text-muted flex size-6 shrink-0 items-center justify-center rounded">
                          <Server size={12} />
                        </div>
                        <div>
                          <div className="text-[12.5px] font-medium" style={{ fontFamily: "var(--font-mono)" }}>
                            {m.n}
                          </div>
                          <div className="text-text-faint text-[10.5px]">{m.p}</div>
                        </div>
                        {m.prim && <Badge tone="primary">primário</Badge>}
                      </div>
                    </td>
                    <td className="border-border h-12 border-b px-3 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="bg-surface-3 h-1 w-14 overflow-hidden rounded">
                          <div className="bg-primary h-full" style={{ width: `${m.use}%` }} />
                        </div>
                        <span className="text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                          {m.use}%
                        </span>
                      </div>
                    </td>
                    <td className="border-border h-12 border-b px-3 align-middle text-[11.5px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {m.p95}
                    </td>
                    <td className="border-border text-success-fg h-12 border-b px-3 align-middle text-[11.5px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {m.err}
                    </td>
                    <td className="border-border h-12 border-b px-3 align-middle text-[11.5px]" style={{ fontFamily: "var(--font-mono)" }}>
                      {m.cost}
                    </td>
                    <td className="border-border h-12 border-b px-3 align-middle">
                      <Badge tone={m.standby ? "neutral" : "success"}>
                        {m.standby ? "standby" : "ok"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="p-0">
            <div className="border-border flex items-center justify-between border-b px-6 py-4">
              <div className="text-sm font-semibold">Switch sem deploy</div>
              <Badge tone="success" icon={<CheckCircle size={10} />}>
                safe
              </Badge>
            </div>
            <div className="p-5">
              <div className="text-text-muted mb-3 text-xs">
                Trocar provedor primário para uma capability
              </div>
              <div className="flex flex-col gap-2">
                {SWITCHES.map((s) => (
                  <div
                    key={s.cap}
                    className="bg-surface-2 flex items-center gap-3 rounded-md p-3"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-medium">{s.cap}</div>
                      <div className="text-text-faint text-[10.5px]" style={{ fontFamily: "var(--font-mono)" }}>
                        {s.cur} → {s.alt}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Trocar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
