import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { classes, pedagogicalDiaryEntries } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/tenants/server";
import { writeAuditLog } from "@/lib/audit/log";
import { ensureDemoClassScope, ensureSessionUserId } from "./demo-db";

export interface DiaryEntry {
  id: string;
  classId: string;
  authorUserId: string | null;
  entryDate: Date;
  title: string;
  summary: string | null;
  content: Record<string, unknown>;
  status: string;
  signedAt: Date | null;
  createdAt: Date;
}

function dbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export async function loadDiaryEntries(input: {
  tenantId: string;
  classId: string;
  limit?: number;
}): Promise<DiaryEntry[]> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db()
      .select()
      .from(pedagogicalDiaryEntries)
      .where(
        and(
          eq(pedagogicalDiaryEntries.tenantId, input.tenantId),
          eq(pedagogicalDiaryEntries.classId, input.classId),
        ),
      )
      .orderBy(desc(pedagogicalDiaryEntries.entryDate))
      .limit(input.limit ?? 8);
    return rows as DiaryEntry[];
  } catch (err) {
    console.error("[teacher/diary] load failed:", err);
    return [];
  }
}

async function requirePedagogicalUser() {
  const session = await auth();
  const role = session?.user?.role;
  if (
    !session?.user ||
    (role !== "professor" &&
      role !== "coordenador" &&
      role !== "diretor" &&
      role !== "orientador")
  ) {
    throw new Error("forbidden");
  }
  return session.user;
}

async function assertClassBelongsToTenant(classId: string, tenantId: string) {
  if (!dbAvailable()) return;
  await ensureDemoClassScope(classId, tenantId);
  const row = (
    await db()
      .select({ id: classes.id })
      .from(classes)
      .where(and(eq(classes.id, classId), eq(classes.tenantId, tenantId)))
      .limit(1)
  )[0];
  if (!row) throw new Error("turma invalida para esse tenant");
}

export async function saveDiaryDraft(formData: FormData) {
  "use server";

  const user = await requirePedagogicalUser();
  const tenant = await getCurrentTenant();
  if (!dbAvailable()) {
    throw new Error("DATABASE_URL ausente - diario nao pode ser persistido.");
  }

  const classId = String(formData.get("classId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const contentRaw = String(formData.get("content") ?? "{}");
  if (!classId || !title) throw new Error("Dados do diario incompletos.");

  await assertClassBelongsToTenant(classId, tenant.id);
  const authorUserId = await ensureSessionUserId(user);
  const content = safeJson(contentRaw);
  const id = crypto.randomUUID();

  await db()
    .insert(pedagogicalDiaryEntries)
    .values({
      id,
      tenantId: tenant.id,
      classId,
      authorUserId,
      title,
      summary: summary || null,
      content,
      status: "draft",
    });

  await writeAuditLog({
    tenantId: tenant.id,
    actorUserId: user.id,
    action: "teacher.diary.save_draft",
    targetType: "pedagogical_diary_entry",
    targetId: id,
    metadata: { classId, title },
  });

  revalidatePath("/professor/diario");
}

export async function signDiaryEntry(formData: FormData) {
  "use server";

  const user = await requirePedagogicalUser();
  const tenant = await getCurrentTenant();
  if (!dbAvailable()) {
    throw new Error("DATABASE_URL ausente - diario nao pode ser assinado.");
  }

  const entryId = String(formData.get("entryId") ?? "");
  if (!entryId) throw new Error("Entrada nao informada.");

  const row = (
    await db()
      .select({
        id: pedagogicalDiaryEntries.id,
        classId: pedagogicalDiaryEntries.classId,
      })
      .from(pedagogicalDiaryEntries)
      .where(
        and(
          eq(pedagogicalDiaryEntries.id, entryId),
          eq(pedagogicalDiaryEntries.tenantId, tenant.id),
        ),
      )
      .limit(1)
  )[0];
  if (!row) throw new Error("Entrada nao encontrada.");

  await db()
    .update(pedagogicalDiaryEntries)
    .set({
      status: "signed",
      signedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(pedagogicalDiaryEntries.id, entryId));

  await writeAuditLog({
    tenantId: tenant.id,
    actorUserId: user.id,
    action: "teacher.diary.sign",
    targetType: "pedagogical_diary_entry",
    targetId: entryId,
    metadata: { classId: row.classId },
  });

  revalidatePath("/professor/diario");
}

function safeJson(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
