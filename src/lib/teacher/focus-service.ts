import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { classes, classFocusSkills } from "@/lib/db/schema";
import type { NexusSessionUser } from "@/lib/auth/types";
import {
  ensureDemoClassScope,
  ensureKnownHabilities,
  ensureSessionUserId,
} from "./demo-db";

export interface SaveClassFocusInput {
  actor: NexusSessionUser;
  classId: string;
  habilityCodes: string[];
  tenantId: string;
}

export interface SaveClassFocusResult {
  ok: boolean;
  applied: number;
  error?: string;
}

export async function saveClassFocus(
  input: SaveClassFocusInput,
): Promise<SaveClassFocusResult> {
  if (!process.env.DATABASE_URL) return { ok: true, applied: 0 };

  try {
    const uniqueCodes = [...new Set(input.habilityCodes)];
    await ensureDemoClassScope(input.classId, input.tenantId);
    await assertClassInTenant(input.classId, input.tenantId);
    const actorUserId = await ensureSessionUserId(input.actor);

    await db()
      .delete(classFocusSkills)
      .where(
        and(
          eq(classFocusSkills.classId, input.classId),
          eq(classFocusSkills.tenantId, input.tenantId),
        ),
      );

    if (uniqueCodes.length > 0) {
      await ensureKnownHabilities(uniqueCodes);
      await db()
        .insert(classFocusSkills)
        .values(
          uniqueCodes.map((code) => ({
            tenantId: input.tenantId,
            classId: input.classId,
            habilityCode: code,
            setBy: actorUserId,
          })),
        )
        .onConflictDoUpdate({
          target: [classFocusSkills.classId, classFocusSkills.habilityCode],
          set: {
            tenantId: input.tenantId,
            setBy: actorUserId,
          },
        });
    }

    return { ok: true, applied: uniqueCodes.length };
  } catch (err) {
    console.error("[teacher/focus-service] saveClassFocus failed:", err);
    return {
      ok: false,
      applied: 0,
      error: "Não foi possível salvar o foco agora.",
    };
  }
}

async function assertClassInTenant(classId: string, tenantId: string) {
  const rows = await db()
    .select({ tenantId: classes.tenantId })
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1);
  if (!rows[0] || rows[0].tenantId !== tenantId) {
    throw new Error("turma inválida para esse tenant");
  }
}
