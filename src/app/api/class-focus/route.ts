import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/tenants/server";
import { saveClassFocus } from "@/lib/teacher/focus-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (
    role !== "professor" &&
    role !== "coordenador" &&
    role !== "diretor" &&
    role !== "orientador"
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    classId?: unknown;
    habilityCodes?: unknown;
  };
  const classId = typeof body.classId === "string" ? body.classId : "";
  const habilityCodes = Array.isArray(body.habilityCodes)
    ? body.habilityCodes.filter(
        (code): code is string => typeof code === "string",
      )
    : [];

  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }

  const tenant = await getCurrentTenant();
  const result = await saveClassFocus({
    actor: session.user,
    classId,
    habilityCodes,
    tenantId: tenant.id,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
