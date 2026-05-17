/**
 * Provider de embeddings via OpenAI direto.
 *
 * OpenRouter nao roteia `text-embedding-3-small`, entao embeddings ficam na
 * chave OpenAI. Em dev/demo sem chave, usamos vetor mock; em producao isso
 * passa a falhar explicitamente para nao degradar o RAG em silencio.
 */

import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { assertMockFallbackAllowed } from "@/lib/runtime/mode";

const DIMS = 1536;

function client() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY ausente - embeddings precisam da chave OpenAI");
  }
  return createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function mockVector(): number[] {
  return Array.from({ length: DIMS }, () => Math.random() * 2 - 1);
}

export async function embedText(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    assertMockFallbackAllowed("Embeddings mock", "OPENAI_API_KEY ausente");
    console.warn("[embeddings] OPENAI_API_KEY ausente - usando vetor mock");
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
    assertMockFallbackAllowed("Embeddings mock", "OPENAI_API_KEY ausente");
    console.warn("[embeddings] OPENAI_API_KEY ausente - usando vetores mock");
    return texts.map(() => mockVector());
  }
  const { embeddings } = await embedMany({
    model: client().textEmbeddingModel("text-embedding-3-small"),
    values: texts,
  });
  return embeddings;
}
