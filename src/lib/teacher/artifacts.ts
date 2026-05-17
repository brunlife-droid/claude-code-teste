import { db } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { auditLog, teacherArtifacts } from "@/lib/db/schema";
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

  const limit = input.limit ?? 6;
  let dedicated: TeacherArtifactSummary[] = [];
  try {
    dedicated = await loadTeacherArtifactsFromTable(input, limit);
  } catch (err) {
    logPersistenceFallback("[teacher/artifacts] teacher_artifacts read", err);
  }

  try {
    const legacy = await loadTeacherArtifactsFromAudit(input, limit);
    return mergeArtifacts(dedicated, legacy, limit);
  } catch (err) {
    console.error("[teacher/artifacts] loadTeacherArtifacts failed:", err);
    return dedicated;
  }
}

async function loadTeacherArtifactsFromTable(
  input: {
    tenantId: string;
    actorUserId: string;
  },
  limit: number,
): Promise<TeacherArtifactSummary[]> {
  const rows = await db()
    .select({
      id: teacherArtifacts.id,
      kind: teacherArtifacts.kind,
      title: teacherArtifacts.title,
      content: teacherArtifacts.content,
      provider: teacherArtifacts.provider,
      model: teacherArtifacts.model,
      createdAt: teacherArtifacts.createdAt,
    })
    .from(teacherArtifacts)
    .where(
      and(
        eq(teacherArtifacts.tenantId, input.tenantId),
        eq(teacherArtifacts.actorUserId, input.actorUserId),
      ),
    )
    .orderBy(desc(teacherArtifacts.createdAt))
    .limit(limit);

  return rows.map((row) => {
    const kind = normalizeKind(row.kind);
    return {
      id: row.id,
      kind,
      title: row.title.trim() || artifactKindLabel(kind),
      contentPreview: compactPreview(row.content),
      provider: row.provider ?? undefined,
      model: row.model ?? undefined,
      createdAt: row.createdAt,
    };
  });
}

async function loadTeacherArtifactsFromAudit(
  input: {
    tenantId: string;
    actorUserId: string;
  },
  limit: number,
): Promise<TeacherArtifactSummary[]> {
  const rows = await db()
    .select({
      id: auditLog.id,
      actorUserId: auditLog.actorUserId,
      targetId: auditLog.targetId,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.tenantId, input.tenantId),
        eq(auditLog.action, "teacher_artifact.create"),
      ),
    )
    .orderBy(desc(auditLog.createdAt))
    .limit(limit * 5);

  return rows
    .filter((row) => {
      const metadata = row.metadata ?? {};
      return (
        row.actorUserId === input.actorUserId ||
        metadata.actorUserId === input.actorUserId
      );
    })
    .slice(0, limit)
    .map((row) => {
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
}

function mergeArtifacts(
  dedicated: TeacherArtifactSummary[],
  legacy: TeacherArtifactSummary[],
  limit: number,
): TeacherArtifactSummary[] {
  const byId = new Map<string, TeacherArtifactSummary>();
  for (const artifact of [...dedicated, ...legacy]) {
    if (!byId.has(artifact.id)) byId.set(artifact.id, artifact);
  }
  return Array.from(byId.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

function logPersistenceFallback(context: string, err: unknown): void {
  const code =
    typeof err === "object" && err && "code" in err ? err.code : "";
  const message =
    typeof err === "object" && err && "message" in err
      ? String(err.message)
      : String(err);
  const expectedDuringMigration =
    code === "42P01" || message.includes("teacher_artifacts");

  if (expectedDuringMigration) {
    console.warn(`${context}: usando fallback enquanto migration 0003 não foi aplicada.`);
    return;
  }

  console.error(`${context}: usando fallback por erro de persistência:`, err);
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

  const artifactId = crypto.randomUUID();
  const content = clampContent(input.content);

  try {
    await db()
      .insert(teacherArtifacts)
      .values({
        id: artifactId,
        tenantId: input.tenantId,
        actorUserId: input.actorUserId,
        kind: input.kind,
        title: input.title,
        request: input.request,
        content,
        model: input.result.model,
        provider: input.result.provider,
        promptVersion: input.result.promptVersion,
        inputTokens: input.result.inputTokens,
        outputTokens: input.result.outputTokens,
        latencyMs: input.result.latencyMs,
      });
    return artifactId;
  } catch (err) {
    logPersistenceFallback("[teacher/artifacts] teacher_artifacts insert", err);
  }

  try {
    await db()
      .insert(auditLog)
      .values({
        id: artifactId,
        tenantId: input.tenantId,
        actorUserId: null,
        action: "teacher_artifact.create",
        targetType: "teacher_artifact",
        targetId: artifactId,
        metadata: {
          actorUserId: input.actorUserId,
          kind: input.kind,
          title: input.title,
          request: input.request,
          content,
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

function clampContent(content: string): string {
  if (content.length <= 12000) return content;
  return `${content.slice(0, 12000)}...`;
}
