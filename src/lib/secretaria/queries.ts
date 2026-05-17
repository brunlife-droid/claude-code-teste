/**
 * Queries da Secretaria: leitura operacional do tenant inteiro.
 *
 * Todas as consultas filtram por tenantId e fazem fallback para vazio quando o
 * banco nao esta disponivel, evitando que tela estrategica invente dado em prod.
 */

import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  classes,
  conversations,
  memberships,
  schools,
  studentAnnouncementReads,
  studentAnnouncements,
  studentProficiency,
  students,
  users,
} from "@/lib/db/schema";
import { ensureNetworkSeeded } from "@/lib/db/seed-network";
import { scoreToProficiency } from "@/lib/teacher/queries";

function dbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export interface NetworkKpis {
  studentsTotal: number;
  studentsEngaged7d: number;
  teachersTotal: number;
  schoolsTotal: number;
  classesTotal: number;
  studentsAtRisk: number;
  avgProficiency: number;
}

export interface SchoolHealth {
  id: string;
  name: string;
  region: string | null;
  studentsTotal: number;
  teachersTotal: number;
  classesTotal: number;
  avgProficiency: number;
  atRiskCount: number;
}

export interface NetworkClassSummary {
  id: string;
  name: string;
  grade: string;
  schoolId: string;
  schoolName: string;
  studentsTotal: number;
  teachersTotal: number;
  avgProficiency: number;
  atRiskCount: number;
}

export interface NetworkStudentSummary {
  id: string;
  fullName: string;
  schoolName: string;
  className: string;
  grade: string;
  avgScore: number;
  conversationCount: number;
  lastActivity: Date | null;
}

export interface NetworkUserSummary {
  id: string;
  name: string;
  email: string | null;
  role: string;
  schoolName: string | null;
  className: string | null;
  createdAt: Date;
}

export interface SecretariaAnnouncementSummary {
  id: string;
  origin: string;
  title: string;
  authorName: string;
  priority: string;
  requiresConfirmation: boolean;
  publishedAt: Date;
  expiresAt: Date | null;
  readCount: number;
}

export async function loadNetworkKpis(input: {
  tenantId: string;
}): Promise<NetworkKpis> {
  if (!dbAvailable()) return emptyKpis();
  try {
    await ensureNetworkSeeded();
    const d = db();
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [studentsRow] = await d
      .select({ n: count() })
      .from(students)
      .where(eq(students.tenantId, input.tenantId));

    const [schoolsRow] = await d
      .select({ n: count() })
      .from(schools)
      .where(eq(schools.tenantId, input.tenantId));

    const [classesRow] = await d
      .select({ n: count() })
      .from(classes)
      .where(eq(classes.tenantId, input.tenantId));

    const [teachersRow] = await d
      .select({ n: count() })
      .from(memberships)
      .where(
        and(
          eq(memberships.tenantId, input.tenantId),
          inArray(memberships.role, [
            "professor",
            "coordenador",
            "diretor",
            "orientador",
          ]),
        ),
      );

    const engagedRows = await d
      .selectDistinct({ studentId: conversations.studentId })
      .from(conversations)
      .where(
        and(
          eq(conversations.tenantId, input.tenantId),
          gte(conversations.updatedAt, since),
        ),
      );

    const riskRows = await d
      .select({ studentId: students.id })
      .from(students)
      .leftJoin(studentProficiency, eq(studentProficiency.studentId, students.id))
      .where(eq(students.tenantId, input.tenantId))
      .groupBy(students.id)
      .having(sql`coalesce(avg(${studentProficiency.score}), 0) < 0.45`);

    const [avgRow] = await d
      .select({
        avg: sql<number>`coalesce(avg(${studentProficiency.score}), 0)`,
      })
      .from(studentProficiency)
      .where(eq(studentProficiency.tenantId, input.tenantId));

    return {
      studentsTotal: studentsRow?.n ?? 0,
      studentsEngaged7d: engagedRows.length,
      teachersTotal: teachersRow?.n ?? 0,
      schoolsTotal: schoolsRow?.n ?? 0,
      classesTotal: classesRow?.n ?? 0,
      studentsAtRisk: riskRows.length,
      avgProficiency: avgRow?.avg ?? 0,
    };
  } catch (err) {
    console.error("[secretaria/queries] loadNetworkKpis failed:", err);
    return emptyKpis();
  }
}

export async function loadSchoolsHealth(input: {
  tenantId: string;
}): Promise<SchoolHealth[]> {
  if (!dbAvailable()) return [];
  try {
    await ensureNetworkSeeded();
    const d = db();
    const rows = await d
      .select({
        id: schools.id,
        name: schools.name,
        region: schools.region,
        studentsTotal: sql<number>`count(distinct ${students.id})`,
        classesTotal: sql<number>`count(distinct ${classes.id})`,
        teachersTotal: sql<number>`count(distinct ${memberships.userId})`,
        avgProficiency: sql<number>`coalesce(avg(${studentProficiency.score}), 0)`,
      })
      .from(schools)
      .leftJoin(students, eq(students.schoolId, schools.id))
      .leftJoin(classes, eq(classes.schoolId, schools.id))
      .leftJoin(
        memberships,
        and(
          eq(memberships.schoolId, schools.id),
          inArray(memberships.role, [
            "professor",
            "coordenador",
            "diretor",
            "orientador",
          ]),
        ),
      )
      .leftJoin(studentProficiency, eq(studentProficiency.studentId, students.id))
      .where(eq(schools.tenantId, input.tenantId))
      .groupBy(schools.id, schools.name, schools.region)
      .orderBy(asc(schools.name));

    const riskBySchool = await loadRiskCountBy(input.tenantId, "school");
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      region: r.region,
      studentsTotal: Number(r.studentsTotal),
      classesTotal: Number(r.classesTotal),
      teachersTotal: Number(r.teachersTotal),
      avgProficiency: Number(r.avgProficiency),
      atRiskCount: riskBySchool.get(r.id) ?? 0,
    }));
  } catch (err) {
    console.error("[secretaria/queries] loadSchoolsHealth failed:", err);
    return [];
  }
}

export async function loadNetworkClasses(input: {
  tenantId: string;
}): Promise<NetworkClassSummary[]> {
  if (!dbAvailable()) return [];
  try {
    await ensureNetworkSeeded();
    const rows = await db()
      .select({
        id: classes.id,
        name: classes.name,
        grade: classes.grade,
        schoolId: classes.schoolId,
        schoolName: schools.name,
        studentsTotal: sql<number>`count(distinct ${students.id})`,
        teachersTotal: sql<number>`count(distinct ${memberships.userId})`,
        avgProficiency: sql<number>`coalesce(avg(${studentProficiency.score}), 0)`,
      })
      .from(classes)
      .innerJoin(schools, eq(schools.id, classes.schoolId))
      .leftJoin(students, eq(students.classId, classes.id))
      .leftJoin(
        memberships,
        and(
          eq(memberships.classId, classes.id),
          inArray(memberships.role, [
            "professor",
            "coordenador",
            "diretor",
            "orientador",
          ]),
        ),
      )
      .leftJoin(studentProficiency, eq(studentProficiency.studentId, students.id))
      .where(eq(classes.tenantId, input.tenantId))
      .groupBy(classes.id, classes.name, classes.grade, classes.schoolId, schools.name)
      .orderBy(asc(schools.name), asc(classes.name));

    const riskByClass = await loadRiskCountBy(input.tenantId, "class");
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      grade: r.grade,
      schoolId: r.schoolId,
      schoolName: r.schoolName,
      studentsTotal: Number(r.studentsTotal),
      teachersTotal: Number(r.teachersTotal),
      avgProficiency: Number(r.avgProficiency),
      atRiskCount: riskByClass.get(r.id) ?? 0,
    }));
  } catch (err) {
    console.error("[secretaria/queries] loadNetworkClasses failed:", err);
    return [];
  }
}

export async function loadNetworkStudents(input: {
  tenantId: string;
  limit?: number;
}): Promise<NetworkStudentSummary[]> {
  if (!dbAvailable()) return [];
  try {
    await ensureNetworkSeeded();
    const rows = await db()
      .select({
        id: students.id,
        fullName: students.fullName,
        schoolName: schools.name,
        className: classes.name,
        grade: classes.grade,
        avgScore: sql<number>`coalesce(avg(${studentProficiency.score}), 0)`,
        conversationCount: sql<number>`count(distinct ${conversations.id})`,
        lastActivity: sql<Date>`max(${conversations.updatedAt})`,
      })
      .from(students)
      .innerJoin(schools, eq(schools.id, students.schoolId))
      .innerJoin(classes, eq(classes.id, students.classId))
      .leftJoin(studentProficiency, eq(studentProficiency.studentId, students.id))
      .leftJoin(conversations, eq(conversations.studentId, students.id))
      .where(eq(students.tenantId, input.tenantId))
      .groupBy(students.id, students.fullName, schools.name, classes.name, classes.grade)
      .orderBy(asc(students.fullName))
      .limit(input.limit ?? 200);

    return rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      schoolName: r.schoolName,
      className: r.className,
      grade: r.grade,
      avgScore: Number(r.avgScore),
      conversationCount: Number(r.conversationCount),
      lastActivity: r.lastActivity ?? null,
    }));
  } catch (err) {
    console.error("[secretaria/queries] loadNetworkStudents failed:", err);
    return [];
  }
}

export async function loadNetworkUsers(input: {
  tenantId: string;
}): Promise<NetworkUserSummary[]> {
  if (!dbAvailable()) return [];
  try {
    await ensureNetworkSeeded();
    const rows = await db()
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: memberships.role,
        schoolName: schools.name,
        className: classes.name,
        createdAt: memberships.createdAt,
      })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .leftJoin(schools, eq(schools.id, memberships.schoolId))
      .leftJoin(classes, eq(classes.id, memberships.classId))
      .where(eq(memberships.tenantId, input.tenantId))
      .orderBy(asc(users.name));

    return rows;
  } catch (err) {
    console.error("[secretaria/queries] loadNetworkUsers failed:", err);
    return [];
  }
}

export async function loadSecretariaAnnouncements(input: {
  tenantId: string;
  limit?: number;
}): Promise<SecretariaAnnouncementSummary[]> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db()
      .select({
        id: studentAnnouncements.id,
        origin: studentAnnouncements.origin,
        title: studentAnnouncements.title,
        authorName: studentAnnouncements.authorName,
        priority: studentAnnouncements.priority,
        requiresConfirmation: studentAnnouncements.requiresConfirmation,
        publishedAt: studentAnnouncements.publishedAt,
        expiresAt: studentAnnouncements.expiresAt,
        readCount: sql<number>`count(distinct ${studentAnnouncementReads.studentId})`,
      })
      .from(studentAnnouncements)
      .leftJoin(
        studentAnnouncementReads,
        eq(studentAnnouncementReads.announcementId, studentAnnouncements.id),
      )
      .where(eq(studentAnnouncements.tenantId, input.tenantId))
      .groupBy(
        studentAnnouncements.id,
        studentAnnouncements.origin,
        studentAnnouncements.title,
        studentAnnouncements.authorName,
        studentAnnouncements.priority,
        studentAnnouncements.requiresConfirmation,
        studentAnnouncements.publishedAt,
        studentAnnouncements.expiresAt,
      )
      .orderBy(desc(studentAnnouncements.publishedAt))
      .limit(input.limit ?? 50);
    return rows.map((row) => ({ ...row, readCount: Number(row.readCount) }));
  } catch (err) {
    console.error("[secretaria/queries] loadSecretariaAnnouncements failed:", err);
    return [];
  }
}

async function loadRiskCountBy(
  tenantId: string,
  dimension: "school" | "class",
): Promise<Map<string, number>> {
  const idColumn = dimension === "school" ? students.schoolId : students.classId;
  const rows = await db()
    .select({
      id: idColumn,
      studentId: students.id,
    })
    .from(students)
    .leftJoin(studentProficiency, eq(studentProficiency.studentId, students.id))
    .where(eq(students.tenantId, tenantId))
    .groupBy(idColumn, students.id)
    .having(sql`coalesce(avg(${studentProficiency.score}), 0) < 0.45`);

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.id, (map.get(row.id) ?? 0) + 1);
  }
  return map;
}

export function proficiencyLabel(score: number): string {
  return scoreToProficiency(score).replace(/^./, (c) => c.toUpperCase());
}

function emptyKpis(): NetworkKpis {
  return {
    studentsTotal: 0,
    studentsEngaged7d: 0,
    teachersTotal: 0,
    schoolsTotal: 0,
    classesTotal: 0,
    studentsAtRisk: 0,
    avgProficiency: 0,
  };
}
