import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Download,
  Calendar,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import {
  ESCOLAS_ALFENAS,
  IDEB_SERIE,
  INDICADORES_NEXUS,
} from "@/lib/mocks";
import { getCurrentTenant } from "@/lib/tenants/server";

const KPIS = [
  { label: "Alunos ativos", value: "8.247", delta: "+12% YoY", positive: true },
  { label: "Profs. engajados", value: "518", delta: "85% da base", positive: true },
  { label: "IDEB · 2025", value: "5,7", delta: "+0,3 vs meta", positive: true },
  { label: "Escolas em risco", value: "1", delta: "−1 mês ant.", positive: true },
];

export default async function SecretariaDashboard() {
  const tenant = await getCurrentTenant();
  const escolasRisco = ESCOLAS_ALFENAS.filter((e) => e.risco !== "baixo");

  return (
    <>
      <PageHeader
        title={`Visão da rede · ${tenant.short}`}
        subtitle={`${tenant.population} · ${tenant.schools} escolas · ${tenant.teachers} professores`}
        actions={
          <>
            <Button variant="secondary" icon={<Calendar size={14} />}>
              2º bimestre
            </Button>
            <Button variant="secondary" icon={<Download size={14} />}>
              Exportar
            </Button>
          </>
        }
      />
      <PageBody>
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KPIS.map((k) => (
            <Card key={k.label} className="p-4">
              <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
                {k.label}
              </div>
              <div className="mt-1.5 text-[28px] leading-none font-semibold tracking-tight">
                {k.value}
              </div>
              <div className={`mt-1 flex items-center gap-1 text-xs ${k.positive ? "text-success-fg" : "text-danger-fg"}`}>
                {k.positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {k.delta}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* IDEB */}
          <Card className="p-0">
            <div className="border-border flex items-center justify-between border-b px-6 py-4">
              <div>
                <div className="text-sm font-semibold">IDEB · evolução</div>
                <div className="text-text-muted mt-0.5 text-xs">
                  Anos finais · meta nacional vs. rede municipal
                </div>
              </div>
              <Badge tone="success">superando a meta</Badge>
            </div>
            <div className="p-6">
              <svg viewBox="0 0 600 220" className="h-44 w-full">
                {/* grid */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1={36}
                    x2={580}
                    y1={20 + i * 40}
                    y2={20 + i * 40}
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                  />
                ))}
                {/* x labels */}
                {IDEB_SERIE.map((p, i) => (
                  <text
                    key={p.ano}
                    x={36 + (i * 544) / (IDEB_SERIE.length - 1)}
                    y={210}
                    textAnchor="middle"
                    fill="var(--text-faint)"
                    fontSize="11"
                  >
                    {p.ano}
                  </text>
                ))}
                {/* meta line */}
                <polyline
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points={IDEB_SERIE.map(
                    (p, i) =>
                      `${36 + (i * 544) / (IDEB_SERIE.length - 1)},${180 - ((p.meta - 4) / 2) * 140}`,
                  ).join(" ")}
                />
                {/* rede line */}
                <polyline
                  fill="none"
                  stroke={tenant.primary}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  points={IDEB_SERIE.map(
                    (p, i) =>
                      `${36 + (i * 544) / (IDEB_SERIE.length - 1)},${180 - ((p.rede - 4) / 2) * 140}`,
                  ).join(" ")}
                />
                {IDEB_SERIE.map((p, i) => (
                  <circle
                    key={p.ano}
                    cx={36 + (i * 544) / (IDEB_SERIE.length - 1)}
                    cy={180 - ((p.rede - 4) / 2) * 140}
                    r="4"
                    fill="var(--surface)"
                    stroke={tenant.primary}
                    strokeWidth="2.5"
                  />
                ))}
              </svg>
              <div className="text-text-muted mt-2 flex gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-0.5 w-3"
                    style={{ background: tenant.primary }}
                  />
                  Rede
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-3 bg-[var(--secondary)] [border-style:dashed]" />
                  Meta
                </span>
              </div>
            </div>
          </Card>

          {/* Indicadores Nexus */}
          <Card className="p-0">
            <div className="border-border border-b px-6 py-4">
              <div className="text-sm font-semibold">Indicadores Nexus</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Métricas proprietárias · só Nexus Education tem
              </div>
            </div>
            <div className="flex flex-col">
              {INDICADORES_NEXUS.map((ind) => {
                const ok = ind.inverso
                  ? ind.valor <= ind.ideal
                  : ind.valor >= ind.ideal * 0.9;
                const deltaPositive = ind.inverso ? ind.delta < 0 : ind.delta > 0;
                return (
                  <div
                    key={ind.sigla}
                    className="border-border flex items-center gap-4 px-6 py-3 not-last:border-b"
                  >
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        ok
                          ? "bg-success-soft text-success-fg"
                          : "bg-warning-soft text-warning-fg"
                      }`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {ind.sigla}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium">{ind.nome}</div>
                      <div className="text-text-muted truncate text-[11.5px]">
                        {ind.desc}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums">
                        {ind.valor}
                        {ind.sigla === "IRA" ? "" : "%"}
                      </div>
                      <div
                        className={`text-[10.5px] ${deltaPositive ? "text-success-fg" : "text-danger-fg"}`}
                      >
                        {ind.delta > 0 ? "+" : ""}
                        {ind.delta}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Escolas em risco */}
        <Card className="p-0">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle size={14} className="text-warning" />
                Escolas que pedem atenção
              </div>
              <div className="text-text-muted mt-0.5 text-xs">
                {escolasRisco.length} de {ESCOLAS_ALFENAS.length} escolas com
                IEB abaixo da meta
              </div>
            </div>
            <Link href="/secretaria/escolas">
              <Button variant="ghost" size="sm">
                Ver todas
                <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {["Escola", "Região", "Alunos", "IEB", "Risco"].map((h) => (
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
              {escolasRisco.map((e) => (
                <tr key={e.id} className="hover:bg-surface-2">
                  <td className="border-border h-11 border-b px-4 align-middle font-medium">
                    {e.nome}
                  </td>
                  <td className="border-border text-text-muted h-11 border-b px-4 align-middle text-xs">
                    {e.regiao}
                  </td>
                  <td
                    className="border-border h-11 border-b px-4 align-middle text-xs"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {e.alunos}
                  </td>
                  <td
                    className="border-border h-11 border-b px-4 align-middle text-xs font-semibold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color:
                        e.risco === "alto"
                          ? "var(--danger-fg)"
                          : "var(--warning-fg)",
                    }}
                  >
                    {e.ieb}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle">
                    <Badge tone={e.risco === "alto" ? "danger" : "warning"}>
                      {e.risco}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </PageBody>
    </>
  );
}
