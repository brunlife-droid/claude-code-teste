import type { Metadata } from "next";
import Link from "next/link";
import { AlunoSidebar } from "@/components/shell";
import {
  Brain,
  Layers,
  Megaphone,
  MessageSquarePlus,
  Settings,
} from "lucide-react";
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
    <div className="app-shell grid h-dvh grid-cols-1 overflow-hidden lg:grid-cols-[280px_1fr]">
      <div className="hidden min-h-0 lg:block">
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
      </div>
      <main className="app-main flex min-h-0 flex-col overflow-hidden pb-[64px] lg:pb-0">
        {children}
      </main>
      <AlunoMobileNav unreadAnnouncements={unreadAnnouncements} />
    </div>
  );
}

function AlunoMobileNav({
  unreadAnnouncements,
}: {
  unreadAnnouncements: number;
}) {
  const items = [
    { href: "/aluno/chat", label: "Chat", icon: MessageSquarePlus },
    { href: "/aluno/trilha", label: "Trilha", icon: Layers },
    { href: "/aluno/estudo", label: "Estudo", icon: Brain },
    { href: "/aluno/mural", label: "Recados", icon: Megaphone },
    { href: "/aluno/acessibilidade", label: "Perfil", icon: Settings },
  ];

  return (
    <nav className="border-border bg-surface-raised/95 fixed inset-x-0 bottom-0 z-20 grid h-16 grid-cols-5 border-t shadow-[0_-10px_28px_rgba(16,24,40,0.08)] lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const badge = item.href === "/aluno/mural" ? unreadAnnouncements : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="text-text-muted hover:bg-surface-tint hover:text-primary relative flex flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium transition-colors"
          >
            <Icon size={17} />
            <span>{item.label}</span>
            {badge > 0 && (
              <span className="bg-primary text-primary-fg absolute top-1.5 right-[22%] rounded-full px-1.5 py-0.5 text-[9px] leading-none">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
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
