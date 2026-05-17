import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar,
  Download,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";
import { requireRole } from "@/lib/auth/session";
import {
  loadNetworkKpis,
  loadSchoolsHealth,
} from "@/lib/secretaria/queries";

function pctLabel(score: number): string {
  if (score === 0) return "-";
  return `${(score * 100).toFixed(0)}%`;
}

export default async function SecretariaDashboard() {
  await requireRole("secretaria");
  const tenant = await getCurrentTenant();
  const [networkKpis, schools] = await Promise.all([
    loadNetworkKpis({ tenantId: tenant.id }),
    loadSchoolsHealth({ tenantId: tenant.id }),
  ]);

  const schoolsAtRisk = schools
    .filter((school) => school.atRiskCount > 0 || school.avgProficiency < 0.45)
    .sort((a, b) => b.atRiskCount - a.atRiskCount || a.avgProficiency - b.avgProficiency)
    .slice(0, 6);
  const engagementPct =
    networkKpis.studentsTotal > 0
      ? Math.round(
          (networkKpis.studentsEngaged7d / networkKpis.studentsTotal) * 100,
        )
      : 0;

  const kpis = [
    {
      label: "Alunos ativos",
      value: networkKpis.studentsTotal.toLocaleString("pt-BR"),
      delta: `${networkKpis.studentsEngaged7d} engajados nos ultimos 7d`,
      positive: true,
    },
    {
      label: "Professores",
      value: networkKpis.teachersTotal.toString(),
      delta: `${networkKpis.classesTotal} turmas - ${networkKpis.schoolsTotal} escolas`,
      positive: true,
    },
    {
      label: "Proficiencia media",
      value: pctLabel(networkKpis.avgProficiency),
      delta: "agregado real do Postgres",
      positive: networkKpis.avgProficiency >= 0.6,
    },
    {
      label: "Alunos em risco",
      value: networkKpis.studentsAtRisk.toString(),
      delta:
        networkKpis.studentsAtRisk === 0
          ? "nenhum aluno no corte"
          : `${engagementPct}% da rede ativa`,
      positive: networkKpis.studentsAtRisk === 0,
    },
  ];

  const indicators = [
    {
      sigla: "IEP",
      nome: "Indice de evolucao pedagogica",
      valor: pctLabel(networkKpis.avgProficiency),
      ok: networkKpis.avgProficiency >= 0.6,
      desc: "Media de proficiencia por habilidade BNCC registrada.",
    },
    {
      sigla: "IRA",
      nome: "Indice de risco academico",
      valor:
        networkKpis.studentsTotal > 0
          ? `${Math.round((networkKpis.studentsAtRisk / networkKpis.studentsTotal) * 100)}%`
          : "-",
      ok: networkKpis.studentsAtRisk === 0,
      desc: "Percentual de alunos abaixo do corte pedagogico atual.",
    },
    {
      sigla: "TPL",
      nome: "Taxa de participacao na tutora",
      valor: `${engagementPct}%`,
      ok: engagementPct >= 50,
      desc: "Alunos com conversa registrada nos ultimos 7 dias.",
    },
    {
      sigla: "ERM",
      nome: "Escolas requerendo monitoramento",
      valor: schoolsAtRisk.length.toString(),
      ok: schoolsAtRisk.length === 0,
      desc: "Escolas com risco academico ou baixa proficiencia agregada.",
    },
  ];

  return (
    <>
      <PageHeader
        title={`Visao da rede - ${tenant.short}`}
        subtitle={`${networkKpis.schoolsTotal} escolas - ${networkKpis.classesTotal} turmas - ${networkKpis.teachersTotal} profissionais`}
        actions={
          <>
            <Button variant="secondary" icon={<Calendar size={14} />}>
              Bimestre atual
            </Button>
            <Link href="/secretaria/relatorio">
              <Button variant="secondary" icon={<Download size={14} />}>
                Relatorio
              </Button>
            </Link>
          </>
        }
      />
      <PageBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="p-4">
              <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
                {k.label}
              </div>
              <div className="mt-1.5 text-[28px] leading-none font-semibold tracking-tight">
                {k.value}
              </div>
              <div
                className={`mt-1 flex items-center gap-1 text-xs ${
                  k.positive ? "text-success-fg" : "text-danger-fg"
                }`}
              >
                {k.positive ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {k.delta}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <Card className="p-0">
            <div className="border-border border-b px-6 py-4">
              <div className="text-sm font-semibold">Saude das escolas</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Proficiencia media e alunos em risco por escola
              </div>
            </div>
            {schools.length === 0 ? (
              <div className="p-8 text-sm text-text-muted">
                Nenhuma escola encontrada para este tenant.
              </div>
            ) : (
              <div className="p-5">
                <div className="flex flex-col gap-3">
                  {schools.slice(0, 8).map((school) => (
                    <div key={school.id} className="grid gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {school.name}
                          </div>
                          <div className="text-text-muted text-xs">
                            {school.studentsTotal} alunos - {school.classesTotal} turmas
                          </div>
                        </div>
                        <Badge
                          tone={
                            school.atRiskCount > 0 || school.avgProficiency < 0.45
                              ? "warning"
                              : "success"
                          }
                        >
                          {pctLabel(school.avgProficiency)}
                        </Badge>
                      </div>
                      <div className="bg-surface-3 h-2 overflow-hidden rounded">
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.round(school.avgProficiency * 100)}%`,
                            background:
                              school.avgProficiency >= 0.6
                                ? "var(--success)"
                                : "var(--warning)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-0">
            <div className="border-border border-b px-6 py-4">
              <div className="text-sm font-semibold">Indicadores Nexus</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Calculados a partir dos dados persistidos
              </div>
            </div>
            <div className="flex flex-col">
              {indicators.map((ind) => (
                <div
                  key={ind.sigla}
                  className="border-border flex items-center gap-4 px-6 py-3 not-last:border-b"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      ind.ok
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
                  <div className="text-sm font-semibold tabular-nums">
                    {ind.valor}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-0">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle size={14} className="text-warning" />
                Escolas que pedem atencao
              </div>
              <div className="text-text-muted mt-0.5 text-xs">
                {schoolsAtRisk.length} escola(s) com risco ou baixa proficiencia
              </div>
            </div>
            <Link href="/secretaria/escolas">
              <Button variant="ghost" size="sm">
                Ver todas
                <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
          {schoolsAtRisk.length === 0 ? (
            <div className="p-6 text-sm text-text-muted">
              Nenhuma escola no corte de atencao atual.
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {["Escola", "Regiao", "Alunos", "Proficiencia", "Em risco"].map(
                    (h) => (
                      <th
                        key={h}
                        className="bg-surface-2 text-text-faint border-border border-b px-4 py-2 text-left text-[11px] font-medium tracking-wide uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {schoolsAtRisk.map((school) => (
                  <tr key={school.id} className="hover:bg-surface-2">
                    <td className="border-border h-11 border-b px-4 align-middle font-medium">
                      {school.name}
                    </td>
                    <td className="border-border text-text-muted h-11 border-b px-4 align-middle text-xs">
                      {school.region ?? "-"}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs">
                      {school.studentsTotal}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs font-semibold">
                      {pctLabel(school.avgProficiency)}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <Badge tone={school.atRiskCount > 0 ? "danger" : "warning"}>
                        {school.atRiskCount}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </PageBody>
    </>
  );
}
