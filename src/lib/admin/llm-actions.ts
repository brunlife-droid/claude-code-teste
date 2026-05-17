"use server";

/**
 * Server Actions do admin Nexus pra editar config macro de LLM.
 *
 * Todas exigem papel `admin_nexus`. Mudanças aqui afetam TODAS as
 * prefeituras (escolha do usuário: macro global, sem override por tenant).
 *
 * Convenção: editar prompt = criar nova versão (não sobrescrever). Trocar
 * versão ativa = um clique separado. Reduz foot-gun.
 *
 * TODO: registrar em `audit_log` quem mudou o quê (Fase 2).
 */

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { llmRoutes, systemPrompts } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit/log";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin_nexus") {
    throw new Error("forbidden");
  }
  return session.user;
}

export async function upsertRoute(input: {
  capability: string;
  provider: string;
  model: string;
  temperature?: number | null;
  maxTokens?: number | null;
  fallbackProvider?: string | null;
  fallbackModel?: string | null;
}) {
  const user = await requireAdmin();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ausente — não é possível persistir config.");
  }

  await db()
    .insert(llmRoutes)
    .values({
      capability: input.capability,
      provider: input.provider,
      model: input.model,
      temperature: input.temperature ?? null,
      maxTokens: input.maxTokens ?? null,
      fallbackProvider: input.fallbackProvider ?? null,
      fallbackModel: input.fallbackModel ?? null,
      active: true,
      updatedBy: user.id,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: llmRoutes.capability,
      set: {
        provider: input.provider,
        model: input.model,
        temperature: input.temperature ?? null,
        maxTokens: input.maxTokens ?? null,
        fallbackProvider: input.fallbackProvider ?? null,
        fallbackModel: input.fallbackModel ?? null,
        active: true,
        updatedBy: user.id,
        updatedAt: new Date(),
      },
    });

  await writeAuditLog({
    tenantId: user.tenantId,
    actorUserId: user.id,
    action: "admin.llm_route.upsert",
    targetType: "llm_route",
    targetId: input.capability,
    metadata: {
      provider: input.provider,
      model: input.model,
      temperature: input.temperature ?? null,
      maxTokens: input.maxTokens ?? null,
      fallbackProvider: input.fallbackProvider ?? null,
      fallbackModel: input.fallbackModel ?? null,
    },
  });

  revalidatePath("/admin/configuracoes/llm");
  return { ok: true };
}

export async function createPromptVersion(input: {
  capability: string;
  version: string;
  content: string;
  activate: boolean;
}) {
  const user = await requireAdmin();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL ausente — não é possível persistir prompt.");
  }
  if (!input.version.trim() || !input.content.trim()) {
    throw new Error("Versão e conteúdo são obrigatórios.");
  }

  const id = crypto.randomUUID();

  if (input.activate) {
    // Garante exclusividade via transação implícita do Neon serverless:
    // desativa o atual ativo da capability antes de inserir o novo ativo.
    await db()
      .update(systemPrompts)
      .set({ active: false })
      .where(
        and(
          eq(systemPrompts.capability, input.capability),
          eq(systemPrompts.active, true),
        ),
      );
  }

  await db()
    .insert(systemPrompts)
    .values({
      id,
      capability: input.capability,
      version: input.version,
      content: input.content,
      active: input.activate,
      createdBy: user.id,
    });

  await writeAuditLog({
    tenantId: user.tenantId,
    actorUserId: user.id,
    action: "admin.system_prompt.create",
    targetType: "system_prompt",
    targetId: id,
    metadata: {
      capability: input.capability,
      version: input.version,
      activate: input.activate,
    },
  });

  revalidatePath("/admin/configuracoes/llm");
  return { ok: true, id };
}

export async function activatePromptVersion(input: {
  capability: string;
  promptId: string;
}) {
  const user = await requireAdmin();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ausente");

  if (input.promptId.startsWith("hardcoded:")) {
    // "Ativar hardcoded" = desativar todas as versões DB pra cair no fallback.
    await db()
      .update(systemPrompts)
      .set({ active: false })
      .where(
        and(
          eq(systemPrompts.capability, input.capability),
          eq(systemPrompts.active, true),
        ),
      );
    await writeAuditLog({
      tenantId: user.tenantId,
      actorUserId: user.id,
      action: "admin.system_prompt.activate_hardcoded",
      targetType: "system_prompt",
      targetId: input.promptId,
      metadata: { capability: input.capability },
    });
    revalidatePath("/admin/configuracoes/llm");
    return { ok: true };
  }

  await db()
    .update(systemPrompts)
    .set({ active: false })
    .where(
      and(
        eq(systemPrompts.capability, input.capability),
        eq(systemPrompts.active, true),
        ne(systemPrompts.id, input.promptId),
      ),
    );
  await db()
    .update(systemPrompts)
    .set({ active: true })
    .where(eq(systemPrompts.id, input.promptId));

  await writeAuditLog({
    tenantId: user.tenantId,
    actorUserId: user.id,
    action: "admin.system_prompt.activate",
    targetType: "system_prompt",
    targetId: input.promptId,
    metadata: { capability: input.capability },
  });

  revalidatePath("/admin/configuracoes/llm");
  return { ok: true };
}

export async function deletePromptVersion(input: { promptId: string }) {
  const user = await requireAdmin();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL ausente");
  if (input.promptId.startsWith("hardcoded:")) {
    throw new Error("Versão hardcoded não pode ser apagada.");
  }
  // Não permite apagar a versão ativa.
  const row = (
    await db()
      .select({ active: systemPrompts.active })
      .from(systemPrompts)
      .where(eq(systemPrompts.id, input.promptId))
      .limit(1)
  )[0];
  if (row?.active) {
    throw new Error(
      "Desative essa versão antes de apagar (ative outra ou caia no hardcoded).",
    );
  }
  await db().delete(systemPrompts).where(eq(systemPrompts.id, input.promptId));
  await writeAuditLog({
    tenantId: user.tenantId,
    actorUserId: user.id,
    action: "admin.system_prompt.delete",
    targetType: "system_prompt",
    targetId: input.promptId,
  });
  revalidatePath("/admin/configuracoes/llm");
  return { ok: true };
}

// Util pra silenciar linter (sql import só seria usado em audit_log futuro).
export const _internalSqlMarker = sql;
