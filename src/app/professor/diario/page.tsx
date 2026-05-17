import { Calendar, Plus } from "lucide-react";
import { Badge, Button, Card, ProfBadge } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { requireRole } from "@/lib/auth/session";
import { getCurrentTenant } from "@/lib/tenants/server";
import {
  loadClassRoster,
  loadTeacherContext,
  scoreToProficiency,
} from "@/lib/teacher/queries";
import { loadClassFocus, loadClassMaterials } from "@/lib/teacher/material-queries";
import {
  loadDiaryEntries,
  saveDiaryDraft,
  signDiaryEntry,
} from "@/lib/teacher/diary";

function todayLabel(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export default async function DiarioPage() {
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
        <PageHeader title="Diario pedagogico" subtitle="Sem turma atribuida ainda" />
        <PageBody>
          <Card className="p-8 text-center">
            <p className="text-text-muted text-sm">
              Voce ainda nao esta vinculado a nenhuma turma nesse tenant.
            </p>
          </Card>
        </PageBody>
      </>
    );
  }

  const cls = ctx.classes[0]!;
  const [roster, focus, materials, diaryEntries] = await Promise.all([
    loadClassRoster({ tenantId: tenant.id, classId }),
    loadClassFocus({ tenantId: tenant.id, classId }),
    loadClassMaterials({ tenantId: tenant.id, classId }),
    loadDiaryEntries({ tenantId: tenant.id, classId, limit: 6 }),
  ]);
  const total = roster.length;
  const engaged = roster.filter((student) => student.conversationCount > 0);
  const atRisk = roster.filter((student) => student.avgScore < 0.45);
  const avgScore =
    total === 0
      ? 0
      : roster.reduce((sum, student) => sum + student.avgScore, 0) / total;
  const focusCodes = focus.map((item) => item.code);
  const focusAreas = [...new Set(focus.map((item) => item.area))];
  const readyMaterials = materials.filter((material) => material.status === "ready");
  const topic =
    focus[0]?.description ??
    (focusAreas.length > 0
      ? `Retomada de ${focusAreas.join(", ")}`
      : "Acompanhamento da turma");
  const riskNames = atRisk.slice(0, 3).map((student) => firstName(student.fullName));
  const draftSummary = [
    `A turma apresenta proficiencia media de ${Math.round(avgScore * 100)}%.`,
    engaged.length > 0
      ? `${engaged.length} alunos tiveram interacao registrada com a tutora.`
      : "Ainda nao ha interacoes suficientes registradas com a tutora.",
    atRisk.length > 0
      ? `Recomenda-se acompanhamento de ${riskNames.join(", ")}.`
      : "Nao ha aluno abaixo de 45% de proficiencia no recorte atual.",
  ].join(" ");
  const draftContent = {
    topic,
    className: cls.name,
    schoolName: cls.schoolName,
    focusCodes,
    focusAreas,
    avgScore,
    studentsTotal: total,
    engagedCount: engaged.length,
    atRiskStudents: atRisk.slice(0, 5).map((student) => ({
      id: student.studentId,
      name: student.fullName,
      avgScore: student.avgScore,
    })),
    readyMaterials: readyMaterials.slice(0, 5).map((material) => ({
      id: material.id,
      name: material.name,
      type: material.type,
    })),
  };

  return (
    <>
      <PageHeader
        title="Diario pedagogico"
        subtitle={`${cls.name} - ${cls.schoolName} - registro auditavel a partir dos dados da tutora`}
        actions={
          <>
            <Button variant="secondary" icon={<Calendar size={14} />}>
              Esta semana
            </Button>
            <form action={saveDiaryDraft}>
              <input type="hidden" name="classId" value={classId} />
              <input type="hidden" name="title" value={topic} />
              <input type="hidden" name="summary" value={draftSummary} />
              <input
                type="hidden"
                name="content"
                value={JSON.stringify(draftContent)}
              />
              <Button icon={<Plus size={14} />}>Salvar entrada</Button>
            </form>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Alunos", value: total.toString(), sub: "na turma" },
            {
              label: "Engajados",
              value: engaged.length.toString(),
              sub: "com conversa registrada",
            },
            {
              label: "Em atencao",
              value: atRisk.length.toString(),
              sub: riskNames.join(", ") || "sem alerta por proficiencia",
            },
            {
              label: "Media",
              value: `${Math.round(avgScore * 100)}%`,
              sub: scoreToProficiency(avgScore),
            },
          ].map((item) => (
            <Card key={item.label} className="p-4">
              <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
                {item.label}
              </div>
              <div className="mt-1.5 text-[26px] leading-none font-semibold tracking-tight">
                {item.value}
              </div>
              <div className="text-text-muted mt-1 truncate text-xs">
                {item.sub}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-0">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div>
              <div className="text-sm font-semibold">Rascunho de hoje</div>
              <div className="text-text-muted mt-0.5 text-xs">
                {todayLabel()} - baseado em foco BNCC, proficiencia e uso da tutora
              </div>
            </div>
            <Badge tone="warning">revisar antes de salvar</Badge>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{cls.name}</Badge>
              {focusAreas.map((area) => (
                <Badge key={area} tone="neutral">
                  {area}
                </Badge>
              ))}
              {focusCodes.map((code) => (
                <span
                  key={code}
                  className="bg-surface-2 text-text-muted rounded px-1.5 py-0.5 text-[10.5px]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {code}
                </span>
              ))}
            </div>
            <h3 className="mt-4 text-sm font-semibold">{topic}</h3>
            <p className="text-text-muted mt-2 text-[13px] leading-relaxed">
              {draftSummary}
            </p>
            <p className="text-text-muted mt-2 text-[13px] leading-relaxed">
              Encaminhamento sugerido: retomar a habilidade foco com uma
              atividade curta, pedir que os alunos expliquem o raciocinio em voz
              alta e orientar o uso da tutora como apoio apos a aula.
            </p>
          </div>
        </Card>

        <Card className="p-0">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <div>
              <div className="text-sm font-semibold">Entradas salvas</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Rascunhos e registros assinados desta turma
              </div>
            </div>
            <Badge tone={diaryEntries.length > 0 ? "success" : "neutral"}>
              {diaryEntries.length} registros
            </Badge>
          </div>
          {diaryEntries.length === 0 ? (
            <div className="p-6 text-sm text-text-muted">
              Ainda nao ha diario salvo para esta turma. Use Salvar entrada
              para transformar o rascunho atual em registro auditavel.
            </div>
          ) : (
            <div className="flex flex-col">
              {diaryEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="border-border flex items-start gap-4 px-6 py-4 not-last:border-b"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{entry.title}</span>
                      <Badge tone={entry.status === "signed" ? "success" : "warning"}>
                        {entry.status === "signed" ? "assinado" : "rascunho"}
                      </Badge>
                    </div>
                    <div className="text-text-faint mt-1 text-[11px]">
                      {entry.entryDate.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                    {entry.summary && (
                      <p className="text-text-muted mt-2 text-[13px] leading-relaxed">
                        {entry.summary}
                      </p>
                    )}
                  </div>
                  {entry.status !== "signed" && (
                    <form action={signDiaryEntry}>
                      <input type="hidden" name="entryId" value={entry.id} />
                      <Button variant="secondary" size="sm">
                        Assinar
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="p-0">
            <div className="border-border border-b px-6 py-4">
              <div className="text-sm font-semibold">Alunos para observar</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Ordenado pelos menores scores
              </div>
            </div>
            {atRisk.length === 0 ? (
              <div className="p-6 text-sm text-text-muted">
                Nenhum aluno abaixo do corte de atencao nesta turma.
              </div>
            ) : (
              <div className="flex flex-col">
                {atRisk.slice(0, 5).map((student) => (
                  <div
                    key={student.studentId}
                    className="border-border flex items-center gap-3 px-6 py-3 not-last:border-b"
                  >
                    <div className="bg-primary-soft text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                      {student.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm">{student.fullName}</div>
                      <div className="text-text-faint text-[11px]">
                        {student.conversationCount} conversas registradas
                      </div>
                    </div>
                    <ProfBadge value={student.proficiency} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-0">
            <div className="border-border border-b px-6 py-4">
              <div className="text-sm font-semibold">Materiais conectados</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Fontes que podem apoiar a proxima aula
              </div>
            </div>
            {readyMaterials.length === 0 ? (
              <div className="p-6 text-sm text-text-muted">
                Ainda nao ha material pronto para esta turma.
              </div>
            ) : (
              <div className="flex flex-col">
                {readyMaterials.slice(0, 5).map((material) => (
                  <div
                    key={material.id}
                    className="border-border flex items-center gap-3 px-6 py-3 not-last:border-b"
                  >
                    <Badge tone="success">pronto</Badge>
                    <div className="min-w-0 flex-1 truncate text-sm">
                      {material.name}
                    </div>
                    <span className="text-text-faint text-[11px] uppercase">
                      {material.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="bg-primary-soft border-primary-border p-4">
          <div className="text-primary text-[11.5px] font-semibold tracking-wider uppercase">
            Diario persistido
          </div>
          <p className="text-primary mt-1 text-sm leading-relaxed">
            O rascunho deriva de dados reais da turma e agora pode ser salvo em
            `pedagogical_diary_entries`, assinado e registrado em `audit_log`.
          </p>
        </Card>
      </PageBody>
    </>
  );
}
