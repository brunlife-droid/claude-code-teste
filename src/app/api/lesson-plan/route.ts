import { NextResponse, type NextRequest } from "next/server";
import { stream } from "@/lib/llm";
import { auth } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/tenants/server";

/**
 * POST /api/lesson-plan
 *
 * Body: { subject, grade, topic, duration }
 *
 * Stream SSE com chunks { type: "text" | "done" | "error" }.
 * Gera plano de aula via capability `plan_generation` (Claude Haiku 4.5).
 * Restrito a professor/coordenador/diretor/orientador.
 */

export const runtime = "nodejs";

interface PlanRequest {
  subject?: string;
  grade?: string;
  topic?: string;
  duration?: string;
}

const TEACHER_ROLES = new Set(["professor", "coordenador", "diretor", "orientador"]);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!TEACHER_ROLES.has(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const tenant = await getCurrentTenant();
  const body = (await request.json()) as PlanRequest;

  const subject = (body.subject ?? "").trim();
  const grade = (body.grade ?? "").trim();
  const topic = (body.topic ?? "").trim();
  const duration = (body.duration ?? "50 min").trim();

  if (!subject || !grade || !topic) {
    return NextResponse.json(
      { error: "subject, grade e topic são obrigatórios" },
      { status: 400 },
    );
  }

  const userMessage = [
    `Gere um plano de aula com os seguintes parâmetros:`,
    ``,
    `- Disciplina: ${subject}`,
    `- Série: ${grade}`,
    `- Tema: ${topic}`,
    `- Duração: ${duration}`,
    ``,
    `Identifique a habilidade BNCC mais provável e siga a estrutura definida.`,
  ].join("\n");

  const encoder = new TextEncoder();
  const sseStream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };
      try {
        for await (const chunk of stream({
          capability: "plan_generation",
          messages: [{ role: "user", content: userMessage }],
          tenantId: tenant.id,
          systemContext: {
            prefeitura: tenant.short,
            tenant_uf: tenant.uf,
          },
        })) {
          send(chunk);
          if (chunk.type === "done" || chunk.type === "error") break;
        }
      } catch (err) {
        send({
          type: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
