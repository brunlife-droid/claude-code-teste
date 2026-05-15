/**
 * Provider de embeddings via OpenAI direto.
 *
 * Por que OpenAI direto e não OpenRouter: o OpenRouter ainda não roteia
 * `text-embedding-3-small`. Custo é desprezível (~$0.02 por 1M tokens),
 * então não tem impacto financeiro real esse desvio.
 *
 * Capability associada: `embeddings_rag` (em `routes.ts`).
 *
 * Gracefully retorna vetores aleatórios em modo mock — útil pra dev sem
 * OPENAI_API_KEY, mas a similaridade não vai fazer sentido.
 */

import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const DIMS = 1536;

function client() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY ausente — embeddings precisam da chave OpenAI");
  }
  return createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function mockVector(): number[] {
  // Vetor pseudoaleatório só pra não quebrar fluxo em dev.
  return Array.from({ length: DIMS }, () => Math.random() * 2 - 1);
}

export async function embedText(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[embeddings] OPENAI_API_KEY ausente — usando vetor mock");
    return mockVector();
  }
  const { embedding } = await embed({
    model: client().textEmbeddingModel("text-embedding-3-small"),
    value: text,
  });
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (!process.env.OPENAI_API_KEY) {
    console.warn("[embeddings] OPENAI_API_KEY ausente — usando vetores mock");
    return texts.map(() => mockVector());
  }
  const { embeddings } = await embedMany({
    model: client().textEmbeddingModel("text-embedding-3-small"),
    values: texts,
  });
  return embeddings;
}
