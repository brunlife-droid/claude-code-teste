import type { Metadata } from "next";
import { AlunoSidebar } from "@/components/shell";
import { getCurrentTenant } from "@/lib/tenants/server";
import { requireRole } from "@/lib/auth/session";
import { resolveStudentId } from "@/lib/db/student-resolver";
import { listConversations } from "@/lib/chat/persistence";
import { loadStudentAnnouncements } from "@/lib/student/queries";

export const metadata: Metadata = {
  title: "Aluno · Nexus Education",
  robots: { index: false, follow: false },
};

export default async function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("aluno", "responsavel");
  const tenant = await getCurrentTenant();
  const studentId = await resolveStudentId({
    userId: user.id,
    tenantId: tenant.id,
  });
  const [recentConversations, announcements] = await Promise.all([
    studentId
      ? listConversations({
          tenantId: tenant.id,
          studentId,
          limit: 6,
        })
      : Promise.resolve([]),
    loadStudentAnnouncements({
      userId: user.id,
      tenantId: tenant.id,
    }),
  ]);
  const unreadAnnouncements = announcements.filter((a) => !a.read).length;

  return (
    <div className="app-shell grid h-screen grid-cols-[280px_1fr] overflow-hidden">
      <AlunoSidebar
        tenant={tenant}
        studentName={user.name ?? "Aluno"}
        recentConversations={recentConversations.map((conversation) => ({
          id: conversation.id,
          title: conversation.title ?? "Conversa com a tutora",
          area: conversation.area,
          updatedLabel: formatRelativeDate(conversation.updatedAt),
        }))}
        unreadAnnouncements={unreadAnnouncements}
      />
      <main className="app-main flex min-h-0 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

function formatRelativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "agora";
  if (diffH < 24) return `ha ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "ontem";
  if (diffD < 7) return `ha ${diffD}d`;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}
