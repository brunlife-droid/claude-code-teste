/**
 * Queries de foco pedagógico e materiais da turma (server-only).
 *
 * Padrão consistente com `teacher/queries.ts`:
 *   - Graceful: sem DATABASE_URL ou erro → arrays vazios.
 *   - `ensureNetworkSeeded()` no entry point (já chamado por outras telas
 *     do professor).
 */

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  classFocusSkills,
  documents,
  habilities,
} from "@/lib/db/schema";

function dbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export interface FocusSkill {
  code: string;
  area: string;
  description: string;
  grade: string | null;
}

export async function loadClassFocus(input: {
  tenantId: string;
  classId: string;
}): Promise<FocusSkill[]> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db()
      .select({
        code: habilities.code,
        area: habilities.area,
        description: habilities.description,
        grade: habilities.grade,
      })
      .from(classFocusSkills)
      .innerJoin(habilities, eq(habilities.code, classFocusSkills.habilityCode))
      .where(
        and(
          eq(classFocusSkills.classId, input.classId),
          eq(classFocusSkills.tenantId, input.tenantId),
        ),
      );
    return rows;
  } catch (err) {
    console.error("[material-queries] loadClassFocus failed:", err);
    return [];
  }
}

export async function loadAvailableHabilities(): Promise<FocusSkill[]> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db()
      .select({
        code: habilities.code,
        area: habilities.area,
        description: habilities.description,
        grade: habilities.grade,
      })
      .from(habilities);
    return rows.sort((a, b) => a.code.localeCompare(b.code));
  } catch (err) {
    console.error("[material-queries] loadAvailableHabilities failed:", err);
    return [];
  }
}

export interface ClassMaterial {
  id: string;
  name: string;
  type: string;
  status: string;
  sizeBytes: number | null;
  error: string | null;
  sourceUrl: string | null;
  indexedAt: Date | null;
  createdAt: Date;
}

export async function loadClassMaterials(input: {
  tenantId: string;
  classId: string;
}): Promise<ClassMaterial[]> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db()
      .select({
        id: documents.id,
        name: documents.name,
        type: documents.type,
        status: documents.status,
        sizeBytes: documents.sizeBytes,
        error: documents.error,
        sourceUrl: documents.sourceUrl,
        indexedAt: documents.indexedAt,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(
        and(
          eq(documents.classId, input.classId),
          eq(documents.tenantId, input.tenantId),
          eq(documents.kind, "class_material"),
        ),
      )
      .orderBy(desc(documents.createdAt));
    return rows;
  } catch (err) {
    console.error("[material-queries] loadClassMaterials failed:", err);
    return [];
  }
}
