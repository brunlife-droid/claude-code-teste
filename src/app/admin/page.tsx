import { ArrowUp, Calendar, Download } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";

const KPIS = [
  { label: "ARR", value: "R$ 1,42M", delta: "+18%", sub: "YoY" },
  { label: "MRR", value: "R$ 118.180", delta: "+R$ 8,2k", sub: "vs. abril" },
  { label: "Crescimento", value: "+7%", delta: "+1,2pp", sub: "MoM" },
  { label: "Churn", value: "1,2%", delta: "−0,4pp", sub: "rolling 90d" },
  { label: "NPS", value: "+62", delta: "+8", sub: "última pesquisa" },
] as const;

const TENANTS = [
  { name: "Alfenas-MG", status: "ativo", mrr: "R$ 18.840", alunos: "9.420", health: "good" },
  { name: "Pouso Alegre-MG", status: "ativo", mrr: "R$ 32.200", alunos: "17.840", health: "good" },
  { name: "Varginha-MG", status: "ativo", mrr: "R$ 28.800", alunos: "16.210", health: "warn" },
  { name: "Itajubá-MG", status: "ativo", mrr: "R$ 13.900", alunos: "6.890", health: "good" },
  { name: "Três Corações-MG", status: "ativo", mrr: "R$ 10.240", alunos: "5.120", health: "good" },
  { name: "Lavras-MG", status: "trial", mrr: "—", alunos: "8.410", health: "risk" },
  { name: "Boa Esperança-MG", status: "ativo", mrr: "R$ 4.200", alunos: "1.980", health: "good" },
  { name: "Machado-MG", status: "onboarding", mrr: "—", alunos: "3.210", health: "pending" },
] as const;

const HEALTH_LABEL: Record<string, { color: string; label: string }> = {
  good: { color: "var(--success)", label: "saudável" },
  warn: { color: "var(--warning)", label: "atenção" },
  risk: { color: "var(--danger)", label: "risco" },
  pending: { color: "var(--text-faint)", label: "pendente" },
};

export default function AdminDashboard() {
  return (
    <>
      <header className="flex items-end justify-between gap-4 px-8 pt-6 pb-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">
            Visão de negócio · Nexus Education
          </h1>
          <p className="text-text-muted mt-1 text-[13px]">
            ARR, churn, health · 8 prefeituras · MG
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Calendar size={14} />}>
            maio/26
          </Button>
          <Button variant="secondary" icon={<Download size={14} />}>
            Exportar
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-8 pb-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {KPIS.map((k) => (
            <Card key={k.label} className="p-4">
              <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
                {k.label}
              </div>
              <div className="mt-1.5 text-[28px] leading-none font-semibold tracking-tight">
                {k.value}
              </div>
              <div className="text-success-fg mt-1 flex items-center gap-1 text-xs">
                <ArrowUp size={11} />
                {k.delta}
                <span className="text-text-faint ml-1">{k.sub}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Tenants table */}
        <Card className="p-0">
          <div className="border-border flex items-center justify-between gap-4 border-b px-[18px] py-3.5">
            <div>
              <div className="text-sm font-semibold">Prefeituras · top por uso</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Health = engajamento × adoção × pagamento em dia
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Ver todas
            </Button>
          </div>

          <table className="w-full border-separate border-spacing-0 text-[13px]">
            <thead>
              <tr>
                {["Prefeitura", "Status", "MRR", "Alunos", "Health"].map((h) => (
                  <th
                    key={h}
                    className="bg-surface-2 text-text-faint border-border border-b px-3 py-2 text-left text-[11.5px] font-medium tracking-wide uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TENANTS.map((t) => {
                const health = HEALTH_LABEL[t.health];
                return (
                  <tr key={t.name} className="hover:bg-surface-2">
                    <td className="border-border h-11 border-b px-3 align-middle">
                      <span className="font-medium">{t.name}</span>
                    </td>
                    <td className="border-border h-11 border-b px-3 align-middle">
                      {t.status === "ativo" && <Badge tone="success">ativo</Badge>}
                      {t.status === "trial" && <Badge tone="warning">trial</Badge>}
                      {t.status === "onboarding" && (
                        <Badge tone="primary">onboarding</Badge>
                      )}
                    </td>
                    <td
                      className="border-border h-11 border-b px-3 align-middle text-xs"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {t.mrr}
                    </td>
                    <td
                      className="border-border h-11 border-b px-3 align-middle text-xs"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {t.alunos}
                    </td>
                    <td className="border-border h-11 border-b px-3 align-middle">
                      <span className="text-text-muted inline-flex items-center gap-1.5 text-xs">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: health.color }}
                        />
                        {health.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Phase 0 disclaimer */}
        <Card className="bg-primary-soft border-primary-border p-4">
          <div className="text-primary text-[11.5px] font-semibold tracking-wider uppercase">
            Fase 0
          </div>
          <p className="text-primary mt-1 text-sm leading-relaxed">
            Esta é uma <b>demo do layout shell</b> (sidebar + topbar) com dados
            mockados. As outras rotas do menu lateral ainda não existem —
            próxima entrega da Fase 0 inclui DB, auth e middleware multi-tenant
            antes de implementarmos as telas reais.
          </p>
        </Card>
      </div>
    </>
  );
}
