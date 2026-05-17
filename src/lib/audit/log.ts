import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";

export interface AuditInput {
  tenantId?: string | null;
  actorUserId?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function writeAuditLog(input: AuditInput): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    await db()
      .insert(auditLog)
      .values({
        tenantId: input.tenantId ?? null,
        actorUserId: input.actorUserId ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        metadata: input.metadata ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      });
  } catch (err) {
    console.warn("[audit] write failed:", err);
  }
}
