import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Badge, Button, Card, ProfBadge } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { requireRole } from "@/lib/auth/session";
import { getCurrentTenant } from "@/lib/tenants/server";
import {
  loadTeacherContext,
  loadDashboardKpis,
  loadTeacherAlerts,
  loadTopStudents,
  scoreToProficiency,
} from "@/lib/teacher/queries";

const SHORTCUTS = [
  {
    title: "Novo plano de aula",
    desc: "IA gera em ~90s. Você revisa e ajusta.",
    href: "/professor/copiloto",
    icon: Sparkles,
  },
  {
    title: "Corrigir redações",
    desc: "Redações aguardando devolutiva.",
    href: "/professor/correcao",
    icon: AlertTriangle,
  },
  {
    title: "Gerar prova",
    desc: "Multi-versão com gabarito.",
    href: "/professor/provas",
    icon: Plus,
  },
];

export default async function ProfessorDashboard() {
  const user = await requireRole(
    "professor",
    "coordenador",
    "diretor",
    "orientador",
  );
  const tenant = await getCurrentTenant();

  const ctx = await loadTeacherContext({
    userId: user.id,
    tenantId: tenant.id,
  });
  const [kpis, top, alerts] = await Promise.all([
    loadDashboardKpis({ tenantId: tenant.id, classIds: ctx.classIds }),
    loadTopStudents({ tenantId: tenant.id, classIds: ctx.classIds, limit: 3 }),
    loadTeacherAlerts({ tenantId: tenant.id, classIds: ctx.classIds, limit: 6 }),
  ]);

  const firstName = user.name?.split(" ")[0] ?? "Professor";
  const subtitle =
    ctx.classes.length > 0
      ? ctx.classes
          .map((c) => `${c.name} (${c.schoolName})`)
          .join(" · ")
      : "Sem turma atribuída ainda";

  const KPIS = [
    {
      label: "Alunos engajados",
      value:
        kpis.studentsTotal > 0
          ? `${kpis.engagedThisWeek} / ${kpis.studentsTotal}`
          : "—",
      sub: "esta semana",
    },
    {
      label: "Alunos em risco",
      value: kpis.atRisk.count.toString(),
      sub: kpis.atRisk.names.join(", ") || "ninguém em risco",
    },
    {
      label: "Total na turma",
      value: kpis.studentsTotal.toString(),
      sub: ctx.classes[0]?.name ?? "—",
    },
    {
      label: "Próximas aulas",
      value: "—",
      sub: "agenda pendente",
    },
  ];

  return (
    <>
      <PageHeader
        title={`Olá, ${firstName}.`}
        subtitle={subtitle}
        actions={
          <>
            <Button variant="secondary">Hoje</Button>
            <Button icon={<Plus size={14} />}>Nova ação</Button>
          </>
        }
      />
      <PageBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KPIS.map((k) => (
            <Card key={k.label} className="p-4">
              <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
                {k.label}
              </div>
              <div className="mt-1.5 text-[28px] leading-none font-semibold tracking-tight">
                {k.value}
              </div>
              <div className="text-text-muted mt-1 truncate text-xs">
                {k.sub}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className="text-text-faint text-[11.5px] font-semibold tracking-wider uppercase">
              Atalhos pedagógicos
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {SHORTCUTS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link key={s.href} href={s.href}>
                    <Card className="hover:border-border-strong h-full p-4 transition-colors">
                      <div className="bg-primary-soft text-primary inline-flex rounded-md p-2">
                        <Icon size={16} />
                      </div>
                      <div className="mt-3 text-sm font-semibold">{s.title}</div>
                      <div className="text-text-muted mt-1 text-xs leading-relaxed">
                        {s.desc}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="mt-2">
              <div className="text-text-faint text-[11.5px] font-semibold tracking-wider uppercase">
                Alertas pedagógicos
              </div>
              <Card className="mt-2 p-0">
                {alerts.length === 0 && (
                  <div className="text-text-muted p-4 text-sm">
                    Nenhum alerta pedagógico ativo para as turmas vinculadas.
                  </div>
                )}
                {alerts.map((a) => {
                  const tone =
                    a.type === "risk"
                      ? "danger"
                      : a.type === "pending"
                        ? "warning"
                        : "success";
                  const Icon =
                    a.type === "risk"
                      ? AlertTriangle
                      : a.type === "pending"
                        ? AlertTriangle
                        : Trophy;
                  return (
                    <Link
                      key={a.id}
                      href={a.href}
                      className="border-border flex items-start gap-3 p-4 not-last:border-b"
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
                          tone === "danger"
                            ? "bg-danger-soft text-danger"
                            : tone === "warning"
                              ? "bg-warning-soft text-warning"
                              : "bg-success-soft text-success-fg"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">
                            {a.studentName}
                          </span>
                          <Badge
                            tone={
                              a.priority === "alta"
                                ? "danger"
                                : a.priority === "media"
                                  ? "warning"
                                  : "neutral"
                            }
                          >
                            {a.priority}
                          </Badge>
                        </div>
                        <div className="text-text-muted mt-1 text-xs">
                          {a.reason}
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className="text-text-faint mt-2 shrink-0"
                      />
                    </Link>
                  );
                })}
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="text-text-faint text-[11.5px] font-semibold tracking-wider uppercase">
              Destaques da turma
            </div>
            <Card className="p-4">
              <div className="text-sm font-semibold">
                {ctx.classes[0]?.name ?? "—"} · {tenant.short}
              </div>
              <div className="text-text-muted mt-0.5 text-xs">
                {kpis.studentsTotal} alunos · top 3 por proficiência
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {top.length === 0 && (
                  <div className="text-text-faint text-xs">
                    Ainda sem dados de proficiência.
                  </div>
                )}
                {top.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <div className="bg-primary-soft text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                      {s.initials}
                    </div>
                    <span className="flex-1 truncate">{s.name}</span>
                    <ProfBadge value={scoreToProficiency(s.avgScore)} />
                  </div>
                ))}
              </div>
              <Link href="/professor/turma">
                <Button variant="ghost" size="sm" className="mt-3 w-full">
                  Ver toda a turma
                  <ArrowRight size={12} />
                </Button>
              </Link>
            </Card>

            <Card className="bg-primary-soft border-primary-border p-4">
              <div className="text-primary text-[11.5px] font-semibold tracking-wider uppercase">
                Estado das telas
              </div>
              <p className="text-primary mt-1 text-sm leading-relaxed">
                KPIs, destaques, alertas e ferramentas de IA já usam dados ou
                rotas reais. A agenda de aulas ainda depende de integração
                própria.
              </p>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
