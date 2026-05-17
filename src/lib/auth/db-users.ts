import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { memberships, users } from "@/lib/db/schema";
import { withRlsTenant } from "@/lib/db/rls-context";
import type { UserRole } from "./types";
import { verifyPassword } from "./password";
import { writeAuditLog } from "@/lib/audit/log";

export interface AuthorizedDbUser {
  id: string;
  email: string | null;
  name: string;
  image: string | null;
  role: UserRole;
  tenantId: string;
}

export async function authorizeDbUser(input: {
  email: string;
  password: string;
  tenantId?: string | null;
}): Promise<AuthorizedDbUser | null> {
  if (!process.env.DATABASE_URL) return null;

  return withRlsTenant(input.tenantId, async () => {
    try {
      const user = (
        await db()
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            image: users.image,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, input.email))
          .limit(1)
      )[0];
      if (!user || !verifyPassword(input.password, user.passwordHash)) return null;

      const membershipWhere = input.tenantId
        ? and(
            eq(memberships.userId, user.id),
            eq(memberships.tenantId, input.tenantId),
          )
        : eq(memberships.userId, user.id);

      const membership = (
        await db()
          .select({
            role: memberships.role,
            tenantId: memberships.tenantId,
          })
          .from(memberships)
          .where(membershipWhere)
          .limit(1)
      )[0];
      if (!membership) return null;

      await writeAuditLog({
        tenantId: membership.tenantId,
        actorUserId: user.id,
        action: "auth.login",
        targetType: "user",
        targetId: user.id,
        metadata: { provider: "credentials-db" },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: membership.role as UserRole,
        tenantId: membership.tenantId,
      };
    } catch (err) {
      console.warn("[auth/db-users] authorize failed:", err);
      return null;
    }
  });
}
