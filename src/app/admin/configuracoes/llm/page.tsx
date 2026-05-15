/**
 * Admin · Configurações macro de LLM.
 *
 * Tela onde o admin Nexus edita roteamento (modelo/temperature/maxTokens)
 * e prompts versionados por capability. Mudanças entram em vigor no
 * próximo request — sem deploy.
 *
 * Granularidade: macro global (afeta TODAS as prefeituras). Quando
 * tivermos demanda real por override por tenant, estendemos.
 */

import { PageBody, PageHeader } from "@/components/layout";
import { Card } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import {
  loadAllRoutes,
  loadPromptsForCapability,
} from "@/lib/admin/llm-queries";
import type { Capability } from "@/lib/llm/types";
import { LlmConfigEditor } from "./LlmConfigEditor";

export default async function LlmConfigPage() {
  await requireRole("admin_nexus");

  const routes = await loadAllRoutes();
  const promptsByCapability: Record<string, Awaited<ReturnType<typeof loadPromptsForCapability>>> = {};
  for (const r of routes) {
    promptsByCapability[r.capability] = await loadPromptsForCapability(
      r.capability as Capability,
    );
  }

  return (
    <>
      <PageHeader
        title="Configuração macro · LLM"
        subtitle="Roteamento e prompts ativos · efeito imediato · todas as prefeituras"
      />
      <PageBody>
        <Card className="bg-primary-soft border-primary-border p-4">
          <div className="text-primary text-[11.5px] font-semibold tracking-wider uppercase">
            Como funciona
          </div>
          <p className="text-primary mt-1 text-sm leading-relaxed">
            Tudo aqui é <b>config macro</b> — mudanças valem para todas as
            prefeituras imediatamente. Não tem versionamento de
            rascunho/publicar: a versão de prompt marcada como <b>ativa</b> é a
            que roda. Pra evitar estrago, editar um prompt sempre cria uma{" "}
            <b>nova versão</b>; ativar é um passo separado. Sem registro no DB,
            cai no <b>fallback hardcoded</b> do código.
          </p>
        </Card>

        <LlmConfigEditor
          routes={routes.map((r) => ({
            capability: r.capability,
            provider: r.provider,
            model: r.model,
            temperature: r.temperature,
            maxTokens: r.maxTokens,
            fallbackProvider: r.fallbackProvider,
            fallbackModel: r.fallbackModel,
            source: r.source,
            updatedAt: r.updatedAt?.toISOString() ?? null,
          }))}
          promptsByCapability={Object.fromEntries(
            Object.entries(promptsByCapability).map(([k, v]) => [
              k,
              v.map((p) => ({
                id: p.id,
                capability: p.capability,
                version: p.version,
                content: p.content,
                active: p.active,
                source: p.source,
                createdAt:
                  p.createdAt.getTime() === 0
                    ? null
                    : p.createdAt.toISOString(),
              })),
            ]),
          )}
        />
      </PageBody>
    </>
  );
}
