import { NextResponse, type NextRequest } from "next/server";
import { complete } from "@/lib/llm";
import { buildFocusBlock, buildMaterialBlock } from "@/lib/llm/rag/context";
import { getCurrentTenant } from "@/lib/tenants/server";
import { auth } from "@/lib/auth";
import {
  resolveStudentId,
  resolveStudentClassId,
} from "@/lib/db/student-resolver";
import {
  createConversation,
  appendMessage,
  touchConversation,
  getConversationOwner,
} from "@/lib/chat/persistence";
import { createBufferedSseResponse } from "@/lib/http/sse";

/**
 * POST /api/chat
 *
 * Body: {
 *   messages: ChatMessage[],
 *   conversationId?: string  // se ausente, cria nova conversation
 * }
 *
 * Responde em linhas SSE com chunks { type: "text" | "done" | "error" | "meta" }.
 * O chunk "meta" carrega { conversationId } pra o cliente atualizar a URL.
 *
 * Persistência é graceful: sem DATABASE_URL, o chat continua streamando
 * mas não salva no DB.
 */

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "aluno" && session.user.role !== "responsavel") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const tenant = await getCurrentTenant();
  const body = (await request.json()) as {
    messages: { role: "user" | "assistant" | "system"; content: string }[];
    conversationId?: string;
  };

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const studentId = await resolveStudentId({
    userId: session.user.id,
    tenantId: tenant.id,
  });

  let conversationId: string | null = body.conversationId ?? null;
  if (conversationId && studentId) {
    const owner = await getConversationOwner({
      tenantId: tenant.id,
      conversationId,
    });
    if (!owner || owner.studentId !== studentId) {
      conversationId = null;
    }
  }

  const lastUserMessage = [...body.messages].reverse().find((m) => m.role === "user");

  if (!conversationId && studentId && lastUserMessage) {
    conversationId = await createConversation({
      tenantId: tenant.id,
      studentId,
      title: lastUserMessage.content,
    });
  }

  if (conversationId && lastUserMessage) {
    await appendMessage({
      tenantId: tenant.id,
      conversationId,
      role: "user",
      content: lastUserMessage.content,
    });
  }

  const persistedConversationId = conversationId;

  const events: unknown[] = [];
  if (persistedConversationId) {
    events.push({ type: "meta", conversationId: persistedConversationId });
  }

  try {
    // RAG: foco pedagógico da turma + trechos relevantes do material.
    // Resiliente — se algo falhar, slots vêm com placeholder neutro.
    const classId = studentId
      ? await resolveStudentClassId({ studentId })
      : null;

    const lastUserText = lastUserMessage?.content ?? "";
    const [focoBlock, materialBlock] = classId
      ? await Promise.all([
          buildFocusBlock({ tenantId: tenant.id, classId }),
          buildMaterialBlock({
            tenantId: tenant.id,
            classId,
            query: lastUserText,
          }),
        ])
      : [
          "(Nenhuma habilidade marcada como foco no momento.)",
          "(Sem material relevante encontrado para essa pergunta. Responda com seu conhecimento amplo.)",
        ];

    const result = await complete({
      capability: "chat_student",
      messages: body.messages,
      tenantId: tenant.id,
      systemContext: {
        tutor_name: tenant.tutorName,
        prefeitura: tenant.short,
        foco_pedagogico: focoBlock,
        contexto_material: materialBlock,
      },
    });

    events.push({ type: "text", text: result.text });
    events.push({
      type: "done",
      meta: {
        model: result.model,
        provider: result.provider,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
      },
    });

    if (persistedConversationId && result.text) {
      await appendMessage({
        tenantId: tenant.id,
        conversationId: persistedConversationId,
        role: "assistant",
        content: result.text,
        model: result.model,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        latencyMs: result.latencyMs,
      });
      await touchConversation({
        tenantId: tenant.id,
        conversationId: persistedConversationId,
      });
    }
  } catch (err) {
    events.push({
      type: "error",
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return createBufferedSseResponse(events);
}
