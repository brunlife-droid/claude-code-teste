import { Building, Plus, Search } from "lucide-react";
import { Badge, Button, Card, Chip } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { PREFEITURAS_NEXUS } from "@/lib/mocks";

const HEALTH_LABEL: Record<string, { color: string; label: string }> = {
  good: { color: "var(--success)", label: "saudável" },
  warn: { color: "var(--warning)", label: "atenção" },
  risk: { color: "var(--danger)", label: "risco" },
  pending: { color: "var(--text-faint)", label: "pendente" },
};

export default function PrefeiturasPage() {
  return (
    <>
      <PageHeader
        title="Prefeituras"
        subtitle="Todos os tenants ativos, trials e onboardings"
        actions={<Button icon={<Plus size={14} />}>Nova prefeitura</Button>}
      />
      <PageBody>
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative max-w-xs flex-1">
              <Search
                size={14}
                className="text-text-faint absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                placeholder="Nome, UF, CNPJ…"
                className="bg-surface border-border-strong h-9 w-full rounded-md border pr-3 pl-9 text-sm outline-none"
              />
            </div>
            {[
              "Status: Todos",
              "UF: MG",
              "Health: Todos",
              "MRR: > R$ 5k",
            ].map((f) => (
              <Chip key={f}>{f}</Chip>
            ))}
          </div>
        </Card>

        <Card className="p-0">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {[
                  "Prefeitura",
                  "Status",
                  "MRR",
                  "Alunos",
                  "Adoção",
                  "Cobrança",
                  "Health",
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
              {PREFEITURAS_NEXUS.map((p) => {
                const adocao = 60 + (p.id.charCodeAt(1) % 40);
                const health = HEALTH_LABEL[p.health];
                return (
                  <tr key={p.id} className="hover:bg-surface-2">
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-3 text-text-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                          <Building size={13} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{p.nome}</div>
                          <div className="text-text-faint text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                            {p.id}.nexus.edu
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle">
                      {p.status === "ativo" && <Badge tone="success">ativo</Badge>}
                      {p.status === "trial" && <Badge tone="warning">trial</Badge>}
                      {p.status === "onboarding" && <Badge tone="primary">onboarding</Badge>}
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                      {p.mrr > 0 ? `R$ ${(p.mrr / 1000).toFixed(1)}k` : "—"}
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                      {p.alunos.toLocaleString("pt-BR")}
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="bg-surface-3 h-1 w-20 overflow-hidden rounded">
                          <div
                            className="h-full"
                            style={{
                              width: `${adocao}%`,
                              background:
                                p.health === "good"
                                  ? "var(--success)"
                                  : p.health === "warn"
                                    ? "var(--warning)"
                                    : "var(--danger)",
                            }}
                          />
                        </div>
                        <span className="text-text-muted text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                          {adocao}%
                        </span>
                      </div>
                    </td>
                    <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                      {p.proxCobranca}
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <span className="text-text-muted inline-flex items-center gap-1.5 text-xs">
                        <span className="size-2 rounded-full" style={{ background: health.color }} />
                        {health.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </PageBody>
    </>
  );
}
