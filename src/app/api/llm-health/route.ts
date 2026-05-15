import { NextResponse } from "next/server";
import { complete } from "@/lib/llm";
import { routeFor } from "@/lib/llm/routes";
import { auth } from "@/lib/auth";

/**
 * GET /api/llm-health
 *
 * Faz uma chamada mínima ao LLM e retorna metadata real (provider, model,
 * latência, tokens) — útil pra confirmar se OPENROUTER_API_KEY está válida
 * em produção sem precisar parsear a resposta do chat/copiloto.
 *
 * Exige sessão. Disponível pra qualquer papel logado.
 */

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const expectedRoute = routeFor("chat_student");
  const hasApiKey = !!process.env.OPENROUTER_API_KEY;

  const start = Date.now();
  try {
    const result = await complete({
      capability: "chat_student",
      messages: [
        {
          role: "user",
          content:
            "Responda apenas 'pong' (sem aspas, sem nada a mais).",
        },
      ],
      tenantId: session.user.tenantId ?? "alfenas",
      maxTokens: 16,
    });

    const isReal = result.provider === "openrouter";

    return NextResponse.json({
      ok: true,
      live: isReal,
      provider: result.provider,
      model: result.model,
      expectedModel: expectedRoute.model,
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      sample: result.text.slice(0, 200),
      env: {
        hasOpenRouterKey: hasApiKey,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      },
      hint: isReal
        ? "Provider real respondeu — OpenRouter está ligado."
        : "Caiu no mock. Verifique OPENROUTER_API_KEY na Vercel e refaça redeploy.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        latencyMs: Date.now() - start,
        env: {
          hasOpenRouterKey: hasApiKey,
          hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        },
      },
      { status: 500 },
    );
  }
}
