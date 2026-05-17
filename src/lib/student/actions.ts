"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  auditLog,
  consentLog,
  studentAnnouncementReads,
  studentAnnouncements,
  students,
} from "@/lib/db/schema";
import { resolveStudentId } from "@/lib/db/student-resolver";
import { getCurrentTenant } from "@/lib/tenants/server";
import type { A11yMode } from "./queries";

const CONSENT_SCOPE = [
  "chat_tutoria",
  "memoria_pedagogica",
  "rag_material_turma",
  "sre_escalation",
] as const;

async function requireStudentSession() {
  const session = await auth();
  if (!session?.user) throw new Error("unauthorized");
  if (session.user.role !== "aluno" && session.user.role !== "responsavel") {
    throw new Error("forbidden");
  }
  return session.user;
}

export async function completeStudentOnboarding(formData: FormData) {
  const user = await requireStudentSession();
  const tenant = await getCurrentTenant();
  const nickname = readString(formData, "nickname");
  const guardianName =
    readString(formData, "guardianName") || "Responsavel informado";
  const accepted = formData.get("accepted") === "on";

  if (!accepted) throw new Error("termo_nao_aceito");

  if (process.env.DATABASE_URL) {
    const studentId = await resolveStudentId({
      userId: user.id,
      tenantId: tenant.id,
    });

    if (studentId) {
      if (nickname) {
        await db()
          .update(students)
          .set({ nickname })
          .where(and(eq(students.id, studentId), eq(students.tenantId, tenant.id)));
      }

      await db().insert(consentLog).values({
        tenantId: tenant.id,
        studentId,
        guardianName,
        termVersion: "student-onboarding-v1",
        scope: [...CONSENT_SCOPE],
      });

      await writeAudit({
        tenantId: tenant.id,
        actorUserId: user.id,
        action: "student.onboarding.complete",
        targetType: "student",
        targetId: studentId,
        metadata: {
          hasNickname: !!nickname,
          consentScope: CONSENT_SCOPE,
        },
      });
    }
  }

  revalidatePath("/aluno/onboarding");
  revalidatePath("/aluno/chat");
  redirect("/aluno/chat");
}

export async function saveAccessibilityMode(formData: FormData) {
  const user = await requireStudentSession();
  const tenant = await getCurrentTenant();
  const mode = normalizeA11yMode(readString(formData, "mode"));

  if (process.env.DATABASE_URL) {
    const studentId = await resolveStudentId({
      userId: user.id,
      tenantId: tenant.id,
    });

    if (studentId) {
      await db()
        .update(students)
        .set({ a11yMode: mode === "none" ? null : mode })
        .where(and(eq(students.id, studentId), eq(students.tenantId, tenant.id)));

      await writeAudit({
        tenantId: tenant.id,
        actorUserId: user.id,
        action: "student.accessibility.update",
        targetType: "student",
        targetId: studentId,
        metadata: { mode },
      });
    }
  }

  revalidatePath("/aluno/acessibilidade");
}

export async function markAnnouncementRead(formData: FormData) {
  const user = await requireStudentSession();
  const tenant = await getCurrentTenant();
  const announcementId = readString(formData, "announcementId");
  if (!announcementId || !process.env.DATABASE_URL) return;

  const confirmed = formData.get("confirm") === "true";

  try {
    const studentId = await resolveStudentId({
      userId: user.id,
      tenantId: tenant.id,
    });
    if (!studentId) return;

    const [announcement] = await db()
      .select({
        id: studentAnnouncements.id,
        tenantId: studentAnnouncements.tenantId,
        requiresConfirmation: studentAnnouncements.requiresConfirmation,
      })
      .from(studentAnnouncements)
      .where(
        and(
          eq(studentAnnouncements.id, announcementId),
          eq(studentAnnouncements.tenantId, tenant.id),
        ),
      )
      .limit(1);

    if (!announcement) return;

    const now = new Date();
    await db()
      .insert(studentAnnouncementReads)
      .values({
        tenantId: tenant.id,
        announcementId,
        studentId,
        readAt: now,
        confirmedAt: confirmed || announcement.requiresConfirmation ? now : null,
      })
      .onConflictDoUpdate({
        target: [
          studentAnnouncementReads.announcementId,
          studentAnnouncementReads.studentId,
        ],
        set: {
          readAt: now,
          confirmedAt:
            confirmed || announcement.requiresConfirmation ? now : null,
        },
      });

    await writeAudit({
      tenantId: tenant.id,
      actorUserId: user.id,
      action: "student.announcement.read",
      targetType: "student_announcement",
      targetId: announcementId,
      metadata: { confirmed: confirmed || announcement.requiresConfirmation },
    });
  } catch (err) {
    console.error("[student/actions] markAnnouncementRead failed:", err);
    if (isFallbackAnnouncement(announcementId)) {
      await writeAudit({
        tenantId: tenant.id,
        actorUserId: user.id,
        action: "student.announcement.read",
        targetType: "student_announcement",
        targetId: announcementId,
        metadata: { confirmed, fallback: true },
      });
    }
  }

  revalidatePath("/aluno/mural");
}

async function writeAudit(input: {
  tenantId: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  if (!process.env.DATABASE_URL) return;
  try {
    await db().insert(auditLog).values({
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
    });
  } catch (err) {
    console.warn("[student/actions] audit failed:", err);
  }
}

function normalizeA11yMode(mode: string): A11yMode {
  if (mode === "easy-read" || mode === "dyslexia" || mode === "tdah") {
    return mode;
  }
  return "none";
}

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isFallbackAnnouncement(announcementId: string): boolean {
  return announcementId.startsWith("c") || announcementId.startsWith("ann-demo-");
}
