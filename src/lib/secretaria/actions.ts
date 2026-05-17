"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  classes,
  memberships,
  schools,
  studentAnnouncements,
  students,
  users,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/auth/password";
import { getCurrentTenant } from "@/lib/tenants/server";
import { writeAuditLog } from "@/lib/audit/log";

type SecretariaAssignableRole =
  | "professor"
  | "coordenador"
  | "diretor"
  | "orientador"
  | "secretaria";

const ASSIGNABLE_ROLES = new Set<SecretariaAssignableRole>([
  "professor",
  "coordenador",
  "diretor",
  "orientador",
  "secretaria",
]);

async function requireSecretariaUser() {
  const session = await auth();
  if (!session?.user || session.user.role !== "secretaria") {
    throw new Error("forbidden");
  }
  return session.user;
}

export async function createSecretariaAnnouncement(formData: FormData) {
  const user = await requireSecretariaUser();
  const tenant = await getCurrentTenant();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ausente - comunicado nao pode ser salvo.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const priorityRaw = String(formData.get("priority") ?? "media");
  const requiresConfirmation = formData.get("requiresConfirmation") === "on";
  const priority =
    priorityRaw === "alta" || priorityRaw === "baixa" ? priorityRaw : "media";

  if (!title || !body) {
    throw new Error("Titulo e mensagem sao obrigatorios.");
  }

  const id = crypto.randomUUID();
  await db()
    .insert(studentAnnouncements)
    .values({
      id,
      tenantId: tenant.id,
      schoolId: null,
      classId: null,
      origin: "secretaria",
      title,
      body,
      authorName: user.name ?? "Secretaria",
      priority,
      requiresConfirmation,
      publishedAt: new Date(),
      createdBy: user.id,
    });

  await writeAuditLog({
    tenantId: tenant.id,
    actorUserId: user.id,
    action: "secretaria.announcement.create",
    targetType: "student_announcement",
    targetId: id,
    metadata: { priority, requiresConfirmation },
  });

  revalidatePath("/secretaria/mural");
  revalidatePath("/aluno/mural");
}

export async function createSchool(formData: FormData) {
  const user = await requireSecretariaUser();
  const tenant = await getCurrentTenant();
  requireDatabase("escola");

  const name = requiredText(formData, "name", "Nome da escola");
  const region = optionalText(formData, "region");
  const address = optionalText(formData, "address");
  const existing = await findSchoolByName(tenant.id, name);
  if (existing) {
    throw new Error("Ja existe uma escola com esse nome neste tenant.");
  }

  const id = crypto.randomUUID();
  await db().insert(schools).values({
    id,
    tenantId: tenant.id,
    name,
    region,
    address,
  });

  await writeAuditLog({
    tenantId: tenant.id,
    actorUserId: user.id,
    action: "secretaria.school.create",
    targetType: "school",
    targetId: id,
    metadata: { name, region },
  });

  revalidateSecretariaNetwork();
}

export async function createClass(formData: FormData) {
  const user = await requireSecretariaUser();
  const tenant = await getCurrentTenant();
  requireDatabase("turma");

  const schoolId = requiredText(formData, "schoolId", "Escola");
  const school = await requireSchool(tenant.id, schoolId);
  const name = requiredText(formData, "name", "Nome da turma");
  const grade = requiredText(formData, "grade", "Serie");
  const year = parseYear(optionalText(formData, "year"));

  const existing = await findClassByName({
    tenantId: tenant.id,
    schoolId,
    name,
    year,
  });
  if (existing) {
    throw new Error("Ja existe uma turma com esse nome, ano e escola.");
  }

  const id = crypto.randomUUID();
  await db().insert(classes).values({
    id,
    tenantId: tenant.id,
    schoolId,
    name,
    grade,
    year,
  });

  await writeAuditLog({
    tenantId: tenant.id,
    actorUserId: user.id,
    action: "secretaria.class.create",
    targetType: "class",
    targetId: id,
    metadata: { name, grade, year, schoolId: school.id },
  });

  revalidateSecretariaNetwork();
}

export async function createStudent(formData: FormData) {
  const user = await requireSecretariaUser();
  const tenant = await getCurrentTenant();
  requireDatabase("aluno");

  const classId = requiredText(formData, "classId", "Turma");
  const classRow = await requireClass(tenant.id, classId);
  const fullName = requiredText(formData, "fullName", "Nome do aluno");
  const nickname = optionalText(formData, "nickname");
  const cpf = optionalText(formData, "cpf");
  const birthDate = parseDate(optionalText(formData, "birthDate"));
  const bolsaFamilia = formData.get("bolsaFamilia") === "on";

  const duplicate = await findStudentDuplicate({
    tenantId: tenant.id,
    classId,
    fullName,
    cpf,
  });
  if (duplicate) {
    throw new Error("Ja existe aluno com esse CPF ou nome nessa turma.");
  }

  const id = crypto.randomUUID();
  await db().insert(students).values({
    id,
    tenantId: tenant.id,
    userId: null,
    schoolId: classRow.schoolId,
    classId,
    fullName,
    nickname,
    birthDate,
    cpf,
    bolsaFamilia,
  });

  await writeAuditLog({
    tenantId: tenant.id,
    actorUserId: user.id,
    action: "secretaria.student.create",
    targetType: "student",
    targetId: id,
    metadata: { classId, schoolId: classRow.schoolId, hasCpf: !!cpf },
  });

  revalidateSecretariaNetwork();
}

export async function createUserMembership(formData: FormData) {
  const actor = await requireSecretariaUser();
  const tenant = await getCurrentTenant();
  requireDatabase("usuario");

  const name = requiredText(formData, "name", "Nome");
  const email = requiredText(formData, "email", "E-mail").toLowerCase();
  const role = parseAssignableRole(requiredText(formData, "role", "Papel"));
  const password = optionalText(formData, "temporaryPassword");
  const classId = optionalId(formData, "classId");
  let schoolId = optionalId(formData, "schoolId");

  if (classId) {
    const classRow = await requireClass(tenant.id, classId);
    schoolId = classRow.schoolId;
  } else if (schoolId) {
    await requireSchool(tenant.id, schoolId);
  }

  const existingUser = await findUserByEmail(email);
  const userId = existingUser?.id ?? crypto.randomUUID();
  if (existingUser) {
    const set: { name: string; passwordHash?: string } = { name };
    if (password) set.passwordHash = hashPassword(password);
    await db().update(users).set(set).where(eq(users.id, existingUser.id));
  } else {
    await db().insert(users).values({
      id: userId,
      name,
      email,
      passwordHash: password ? hashPassword(password) : null,
    });
  }

  const membershipId = crypto.randomUUID();
  await db()
    .insert(memberships)
    .values({
      id: membershipId,
      userId,
      tenantId: tenant.id,
      role,
      schoolId,
      classId,
    })
    .onConflictDoUpdate({
      target: [memberships.userId, memberships.tenantId, memberships.role],
      set: { schoolId, classId },
    });

  await writeAuditLog({
    tenantId: tenant.id,
    actorUserId: actor.id,
    action: "secretaria.user_membership.upsert",
    targetType: "user",
    targetId: userId,
    metadata: { email, role, schoolId, classId, createdUser: !existingUser },
  });

  revalidateSecretariaNetwork();
}

export async function importStudentsCsv(formData: FormData) {
  const user = await requireSecretariaUser();
  const tenant = await getCurrentTenant();
  requireDatabase("importacao de alunos");

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    throw new Error("Envie um arquivo CSV.");
  }

  const text = await file.text();
  const parsed = parseCsv(text);
  if (parsed.length < 2) {
    throw new Error("CSV sem linhas de dados.");
  }
  if (parsed.length > 501) {
    throw new Error("Limite de 500 alunos por importacao.");
  }

  const headers = parsed[0]!.map(normalizeHeader);
  const rows = parsed.slice(1);
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const [index, row] of rows.entries()) {
    const line = index + 2;
    const fullName = csvValue(row, headers, ["nome", "aluno", "full_name", "fullname"]);
    const schoolName = csvValue(row, headers, ["escola", "school"]);
    const className = csvValue(row, headers, ["turma", "classe", "class"]);
    const grade =
      csvValue(row, headers, ["serie", "ano_serie", "grade"]) ||
      inferGrade(className);
    const nickname = csvValue(row, headers, ["apelido", "nickname"]);
    const cpf = csvValue(row, headers, ["cpf"]);
    const birthDate = parseDate(csvValue(row, headers, ["nascimento", "birth_date"]));
    const bolsaFamilia = parseBooleanCsv(
      csvValue(row, headers, ["bolsa_familia", "bolsa", "cadunico"]),
    );

    if (!fullName || !schoolName || !className || !grade) {
      errors.push(`Linha ${line}: nome, escola, turma e serie sao obrigatorios.`);
      skipped++;
      continue;
    }

    try {
      const school = await ensureSchoolByName(tenant.id, schoolName);
      const classRow = await ensureClassByName({
        tenantId: tenant.id,
        schoolId: school.id,
        name: className,
        grade,
        year: new Date().getFullYear(),
      });
      const duplicate = await findStudentDuplicate({
        tenantId: tenant.id,
        classId: classRow.id,
        fullName,
        cpf,
      });
      if (duplicate) {
        skipped++;
        continue;
      }

      await db().insert(students).values({
        id: crypto.randomUUID(),
        tenantId: tenant.id,
        userId: null,
        schoolId: school.id,
        classId: classRow.id,
        fullName,
        nickname,
        birthDate,
        cpf,
        bolsaFamilia,
      });
      created++;
    } catch (err) {
      skipped++;
      errors.push(
        `Linha ${line}: ${err instanceof Error ? err.message : "erro desconhecido"}`,
      );
    }
  }

  await writeAuditLog({
    tenantId: tenant.id,
    actorUserId: user.id,
    action: "secretaria.students.import_csv",
    targetType: "tenant",
    targetId: tenant.id,
    metadata: {
      filename: file.name,
      created,
      skipped,
      errors: errors.slice(0, 10),
    },
  });

  revalidateSecretariaNetwork();
}

function requireDatabase(label: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error(`DATABASE_URL ausente - ${label} nao pode ser salvo.`);
  }
}

function revalidateSecretariaNetwork() {
  revalidatePath("/secretaria");
  revalidatePath("/secretaria/rede");
  revalidatePath("/secretaria/escolas");
  revalidatePath("/secretaria/turmas");
  revalidatePath("/secretaria/alunos");
  revalidatePath("/secretaria/usuarios");
}

function requiredText(formData: FormData, key: string, label: string): string {
  const value = optionalText(formData, key);
  if (!value) throw new Error(`${label} e obrigatorio.`);
  return value;
}

function optionalText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function optionalId(formData: FormData, key: string): string | null {
  const value = optionalText(formData, key);
  return value && value !== "none" ? value : null;
}

function parseYear(value: string | null): number {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 2020 && parsed <= 2100) {
    return parsed;
  }
  return new Date().getFullYear();
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseAssignableRole(value: string): SecretariaAssignableRole {
  if (ASSIGNABLE_ROLES.has(value as SecretariaAssignableRole)) {
    return value as SecretariaAssignableRole;
  }
  throw new Error("Papel invalido para a Secretaria.");
}

async function requireSchool(tenantId: string, schoolId: string) {
  const row = (
    await db()
      .select({ id: schools.id, name: schools.name })
      .from(schools)
      .where(and(eq(schools.id, schoolId), eq(schools.tenantId, tenantId)))
      .limit(1)
  )[0];
  if (!row) throw new Error("Escola invalida para esse tenant.");
  return row;
}

async function requireClass(tenantId: string, classId: string) {
  const row = (
    await db()
      .select({
        id: classes.id,
        schoolId: classes.schoolId,
        name: classes.name,
      })
      .from(classes)
      .where(and(eq(classes.id, classId), eq(classes.tenantId, tenantId)))
      .limit(1)
  )[0];
  if (!row) throw new Error("Turma invalida para esse tenant.");
  return row;
}

async function findSchoolByName(tenantId: string, name: string) {
  return (
    await db()
      .select({ id: schools.id })
      .from(schools)
      .where(and(eq(schools.tenantId, tenantId), eq(schools.name, name)))
      .limit(1)
  )[0];
}

async function ensureSchoolByName(tenantId: string, name: string) {
  const existing = await findSchoolByName(tenantId, name);
  if (existing) return existing;
  const id = crypto.randomUUID();
  await db().insert(schools).values({
    id,
    tenantId,
    name,
    region: null,
    address: null,
  });
  return { id };
}

async function findClassByName(input: {
  tenantId: string;
  schoolId: string;
  name: string;
  year: number;
}) {
  return (
    await db()
      .select({ id: classes.id })
      .from(classes)
      .where(
        and(
          eq(classes.tenantId, input.tenantId),
          eq(classes.schoolId, input.schoolId),
          eq(classes.name, input.name),
          eq(classes.year, input.year),
        ),
      )
      .limit(1)
  )[0];
}

async function ensureClassByName(input: {
  tenantId: string;
  schoolId: string;
  name: string;
  grade: string;
  year: number;
}) {
  const existing = await findClassByName(input);
  if (existing) return existing;
  const id = crypto.randomUUID();
  await db().insert(classes).values({
    id,
    tenantId: input.tenantId,
    schoolId: input.schoolId,
    name: input.name,
    grade: input.grade,
    year: input.year,
  });
  return { id };
}

async function findUserByEmail(email: string) {
  return (
    await db()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
  )[0];
}

async function findStudentDuplicate(input: {
  tenantId: string;
  classId: string;
  fullName: string;
  cpf: string | null;
}) {
  const byCpf = input.cpf
    ? (
        await db()
          .select({ id: students.id })
          .from(students)
          .where(
            and(eq(students.tenantId, input.tenantId), eq(students.cpf, input.cpf)),
          )
          .limit(1)
      )[0]
    : null;
  if (byCpf) return byCpf;

  return (
    await db()
      .select({ id: students.id })
      .from(students)
      .where(
        and(
          eq(students.tenantId, input.tenantId),
          eq(students.classId, input.classId),
          eq(students.fullName, input.fullName),
        ),
      )
      .limit(1)
  )[0];
}

function parseCsv(text: string): string[][] {
  const delimiter = chooseDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"") {
      if (quoted && next === "\"") {
        cell += "\"";
        i++;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && char === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

function chooseDelimiter(text: string): "," | ";" {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function csvValue(
  row: string[],
  headers: string[],
  names: string[],
): string | null {
  for (const name of names) {
    const index = headers.indexOf(normalizeHeader(name));
    const value = index >= 0 ? row[index]?.trim() : "";
    if (value) return value;
  }
  return null;
}

function parseBooleanCsv(value: string | null): boolean {
  if (!value) return false;
  return ["1", "sim", "s", "true", "yes"].includes(
    normalizeHeader(value).replace(/_/g, ""),
  );
}

function inferGrade(className: string | null): string | null {
  if (!className) return null;
  const match = className.match(/\d+/);
  return match?.[0] ?? null;
}
