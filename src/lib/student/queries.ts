/**
 * Queries do contexto do Aluno (server-only).
 *
 * As telas do aluno devem ler dados reais quando o banco existe e cair em
 * fallback seguro quando alguma tabela ainda não foi aplicada em produção.
 */

import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNull,
  lte,
  or,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  auditLog,
  classes,
  consentLog,
  habilities,
  schools,
  studentAnnouncementReads,
  studentAnnouncements,
  studentProficiency,
  students,
} from "@/lib/db/schema";
import { ensureNetworkSeeded } from "@/lib/db/seed-network";
import { resolveStudentId } from "@/lib/db/student-resolver";
import { COMUNICADOS, TRILHA } from "@/lib/mocks";
import { allowsMockFallbacks } from "@/lib/runtime/mode";

const DEMO_TENANT_ID = "alfenas";
const DEMO_USER_ID = "u-joao";
const DEMO_SCHOOL_ID = "school-demo-alfenas";
const DEMO_CLASS_ID = "class-demo-7a";

function dbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export type A11yMode = "none" | "easy-read" | "dyslexia" | "tdah";

export interface StudentContext {
  source: "db" | "fallback";
  studentId: string | null;
  fullName: string;
  nickname: string;
  schoolId: string | null;
  schoolName: string;
  classId: string | null;
  className: string;
  grade: string;
  a11yMode: A11yMode;
  hasActiveConsent: boolean;
  guardianName: string | null;
  consentedAt: Date | null;
}

export interface LearningArea {
  area: string;
  mastered: number;
  total: number;
  percent: number;
  averageScore: number;
  current: string;
  next: string;
  color: string;
}

export interface LearningPath {
  source: "db" | "fallback";
  mastered: number;
  total: number;
  percent: number;
  nextArea: string;
  nextSkill: string;
  nextHint: string;
  achievementTitle: string;
  achievementBody: string;
  areas: LearningArea[];
}

export interface StudentAnnouncement {
  id: string;
  origin: "secretaria" | "escola" | "turma";
  originLabel: string;
  title: string;
  body: string;
  authorName: string;
  priority: "alta" | "media" | "baixa";
  requiresConfirmation: boolean;
  publishedLabel: string;
  read: boolean;
  confirmed: boolean;
}

export async function loadStudentContext(input: {
  userId: string;
  tenantId: string;
}): Promise<StudentContext> {
  if (!dbAvailable()) return safeStudentContext();

  try {
    await ensureNetworkSeeded();
    const studentId = await resolveStudentId(input);
    if (!studentId) return safeStudentContext(input);

    const [student] = await db()
      .select({
        id: students.id,
        fullName: students.fullName,
        nickname: students.nickname,
        schoolId: students.schoolId,
        schoolName: schools.name,
        classId: students.classId,
        className: classes.name,
        grade: classes.grade,
        a11yMode: students.a11yMode,
      })
      .from(students)
      .innerJoin(schools, eq(schools.id, students.schoolId))
      .innerJoin(classes, eq(classes.id, students.classId))
      .where(and(eq(students.id, studentId), eq(students.tenantId, input.tenantId)))
      .limit(1);

    if (!student) return safeStudentContext(input);

    const [consent] = await db()
      .select({
        guardianName: consentLog.guardianName,
        consentedAt: consentLog.consentedAt,
      })
      .from(consentLog)
      .where(
        and(
          eq(consentLog.tenantId, input.tenantId),
          eq(consentLog.studentId, student.id),
          isNull(consentLog.revokedAt),
        ),
      )
      .orderBy(desc(consentLog.consentedAt))
      .limit(1);

    return {
      source: "db",
      studentId: student.id,
      fullName: student.fullName,
      nickname: student.nickname ?? firstName(student.fullName),
      schoolId: student.schoolId,
      schoolName: student.schoolName,
      classId: student.classId,
      className: student.className,
      grade: student.grade,
      a11yMode: normalizeA11yMode(student.a11yMode),
      hasActiveConsent: !!consent,
      guardianName: consent?.guardianName ?? null,
      consentedAt: consent?.consentedAt ?? null,
    };
  } catch (err) {
    console.error("[student/queries] loadStudentContext failed:", err);
    return safeStudentContext(input);
  }
}

export async function loadStudentLearningPath(input: {
  userId: string;
  tenantId: string;
}): Promise<LearningPath> {
  if (!dbAvailable()) return safeLearningPath();

  try {
    await ensureNetworkSeeded();
    const studentId = await resolveStudentId(input);
    if (!studentId) return safeLearningPath();

    const rows = await db()
      .select({
        area: habilities.area,
        code: habilities.code,
        description: habilities.description,
        score: studentProficiency.score,
        level: studentProficiency.level,
      })
      .from(studentProficiency)
      .innerJoin(habilities, eq(habilities.code, studentProficiency.habilityCode))
      .where(
        and(
          eq(studentProficiency.tenantId, input.tenantId),
          eq(studentProficiency.studentId, studentId),
        ),
      )
      .orderBy(asc(habilities.area), asc(studentProficiency.habilityCode));

    if (rows.length === 0) return safeLearningPath();

    const areas = new Map<string, typeof rows>();
    for (const row of rows) {
      const bucket = areas.get(row.area) ?? [];
      bucket.push(row);
      areas.set(row.area, bucket);
    }

    const mappedAreas = Array.from(areas.entries()).map(([area, skills]) => {
      const total = skills.length;
      const mastered = skills.filter((s) => isMastered(s.score, s.level)).length;
      const averageScore =
        total === 0
          ? 0
          : skills.reduce((sum, skill) => sum + skill.score, 0) / total;
      const currentSkill = pickCurrentSkill(skills);
      const nextSkill = pickNextSkill(skills, currentSkill?.code);

      return {
        area,
        mastered,
        total,
        percent: total === 0 ? 0 : Math.round((mastered / total) * 100),
        averageScore,
        current: currentSkill?.description ?? "Revisão orientada",
        next: nextSkill?.description ?? "Consolidar o que já apareceu",
        color: proficiencyColor(averageScore),
      };
    });

    const total = rows.length;
    const mastered = rows.filter((s) => isMastered(s.score, s.level)).length;
    const next = pickCurrentSkill(rows);
    const strongest = [...rows].sort((a, b) => b.score - a.score)[0];

    return {
      source: "db",
      mastered,
      total,
      percent: total === 0 ? 0 : Math.round((mastered / total) * 100),
      nextArea: next?.area ?? mappedAreas[0]?.area ?? "Estudo guiado",
      nextSkill: next?.description ?? "Revisar uma habilidade do bimestre",
      nextHint: `${next?.area ?? "Trilha"} - 3 atividades curtas para consolidar`,
      achievementTitle: strongest
        ? `Você está mais forte em ${strongest.area}`
        : "Você já começou sua trilha",
      achievementBody: strongest
        ? `A habilidade ${strongest.code} aparece como seu ponto mais consistente.`
        : "Continue conversando com a tutora para alimentar sua trilha.",
      areas: mappedAreas,
    };
  } catch (err) {
    console.error("[student/queries] loadStudentLearningPath failed:", err);
    return safeLearningPath();
  }
}

export async function loadStudentAnnouncements(input: {
  userId: string;
  tenantId: string;
  filter?: string;
}): Promise<StudentAnnouncement[]> {
  if (!dbAvailable()) return safeAnnouncements(input.filter);

  try {
    await ensureNetworkSeeded();
    await ensureDemoAnnouncements(input.tenantId);

    const context = await loadStudentContext(input);
    if (!context.studentId) return safeAnnouncements(input.filter);

    const now = new Date();
    const rows = await db()
      .select({
        id: studentAnnouncements.id,
        origin: studentAnnouncements.origin,
        title: studentAnnouncements.title,
        body: studentAnnouncements.body,
        authorName: studentAnnouncements.authorName,
        priority: studentAnnouncements.priority,
        requiresConfirmation: studentAnnouncements.requiresConfirmation,
        publishedAt: studentAnnouncements.publishedAt,
        readAt: studentAnnouncementReads.readAt,
        confirmedAt: studentAnnouncementReads.confirmedAt,
      })
      .from(studentAnnouncements)
      .leftJoin(
        studentAnnouncementReads,
        and(
          eq(studentAnnouncementReads.announcementId, studentAnnouncements.id),
          eq(studentAnnouncementReads.studentId, context.studentId),
        ),
      )
      .where(
        and(
          eq(studentAnnouncements.tenantId, input.tenantId),
          or(isNull(studentAnnouncements.schoolId), eq(studentAnnouncements.schoolId, context.schoolId ?? "")),
          or(isNull(studentAnnouncements.classId), eq(studentAnnouncements.classId, context.classId ?? "")),
          lte(studentAnnouncements.publishedAt, now),
          or(isNull(studentAnnouncements.expiresAt), gte(studentAnnouncements.expiresAt, now)),
        ),
      )
      .orderBy(desc(studentAnnouncements.publishedAt));

    const announcements = rows.map((row) => ({
      id: row.id,
      origin: normalizeOrigin(row.origin),
      originLabel: originLabel(row.origin, context.className),
      title: row.title,
      body: row.body,
      authorName: row.authorName,
      priority: normalizePriority(row.priority),
      requiresConfirmation: row.requiresConfirmation,
      publishedLabel: formatShortDate(row.publishedAt),
      read: !!row.readAt,
      confirmed: !!row.confirmedAt,
    }));

    return filterAnnouncements(announcements, input.filter);
  } catch (err) {
    console.error("[student/queries] loadStudentAnnouncements failed:", err);
    const readState = await loadFallbackReadState(input);
    return safeAnnouncements(input.filter, readState);
  }
}

function safeStudentContext(input?: {
  userId: string;
  tenantId: string;
}): StudentContext {
  return allowsMockFallbacks()
    ? fallbackStudentContext(input)
    : emptyStudentContext();
}

function safeLearningPath(): LearningPath {
  return allowsMockFallbacks() ? fallbackLearningPath() : emptyLearningPath();
}

function safeAnnouncements(
  filter?: string,
  readState?: Map<string, { read: boolean; confirmed: boolean }>,
): StudentAnnouncement[] {
  return allowsMockFallbacks()
    ? fallbackAnnouncements(filter, readState)
    : filterAnnouncements([], filter);
}

function fallbackStudentContext(input?: {
  userId: string;
  tenantId: string;
}): StudentContext {
  const isDemo = input?.userId === DEMO_USER_ID || !input;
  return {
    source: "fallback",
    studentId: isDemo ? "student-joao" : null,
    fullName: "Joao Pedro Silva",
    nickname: "Joao",
    schoolId: isDemo ? DEMO_SCHOOL_ID : null,
    schoolName: "EM Padre Eustáquio",
    classId: isDemo ? DEMO_CLASS_ID : null,
    className: "7º A",
    grade: "7",
    a11yMode: "none",
    hasActiveConsent: false,
    guardianName: null,
    consentedAt: null,
  };
}

function emptyStudentContext(): StudentContext {
  return {
    source: "fallback",
    studentId: null,
    fullName: "Aluno",
    nickname: "Aluno",
    schoolId: null,
    schoolName: "Sem escola vinculada",
    classId: null,
    className: "Sem turma vinculada",
    grade: "-",
    a11yMode: "none",
    hasActiveConsent: false,
    guardianName: null,
    consentedAt: null,
  };
}

function fallbackLearningPath(): LearningPath {
  const areas = TRILHA.map((item) => ({
    area: item.area,
    mastered: item.dominado,
    total: item.total,
    percent: Math.round((item.dominado / item.total) * 100),
    averageScore: item.dominado / item.total,
    current: item.atual,
    next: item.proximo,
    color: item.cor,
  }));
  const mastered = areas.reduce((sum, item) => sum + item.mastered, 0);
  const total = areas.reduce((sum, item) => sum + item.total, 0);
  const next = areas.sort((a, b) => a.percent - b.percent)[0];

  return {
    source: "fallback",
    mastered,
    total,
    percent: total === 0 ? 0 : Math.round((mastered / total) * 100),
    nextArea: next?.area ?? "Matemática",
    nextSkill: next?.next ?? "Razão e proporção",
    nextHint: `${next?.area ?? "Matemática"} - 3 atividades curtas para dominar`,
    achievementTitle: "Você dominou frações",
    achievementBody:
      "A trilha mostra um bom avanço em habilidades matemáticas do bimestre.",
    areas,
  };
}

function emptyLearningPath(): LearningPath {
  return {
    source: "fallback",
    mastered: 0,
    total: 0,
    percent: 0,
    nextArea: "Trilha indisponivel",
    nextSkill: "Aguardando dados pedagogicos",
    nextHint: "Assim que a turma tiver habilidades cadastradas, a trilha aparece aqui.",
    achievementTitle: "Dados em preparacao",
    achievementBody:
      "Ainda nao ha proficiencias vinculadas a este aluno em producao.",
    areas: [],
  };
}

function fallbackAnnouncements(
  filter?: string,
  readState: Map<string, { read: boolean; confirmed: boolean }> = new Map(),
): StudentAnnouncement[] {
  const items = COMUNICADOS.map((item) => {
    const origin =
      item.origem === "Secretaria"
        ? "secretaria"
        : item.origem === "Escola"
          ? "escola"
          : "turma";
    const state = readState.get(item.id);
    return {
      id: item.id,
      origin,
      originLabel: item.origem,
      title: item.titulo,
      body: "Comunicado importado do mural da escola para leitura do aluno.",
      authorName: item.autor,
      priority: item.prioridade,
      requiresConfirmation: item.prioridade === "alta",
      publishedLabel: item.data,
      read: state?.read ?? item.lido,
      confirmed: state?.confirmed ?? (item.lido && item.prioridade === "alta"),
    } satisfies StudentAnnouncement;
  });
  return filterAnnouncements(items, filter);
}

async function loadFallbackReadState(input: {
  userId: string;
  tenantId: string;
}): Promise<Map<string, { read: boolean; confirmed: boolean }>> {
  const state = new Map<string, { read: boolean; confirmed: boolean }>();
  if (!dbAvailable()) return state;

  try {
    const rows = await db()
      .select({
        targetId: auditLog.targetId,
        metadata: auditLog.metadata,
      })
      .from(auditLog)
      .where(
        and(
          eq(auditLog.tenantId, input.tenantId),
          eq(auditLog.actorUserId, input.userId),
          eq(auditLog.action, "student.announcement.read"),
        ),
      );

    for (const row of rows) {
      if (!row.targetId) continue;
      state.set(row.targetId, {
        read: true,
        confirmed: row.metadata?.confirmed === true,
      });
    }
  } catch (err) {
    console.warn("[student/queries] fallback announcement reads failed:", err);
  }

  return state;
}

async function ensureDemoAnnouncements(tenantId: string): Promise<void> {
  if (!allowsMockFallbacks()) return;
  if (tenantId !== DEMO_TENANT_ID) return;

  await db()
    .insert(studentAnnouncements)
    .values([
      {
        id: "ann-demo-reuniao-pais",
        tenantId,
        schoolId: DEMO_SCHOOL_ID,
        classId: null,
        origin: "escola",
        title: "Reunião de responsáveis no sábado às 9h",
        body:
          "A escola fará uma conversa com responsáveis sobre frequência, aprendizagem e combinados do bimestre.",
        authorName: "Coordenação pedagógica",
        priority: "alta",
        requiresConfirmation: true,
        publishedAt: daysAgo(2),
      },
      {
        id: "ann-demo-provas-bimestre",
        tenantId,
        schoolId: DEMO_SCHOOL_ID,
        classId: DEMO_CLASS_ID,
        origin: "turma",
        title: "Cronograma de estudos do 2º bimestre",
        body:
          "Matemática terá revisão de frações e proporcionalidade. Língua Portuguesa terá leitura de texto argumentativo.",
        authorName: "Prof. Ricardo",
        priority: "media",
        requiresConfirmation: false,
        publishedAt: daysAgo(4),
      },
      {
        id: "ann-demo-campanha-agasalho",
        tenantId,
        schoolId: null,
        classId: null,
        origin: "secretaria",
        title: "Campanha do agasalho da rede municipal",
        body:
          "A rede está recebendo doações de agasalhos limpos na secretaria da escola até sexta-feira.",
        authorName: "SEMED Alfenas",
        priority: "baixa",
        requiresConfirmation: false,
        publishedAt: daysAgo(7),
      },
    ])
    .onConflictDoNothing();
}

function normalizeA11yMode(mode: string | null): A11yMode {
  if (mode === "easy-read" || mode === "dyslexia" || mode === "tdah") {
    return mode;
  }
  return "none";
}

function normalizeOrigin(origin: string): StudentAnnouncement["origin"] {
  if (origin === "secretaria" || origin === "escola" || origin === "turma") {
    return origin;
  }
  return "escola";
}

function normalizePriority(priority: string): StudentAnnouncement["priority"] {
  if (priority === "alta" || priority === "baixa") return priority;
  return "media";
}

function originLabel(origin: string, className: string): string {
  if (origin === "secretaria") return "Secretaria";
  if (origin === "turma") return `Turma ${className}`;
  return "Escola";
}

function filterAnnouncements(
  items: StudentAnnouncement[],
  filter?: string,
): StudentAnnouncement[] {
  if (!filter || filter === "tudo") return items;
  return items.filter((item) => item.origin === filter);
}

function isMastered(score: number, level: string): boolean {
  return score >= 0.68 || level === "adequada" || level === "avancada";
}

function pickCurrentSkill<T extends { code: string; score: number }>(
  skills: T[],
): T | undefined {
  return [...skills].sort((a, b) => a.score - b.score)[0];
}

function pickNextSkill<T extends { code: string; score: number }>(
  skills: T[],
  currentCode?: string,
): T | undefined {
  return [...skills]
    .filter((skill) => skill.code !== currentCode)
    .sort((a, b) => a.score - b.score)[0];
}

function proficiencyColor(score: number): string {
  if (score >= 0.8) return "var(--prof-advanced)";
  if (score >= 0.65) return "var(--prof-adequate)";
  if (score >= 0.45) return "var(--prof-basic)";
  return "var(--prof-insufficient)";
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
