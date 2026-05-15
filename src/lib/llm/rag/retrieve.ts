/**
 * RAG retrieval — busca trechos de material da turma relevantes pra pergunta.
 *
 * Fluxo:
 *   1. Embedda a query do aluno (`text-embedding-3-small`, 1536 dims).
 *   2. Query pgvector com cosine distance (`<=>`) filtrando por tenant+turma
 *      e só nos `documents` com kind='class_material' e status='ready'.
 *   3. Retorna top-K acima do threshold (1 - cosine_distance = similarity).
 *
 * Resiliência:
 *   - Sem DATABASE_URL ou erro → retorna `[]` (chat segue sem contexto extra).
 *   - Sem OPENAI_API_KEY → embed mock retorna vetor random, similarity
 *     vai dar lixo, mas não derruba o chat.
 *
 * Atenção: o `score` aqui é **1 - cosine_distance**, ou seja, quanto maior,
 * mais parecido.
 */

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { embedText } from "@/lib/llm/providers/openai-embeddings";

export interface RetrievedChunk {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  score: number;
}

interface RetrieveInput {
  tenantId: string;
  classId: string;
  query: string;
  limit?: number;
  threshold?: number;
}

export async function retrieveForClass({
  tenantId,
  classId,
  query,
  limit = 3,
  threshold = 0.35,
}: RetrieveInput): Promise<RetrievedChunk[]> {
  if (!process.env.DATABASE_URL) return [];
  if (!query.trim()) return [];

  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(query);
  } catch (err) {
    console.error("[rag/retrieve] embed failed:", err);
    return [];
  }

  const literal = `[${queryEmbedding.join(",")}]`;

  try {
    const rows = (await db().execute(sql`
      SELECT
        c.document_id        AS "documentId",
        d.name               AS "documentName",
        c.chunk_index        AS "chunkIndex",
        c.content            AS "content",
        1 - (c.embedding <=> ${literal}::vector) AS "score"
      FROM chunks c
      JOIN documents d ON d.id = c.document_id
      WHERE d.tenant_id = ${tenantId}
        AND d.class_id  = ${classId}
        AND d.kind = 'class_material'
        AND d.status = 'ready'
        AND c.embedding IS NOT NULL
      ORDER BY c.embedding <=> ${literal}::vector ASC
      LIMIT ${limit}
    `)) as unknown as { rows: RetrievedChunk[] };

    const list = rows.rows ?? (rows as unknown as RetrievedChunk[]);
    return list.filter((r) => r.score >= threshold);
  } catch (err) {
    console.error("[rag/retrieve] query failed:", err);
    return [];
  }
}
