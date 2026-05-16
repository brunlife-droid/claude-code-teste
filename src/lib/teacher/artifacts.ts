import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { auditLog } from "@/lib/db/schema";
import type { ChatCompletionResponse } from "@/lib/llm";

export type TeacherArtifactKind =
  | "lesson_plan"
  | "essay_correction"
  | "exam";

function dbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export interface TeacherArtifactSummary {
  id: string;
  kind: TeacherArtifactKind;
  title: string;
  contentPreview: string;
  provider?: string;
  model?: string;
  createdAt: Date;
}

export async function loadTeacherArtifacts(input: {
  tenantId: string;
  actorUserId: string;
  limit?: number;
}): Promise<TeacherArtifactSummary[]> {
  if (!dbAvailable()) return [];

  try {
    const rows = await db()
      .select({
        id: auditLog.id,
        targetId: auditLog.targetId,
        metadata: auditLog.metadata,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .where(
        and(
          eq(auditLog.tenantId, input.tenantId),
          eq(auditLog.actorUserId, input.actorUserId),
          eq(auditLog.action, "teacher_artifact.create"),
        ),
      )
      .orderBy(desc(auditLog.createdAt))
      .limit(input.limit ?? 6);

    return rows.map((row) => {
      const metadata = row.metadata ?? {};
      const kind = normalizeKind(metadata.kind);
      const title =
        typeof metadata.title === "string" && metadata.title.trim()
          ? metadata.title
          : artifactKindLabel(kind);
      const content =
        typeof metadata.content === "string" ? metadata.content : "";
      return {
        id: row.targetId ?? row.id,
        kind,
        title,
        contentPreview: compactPreview(content),
        provider:
          typeof metadata.provider === "string" ? metadata.provider : undefined,
        model: typeof metadata.model === "string" ? metadata.model : undefined,
        createdAt: row.createdAt,
      };
    });
  } catch (err) {
    console.error("[teacher/artifacts] loadTeacherArtifacts failed:", err);
    return [];
  }
}

export function artifactKindLabel(kind: TeacherArtifactKind): string {
  if (kind === "lesson_plan") return "Plano de aula";
  if (kind === "essay_correction") return "Correção de redação";
  return "Prova";
}

function normalizeKind(value: unknown): TeacherArtifactKind {
  if (
    value === "lesson_plan" ||
    value === "essay_correction" ||
    value === "exam"
  ) {
    return value;
  }
  return "lesson_plan";
}

function compactPreview(content: string): string {
  const compact = content.replace(/\s+/g, " ").trim();
  if (compact.length <= 180) return compact;
  return `${compact.slice(0, 180)}...`;
}

export async function recordTeacherArtifact(input: {
  tenantId: string;
  actorUserId: string;
  kind: TeacherArtifactKind;
  title: string;
  request: Record<string, unknown>;
  content: string;
  result: ChatCompletionResponse;
}): Promise<string | null> {
  if (!dbAvailable()) return null;

  try {
    const artifactId = crypto.randomUUID();
    await db()
      .insert(auditLog)
      .values({
        tenantId: input.tenantId,
        actorUserId: input.actorUserId,
        action: "teacher_artifact.create",
        targetType: "teacher_artifact",
        targetId: artifactId,
        metadata: {
          kind: input.kind,
          title: input.title,
          request: input.request,
          content: input.content,
          model: input.result.model,
          provider: input.result.provider,
          promptVersion: input.result.promptVersion,
          inputTokens: input.result.inputTokens,
          outputTokens: input.result.outputTokens,
          latencyMs: input.result.latencyMs,
        },
      });
    return artifactId;
  } catch (err) {
    console.error("[teacher/artifacts] recordTeacherArtifact failed:", err);
    return null;
  }
}
