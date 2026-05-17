import { randomUUID } from "node:crypto";
import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditLog, studentArtifacts } from "@/lib/db/schema";
import type { ChatCompletionResponse } from "@/lib/llm";

export type StudentArtifactKind = "flashcards" | "quiz" | "summary";

export interface FlashcardItem {
  front: string;
  back: string;
  hint?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SummaryContent {
  summary: string;
  keyPoints: string[];
  studySteps: string[];
  practicePrompt: string;
}

export type StudentArtifactContent =
  | { kind: "flashcards"; cards: FlashcardItem[] }
  | { kind: "quiz"; questions: QuizQuestion[] }
  | ({ kind: "summary" } & SummaryContent);

export interface StudentArtifact {
  id: string;
  kind: StudentArtifactKind;
  title: string;
  content: StudentArtifactContent;
  provider?: string;
  model?: string;
  createdAt: Date;
}

function dbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export async function loadStudentArtifacts(input: {
  tenantId: string;
  actorUserId: string;
  studentId: string | null;
  limit?: number;
}): Promise<StudentArtifact[]> {
  if (!dbAvailable()) return [];

  const limit = input.limit ?? 8;
  let dedicated: StudentArtifact[] = [];
  try {
    dedicated = await loadStudentArtifactsFromTable(input, limit);
  } catch (err) {
    logPersistenceFallback("[student/artifacts] student_artifacts read", err);
  }

  try {
    const legacy = await loadStudentArtifactsFromAudit(input, limit);
    return mergeArtifacts(dedicated, legacy, limit);
  } catch (err) {
    console.error("[student/artifacts] loadStudentArtifacts failed:", err);
    return dedicated;
  }
}

async function loadStudentArtifactsFromTable(
  input: {
    tenantId: string;
    actorUserId: string;
    studentId: string | null;
  },
  limit: number,
): Promise<StudentArtifact[]> {
  const identityFilter = input.studentId
    ? or(
        eq(studentArtifacts.studentId, input.studentId),
        eq(studentArtifacts.actorUserId, input.actorUserId),
      )
    : eq(studentArtifacts.actorUserId, input.actorUserId);

  const rows = await db()
    .select({
      id: studentArtifacts.id,
      kind: studentArtifacts.kind,
      title: studentArtifacts.title,
      content: studentArtifacts.content,
      provider: studentArtifacts.provider,
      model: studentArtifacts.model,
      createdAt: studentArtifacts.createdAt,
    })
    .from(studentArtifacts)
    .where(and(eq(studentArtifacts.tenantId, input.tenantId), identityFilter))
    .orderBy(desc(studentArtifacts.createdAt))
    .limit(limit);

  return rows
    .map((row) => normalizeDedicatedArtifactRow(row))
    .filter((item): item is StudentArtifact => !!item);
}

async function loadStudentArtifactsFromAudit(
  input: {
    tenantId: string;
    actorUserId: string;
    studentId: string | null;
  },
  limit: number,
): Promise<StudentArtifact[]> {
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
        eq(auditLog.action, "student_artifact.create"),
      ),
    )
    .orderBy(desc(auditLog.createdAt))
    .limit(limit * 5);

  return rows
    .filter((row) => {
      const metadata = row.metadata ?? {};
      return (
        metadata.actorUserId === input.actorUserId ||
        (!!input.studentId && metadata.studentId === input.studentId)
      );
    })
    .slice(0, limit)
    .map((row) => normalizeAuditArtifactRow(row))
    .filter((item): item is StudentArtifact => !!item);
}

function mergeArtifacts(
  dedicated: StudentArtifact[],
  legacy: StudentArtifact[],
  limit: number,
): StudentArtifact[] {
  const byId = new Map<string, StudentArtifact>();
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
    code === "42P01" || message.includes("student_artifacts");

  if (expectedDuringMigration) {
    console.warn(`${context}: usando fallback enquanto migration 0003 não foi aplicada.`);
    return;
  }

  console.error(`${context}: usando fallback por erro de persistência:`, err);
}

function normalizeDedicatedArtifactRow(row: {
  id: string;
  kind: string;
  title: string;
  content: Record<string, unknown>;
  provider: string | null;
  model: string | null;
  createdAt: Date;
}): StudentArtifact | null {
  const kind = normalizeKind(row.kind);
  const content = normalizeContent(kind, row.content);
  if (!content) return null;
  return {
    id: row.id,
    kind,
    title: row.title.trim() || studentArtifactKindLabel(kind),
    content,
    provider: row.provider ?? undefined,
    model: row.model ?? undefined,
    createdAt: row.createdAt,
  };
}

export async function recordStudentArtifact(input: {
  tenantId: string;
  actorUserId: string;
  studentId: string | null;
  title: string;
  kind: StudentArtifactKind;
  content: StudentArtifactContent;
  request: Record<string, unknown>;
  result: ChatCompletionResponse;
}): Promise<string | null> {
  if (!dbAvailable()) return null;

  const artifactId = randomUUID();
  const content = clampArtifactContent(input.content);

  try {
    await db()
      .insert(studentArtifacts)
      .values({
        id: artifactId,
        tenantId: input.tenantId,
        actorUserId: input.actorUserId,
        studentId: input.studentId,
        conversationId: null,
        kind: input.kind,
        title: input.title,
        content: content as Record<string, unknown>,
        request: input.request,
        model: input.result.model,
        provider: input.result.provider,
        promptVersion: input.result.promptVersion,
        inputTokens: input.result.inputTokens,
        outputTokens: input.result.outputTokens,
        latencyMs: input.result.latencyMs,
      });
    return artifactId;
  } catch (err) {
    logPersistenceFallback("[student/artifacts] student_artifacts insert", err);
  }

  try {
    await db()
      .insert(auditLog)
      .values({
        id: artifactId,
        tenantId: input.tenantId,
        actorUserId: null,
        action: "student_artifact.create",
        targetType: "student_artifact",
        targetId: artifactId,
        metadata: {
          actorUserId: input.actorUserId,
          studentId: input.studentId,
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
    console.error("[student/artifacts] recordStudentArtifact failed:", err);
    return null;
  }
}

export function studentArtifactKindLabel(kind: StudentArtifactKind): string {
  if (kind === "flashcards") return "Cartões";
  if (kind === "quiz") return "Quiz";
  return "Resumo guiado";
}

function normalizeAuditArtifactRow(row: {
  id: string;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}): StudentArtifact | null {
  const metadata = row.metadata ?? {};
  const kind = normalizeKind(metadata.kind);
  const content = normalizeContent(kind, metadata.content);
  if (!content) return null;
  return {
    id: row.targetId ?? row.id,
    kind,
    title:
      typeof metadata.title === "string" && metadata.title.trim()
        ? metadata.title
        : studentArtifactKindLabel(kind),
    content,
    provider:
      typeof metadata.provider === "string" ? metadata.provider : undefined,
    model: typeof metadata.model === "string" ? metadata.model : undefined,
    createdAt: row.createdAt,
  };
}

function normalizeKind(value: unknown): StudentArtifactKind {
  if (value === "flashcards" || value === "quiz" || value === "summary") {
    return value;
  }
  return "summary";
}

function normalizeContent(
  kind: StudentArtifactKind,
  value: unknown,
): StudentArtifactContent | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (kind === "flashcards") {
    const cards = Array.isArray(raw.cards)
      ? raw.cards
          .map((item) => normalizeFlashcard(item))
          .filter((item): item is FlashcardItem => !!item)
      : [];
    return cards.length > 0 ? { kind, cards } : null;
  }
  if (kind === "quiz") {
    const questions = Array.isArray(raw.questions)
      ? raw.questions
          .map((item) => normalizeQuestion(item))
          .filter((item): item is QuizQuestion => !!item)
      : [];
    return questions.length > 0 ? { kind, questions } : null;
  }
  return {
    kind,
    summary: text(raw.summary, ""),
    keyPoints: stringList(raw.keyPoints),
    studySteps: stringList(raw.studySteps),
    practicePrompt: text(raw.practicePrompt, ""),
  };
}

function normalizeFlashcard(value: unknown): FlashcardItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const front = text(raw.front, "");
  const back = text(raw.back, "");
  if (!front || !back) return null;
  return { front, back, hint: text(raw.hint, "") || undefined };
}

function normalizeQuestion(value: unknown): QuizQuestion | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const question = text(raw.question, "");
  const options = stringList(raw.options).slice(0, 4);
  const correctIndex =
    typeof raw.correctIndex === "number" ? Math.round(raw.correctIndex) : 0;
  const explanation = text(raw.explanation, "");
  if (!question || options.length < 2) return null;
  return {
    question,
    options,
    correctIndex:
      correctIndex >= 0 && correctIndex < options.length ? correctIndex : 0,
    explanation,
  };
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => text(item, "")).filter(Boolean)
    : [];
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function clampArtifactContent(
  content: StudentArtifactContent,
): StudentArtifactContent {
  const json = JSON.stringify(content);
  if (json.length <= 12000) return content;
  if (content.kind === "summary") {
    return {
      ...content,
      summary: content.summary.slice(0, 1800),
      keyPoints: content.keyPoints.slice(0, 6),
      studySteps: content.studySteps.slice(0, 5),
    };
  }
  if (content.kind === "quiz") {
    return { kind: "quiz", questions: content.questions.slice(0, 8) };
  }
  return { kind: "flashcards", cards: content.cards.slice(0, 10) };
}
