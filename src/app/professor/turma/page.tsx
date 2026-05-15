import Link from "next/link";
import { ArrowRight, Filter } from "lucide-react";
import { Button, Card, ProfBadge } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { requireRole } from "@/lib/auth/session";
import { getCurrentTenant } from "@/lib/tenants/server";
import {
  loadTeacherContext,
  loadClassHeatmap,
  loadClassRoster,
  scoreToProficiency,
} from "@/lib/teacher/queries";

function heatColor(score: number) {
  if (score >= 0.85) return "var(--prof-advanced)";
  if (score >= 0.7) return "var(--prof-adequate)";
  if (score >= 0.5) return "var(--prof-basic)";
  return "var(--prof-insufficient)";
}

function formatLastActivity(d: Date | null): string {
  if (!d) return "nunca";
  const diffMs = Date.now() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "há poucos min";
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "ontem";
  if (diffD < 7) return `há ${diffD} dias`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function TurmaPage() {
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
  const classId = ctx.classIds[0];

  if (!classId) {
    return (
      <>
        <PageHeader title="Turma" subtitle="Sem turma atribuída ainda" />
        <PageBody>
          <Card className="p-8 text-center">
            <p className="text-text-muted text-sm">
              Você ainda não está vinculado a nenhuma turma nesse tenant.
            </p>
          </Card>
        </PageBody>
      </>
    );
  }

  const cls = ctx.classes[0]!;
  const [heatmap, roster] = await Promise.all([
    loadClassHeatmap({ tenantId: tenant.id, classId }),
    loadClassRoster({ tenantId: tenant.id, classId }),
  ]);

  const total = roster.length;
  const engaged = roster.filter((r) => r.conversationCount > 0).length;
  const atRisk = roster.filter((r) => r.avgScore < 0.45);
  const avgClass =
    total === 0 ? 0 : roster.reduce((s, r) => s + r.avgScore, 0) / total;

  const KPIS = [
    { label: "Alunos", value: total.toString(), sub: "matrículas ativas" },
    {
      label: "Engajados",
      value: engaged.toString(),
      sub: "≥1 conversa registrada",
    },
    {
      label: "Em risco",
      value: atRisk.length.toString(),
      sub:
        atRisk.length === 0
          ? "ninguém em risco"
          : atRisk
              .slice(0, 2)
              .map((a) => a.fullName.split(" ")[0])
              .join(" · "),
    },
    {
      label: "Proficiência média",
      value: scoreToProficiency(avgClass).replace(/^./, (c) => c.toUpperCase()),
      sub: `${(avgClass * 100).toFixed(0)}% no agregado`,
    },
  ];

  return (
    <>
      <PageHeader
        title={`${cls.name} · ${cls.schoolName}`}
        subtitle={`${tenant.short} · ${total} alunos · proficiência por aluno × habilidade BNCC`}
        actions={
          <>
            <Button variant="secondary" icon={<Filter size={14} />}>
              Filtros
            </Button>
            <Button>Mensagem para a turma</Button>
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
              <div className="mt-1.5 text-[26px] leading-none font-semibold tracking-tight">
                {k.value}
              </div>
              <div className="text-text-muted mt-1 truncate text-xs">
                {k.sub}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-0">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div>
              <div className="text-sm font-semibold">
                Heatmap · habilidade × aluno
              </div>
              <div className="text-text-muted mt-0.5 text-xs">
                Verde = avançado · vermelho = insuficiente
              </div>
            </div>
            <div className="text-text-faint flex items-center gap-4 text-[11px]">
              {[
                { l: "Avançado", c: "var(--prof-advanced)" },
                { l: "Adequado", c: "var(--prof-adequate)" },
                { l: "Básico", c: "var(--prof-basic)" },
                { l: "Insuficiente", c: "var(--prof-insufficient)" },
              ].map((l) => (
                <span key={l.l} className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-sm"
                    style={{ background: l.c }}
                  />
                  {l.l}
                </span>
              ))}
            </div>
          </div>
          {heatmap.rows.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-muted text-sm">
                Sem dados de proficiência ainda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table
                className="border-separate border-spacing-1 text-xs"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <thead>
                  <tr>
                    <th className="text-text-faint w-32 pr-2 text-left text-[10px]">
                      Aluno
                    </th>
                    {heatmap.habilities.map((h) => (
                      <th
                        key={h.code}
                        className="text-text-faint min-w-[72px] px-1 text-center text-[10px]"
                        title={h.description}
                      >
                        {h.code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.rows.map((row) => (
                    <tr key={row.studentId}>
                      <td className="pr-2 text-[11px]">
                        {row.studentName.split(" ").slice(0, 2).join(" ")}
                      </td>
                      {row.cells.map((c) => (
                        <td key={c.habilityCode}>
                          <div
                            className="grid h-8 place-items-center rounded text-[10px] text-white"
                            style={{ background: heatColor(c.score) }}
                            title={`${row.studentName} · ${c.habilityCode} · ${(c.score * 100).toFixed(0)}%`}
                          >
                            {(c.score * 100).toFixed(0)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-0">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div className="text-sm font-semibold">Lista de alunos</div>
            <div className="text-text-muted text-xs">
              Ordenado por proficiência
            </div>
          </div>
          {roster.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-muted text-sm">
                Nenhum aluno seedado nessa turma.
              </p>
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {["Aluno", "Proficiência", "Conversas", "Último acesso", ""].map(
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
                {roster.map((r) => (
                  <tr key={r.studentId} className="hover:bg-surface-2">
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-soft text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                          {r.initials}
                        </div>
                        <span>{r.fullName}</span>
                      </div>
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <ProfBadge value={r.proficiency} />
                    </td>
                    <td
                      className="border-border h-11 border-b px-4 align-middle text-xs"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {r.conversationCount}
                    </td>
                    <td className="border-border text-text-muted h-11 border-b px-4 align-middle text-xs">
                      {formatLastActivity(r.lastActivity)}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <Link href="/professor/alunos">
                        <Button variant="ghost" size="sm">
                          Perfil
                          <ArrowRight size={12} />
                        </Button>
                      </Link>
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
