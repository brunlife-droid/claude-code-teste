import Link from "next/link";
import {
  BookOpen,
  Clock3,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Avatar, Badge, Button, Card, ProfBadge } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { requireRole } from "@/lib/auth/session";
import { getCurrentTenant } from "@/lib/tenants/server";
import {
  loadClassRoster,
  loadStudentProfile,
  loadTeacherContext,
  type StudentProfile,
} from "@/lib/teacher/queries";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

function formatAge(date: Date | null): string {
  if (!date) return "não informada";
  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const beforeBirthday =
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
  if (beforeBirthday) years -= 1;
  return `${years} anos`;
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

function a11yLabel(mode: string | null): string {
  if (!mode) return "padrão";
  const labels: Record<string, string> = {
    "easy-read": "leitura facilitada",
    dyslexia: "apoio para dislexia",
    tdah: "apoio para TDAH",
  };
  return labels[mode] ?? mode;
}

function percent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

function areaSummaries(profile: StudentProfile) {
  const groups = new Map<
    string,
    {
      area: string;
      total: number;
      mastered: number;
      scoreSum: number;
      weakest: string;
      weakestScore: number;
    }
  >();
  for (const skill of profile.skills) {
    const current = groups.get(skill.area) ?? {
      area: skill.area,
      total: 0,
      mastered: 0,
      scoreSum: 0,
      weakest: skill.description,
      weakestScore: skill.score,
    };
    current.total += 1;
    current.mastered += skill.score >= 0.6 ? 1 : 0;
    current.scoreSum += skill.score;
    if (skill.score < current.weakestScore) {
      current.weakest = skill.description;
      current.weakestScore = skill.score;
    }
    groups.set(skill.area, current);
  }

  return [...groups.values()].map((group) => ({
    ...group,
    avgScore: group.total === 0 ? 0 : group.scoreSum / group.total,
  }));
}

export default async function AlunosPage({ searchParams }: PageProps) {
  const user = await requireRole(
    "professor",
    "coordenador",
    "diretor",
    "orientador",
  );
  const tenant = await getCurrentTenant();
  const params = await searchParams;
  const ctx = await loadTeacherContext({
    userId: user.id,
    tenantId: tenant.id,
  });
  const classId = ctx.classIds[0];

  if (!classId) {
    return (
      <>
        <PageHeader title="Perfil do aluno" subtitle="Sem turma atribuída ainda" />
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

  const [roster, profile] = await Promise.all([
    loadClassRoster({ tenantId: tenant.id, classId }),
    loadStudentProfile({
      tenantId: tenant.id,
      classIds: ctx.classIds,
      studentId: params.id,
    }),
  ]);

  if (!profile) {
    return (
      <>
        <PageHeader title="Perfil do aluno" subtitle="Aluno não encontrado" />
        <PageBody>
          <Card className="p-8 text-center">
            <p className="text-text-muted text-sm">
              Não encontramos esse aluno nas suas turmas.
            </p>
            <Link href="/professor/turma" className="mt-4 inline-flex">
              <Button variant="secondary">Voltar para turma</Button>
            </Link>
          </Card>
        </PageBody>
      </>
    );
  }

  const summaries = areaSummaries(profile);
  const weakestSkills = [...profile.skills]
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);

  return (
    <>
      <PageHeader
        title={profile.fullName}
        subtitle={`${profile.className} · ${profile.schoolName}`}
        actions={
          <>
            <Button variant="secondary" icon={<MessageCircle size={14} />}>
              Mensagem
            </Button>
            <Button variant="secondary" icon={<Phone size={14} />}>
              Contatar responsável
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
          <div className="flex flex-col gap-5">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Avatar name={profile.fullName} size={56} />
                <div className="min-w-0 flex flex-col gap-1">
                  <ProfBadge value={profile.proficiency} />
                  <span className="text-text-muted text-xs">
                    {profile.conversationCount} conversas ·{" "}
                    {formatLastActivity(profile.lastActivity)}
                  </span>
                </div>
              </div>
              <hr className="border-border my-4" />
              <div className="flex flex-col gap-2.5 text-sm">
                <Row k="Idade" v={formatAge(profile.birthDate)} />
                <Row k="Apelido" v={profile.nickname ?? "não informado"} />
                <Row k="Bolsa Família" v={profile.bolsaFamilia ? "Sim" : "Não"} />
                <Row k="Modo a11y" v={a11yLabel(profile.a11yMode)} />
                <Row k="Proficiência média" v={percent(profile.avgScore)} />
              </div>
              <div className="bg-primary-soft text-primary mt-4 rounded-md p-3 text-xs leading-relaxed">
                <b>LGPD:</b> dados sensíveis ficam limitados ao escopo pedagógico.
                Contato do responsável e consentimento ainda não estão integrados.
              </div>
              {profile.notes && (
                <div className="bg-warning-soft text-warning-fg mt-3 rounded-md p-3 text-xs leading-relaxed">
                  <b>Observação:</b> {profile.notes}
                </div>
              )}
            </Card>

            <Card className="p-0">
              <div className="border-border border-b px-4 py-3">
                <div className="text-sm font-semibold">Alunos da turma</div>
                <div className="text-text-muted mt-0.5 text-xs">
                  {ctx.classes[0]?.name ?? "Turma"} · {roster.length} alunos
                </div>
              </div>
              <div className="max-h-[420px] overflow-y-auto p-2">
                {roster.map((student) => {
                  const active = student.studentId === profile.id;
                  return (
                    <Link
                      key={student.studentId}
                      href={`/professor/alunos?id=${student.studentId}`}
                      className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                        active ? "bg-primary-soft text-primary" : "hover:bg-surface-2"
                      }`}
                    >
                      <div className="bg-surface-3 flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                        {student.initials}
                      </div>
                      <span className="min-w-0 flex-1 truncate">
                        {student.fullName}
                      </span>
                      <span className="text-text-faint text-[11px]">
                        {percent(student.avgScore)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card className="p-0">
              <div className="border-border flex items-center justify-between border-b px-6 py-4">
                <div>
                  <div className="text-sm font-semibold">
                    Trilha de aprendizagem
                  </div>
                  <div className="text-text-muted mt-0.5 text-xs">
                    Calculada pelas habilidades BNCC registradas no banco
                  </div>
                </div>
                <Badge tone="primary">{profile.skills.length} habilidades</Badge>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-2">
                {summaries.map((area) => (
                  <div key={area.area} className="bg-surface-2 rounded-md p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{area.area}</span>
                      <span
                        className="text-text-faint text-[11px]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {area.mastered}/{area.total}
                      </span>
                    </div>
                    <div className="bg-surface-3 mt-2 h-1.5 overflow-hidden rounded">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.round(area.avgScore * 100)}%`,
                          background: "var(--primary)",
                        }}
                      />
                    </div>
                    <div className="text-text-muted mt-2 text-xs">
                      Retomar: <b className="text-text">{area.weakest}</b>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <Card className="p-0">
                <div className="border-border border-b px-6 py-4">
                  <div className="text-sm font-semibold">
                    Habilidades que pedem atenção
                  </div>
                  <div className="text-text-muted mt-0.5 text-xs">
                    Menores scores do aluno
                  </div>
                </div>
                <div className="flex flex-col">
                  {weakestSkills.map((skill) => (
                    <div
                      key={skill.code}
                      className="border-border flex items-start gap-3 px-6 py-3.5 not-last:border-b"
                    >
                      <BookOpen
                        size={15}
                        className="text-text-faint mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {skill.code}
                          </span>
                          <ProfBadge value={skill.level} />
                        </div>
                        <p className="text-text-muted mt-1 text-xs leading-relaxed">
                          {skill.description}
                        </p>
                      </div>
                      <span
                        className="text-text-faint text-xs"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {percent(skill.score)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-0">
                <div className="border-border border-b px-6 py-4">
                  <div className="text-sm font-semibold">Últimas conversas</div>
                  <div className="text-text-muted mt-0.5 text-xs">
                    Atividade registrada pela tutora
                  </div>
                </div>
                {profile.recentConversations.length === 0 ? (
                  <div className="p-6 text-sm text-text-muted">
                    Ainda não há conversas persistidas para esse aluno.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {profile.recentConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="border-border flex items-start gap-3 px-6 py-3.5 not-last:border-b"
                      >
                        <Clock3
                          size={15}
                          className="text-text-faint mt-0.5 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge tone="neutral">
                              {conversation.area ?? "Conversa"}
                            </Badge>
                            <span className="text-text-faint text-[11px]">
                              {conversation.channel}
                            </span>
                          </div>
                          <div className="mt-1 truncate text-sm">
                            {conversation.title ?? "(sem título)"}
                          </div>
                          <div className="text-text-faint mt-0.5 text-[11px]">
                            {formatLastActivity(conversation.updatedAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card className="bg-surface-2 border-border p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-primary mt-0.5" />
                <p className="text-text-muted text-sm leading-relaxed">
                  Esta visão é pedagógica: mostra proficiência, engajamento e
                  histórico de aprendizagem. Dados familiares, CPF e saúde
                  socioemocional entram apenas quando houver fluxo consentido e
                  auditado.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-text-muted">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
