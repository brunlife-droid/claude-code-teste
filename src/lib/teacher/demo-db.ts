import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  classes,
  habilities,
  schools,
  tenants,
  users,
} from "@/lib/db/schema";
import { TENANTS } from "@/lib/tenants/config";
import { HABILIDADES_BNCC } from "@/lib/mocks";
import type { NexusSessionUser } from "@/lib/auth/types";

export const DEMO_TENANT_ID = "alfenas";
export const DEMO_SCHOOL_ID = "school-demo-alfenas";
export const DEMO_CLASS_ID = "class-demo-7a";

export async function ensureDemoClassScope(
  classId: string,
  tenantId: string,
) {
  if (classId !== DEMO_CLASS_ID || tenantId !== DEMO_TENANT_ID) return;
  const tenant = TENANTS.alfenas;

  await db()
    .insert(tenants)
    .values({
      id: tenant.id,
      subdomain: tenant.subdomain,
      name: tenant.name,
      short: tenant.short,
      uf: tenant.uf,
      monogram: tenant.monogram,
      status: "ativo" as const,
      tutorName: tenant.tutorName,
      tutorFullName: tenant.tutorFull,
      primary: tenant.primary,
      primaryHover: tenant.primaryHover,
      primaryFg: tenant.primaryFg,
      primarySoft: tenant.primarySoft,
      primaryBorder: tenant.primaryBorder,
      secondary: tenant.secondary,
      secondarySoft: tenant.secondarySoft,
      secondaryFg: tenant.secondaryFg,
    })
    .onConflictDoNothing();

  await db()
    .insert(schools)
    .values({
      id: DEMO_SCHOOL_ID,
      tenantId: DEMO_TENANT_ID,
      name: "EM Padre Eustáquio",
    })
    .onConflictDoNothing();

  await db()
    .insert(classes)
    .values({
      id: DEMO_CLASS_ID,
      tenantId: DEMO_TENANT_ID,
      schoolId: DEMO_SCHOOL_ID,
      name: "7º A",
      grade: "7",
      year: new Date().getFullYear(),
    })
    .onConflictDoNothing();
}

export async function ensureKnownHabilities(codes: string[]) {
  const unique = new Set(codes);
  const known = HABILIDADES_BNCC.filter((h) => unique.has(h.codigo));
  if (known.length === 0) return;

  await db()
    .insert(habilities)
    .values(
      known.map((h) => ({
        code: h.codigo,
        area: h.area,
        description: h.desc,
        grade: "7",
      })),
    )
    .onConflictDoNothing();
}

export async function ensureSessionUserId(
  user: NexusSessionUser,
): Promise<string | null> {
  try {
    await db()
      .insert(users)
      .values({
        id: user.id,
        email: user.email ?? null,
        name: user.name ?? user.email ?? user.id,
        image: user.image ?? null,
      })
      .onConflictDoNothing();

    const row = (
      await db()
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1)
    )[0];
    return row?.id ?? null;
  } catch (err) {
    console.warn("[teacher/demo-db] ensureSessionUserId failed:", err);
    return null;
  }
}
