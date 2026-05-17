import Link from "next/link";
import { AlertTriangle, Building, Check, School, Users } from "lucide-react";
import { Badge, Button, Card, Chip } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { markAnnouncementRead } from "@/lib/student/actions";
import {
  loadStudentAnnouncements,
  type StudentAnnouncement,
} from "@/lib/student/queries";
import { getCurrentTenant } from "@/lib/tenants/server";

const FILTERS = [
  { label: "Tudo", value: "tudo" },
  { label: "Secretaria", value: "secretaria" },
  { label: "Escola", value: "escola" },
  { label: "Turma", value: "turma" },
] as const;

type PageProps = {
  searchParams: Promise<{ f?: string }>;
};

export default async function MuralPage({ searchParams }: PageProps) {
  const user = await requireRole("aluno", "responsavel");
  const tenant = await getCurrentTenant();
  const params = await searchParams;
  const filter = normalizeFilter(params.f);
  const announcements = await loadStudentAnnouncements({
    userId: user.id,
    tenantId: tenant.id,
    filter,
  });
  const unread = announcements.filter((item) => !item.read).length;

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Recados</h1>
            <p className="text-text-muted mt-2 text-[15px]">
              Comunicados da secretaria, escola e turma. Confirme a leitura
              quando o assunto for importante.
            </p>
          </div>
          <Badge tone={unread > 0 ? "primary" : "neutral"}>
            {unread} {unread === 1 ? "novo" : "novos"}
          </Badge>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const active = item.value === filter;
            return (
              <Link
                key={item.value}
                href={
                  item.value === "tudo"
                    ? "/aluno/mural"
                    : `/aluno/mural?f=${item.value}`
                }
              >
                <Chip
                  className="cursor-pointer"
                  style={
                    active
                      ? {
                          background: tenant.primarySoft,
                          color: tenant.primary,
                          borderColor: "transparent",
                        }
                      : undefined
                  }
                >
                  {item.label}
                </Chip>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-2.5">
          {announcements.length === 0 ? (
            <Card className="p-6 text-sm text-text-muted">
              Nenhum recado encontrado para esse filtro.
            </Card>
          ) : (
            announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                tenant={tenant}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AnnouncementCard({
  announcement,
  tenant,
}: {
  announcement: StudentAnnouncement;
  tenant: Awaited<ReturnType<typeof getCurrentTenant>>;
}) {
  const Icon =
    announcement.origin === "secretaria"
      ? Building
      : announcement.origin === "escola"
        ? School
        : Users;
  const iconBg =
    announcement.origin === "secretaria"
      ? { bg: "var(--secondary-soft)", fg: "var(--warning-fg)" }
      : announcement.origin === "escola"
        ? { bg: tenant.primarySoft, fg: tenant.primary }
        : { bg: "var(--success-soft)", fg: "var(--success-fg)" };
  const pendingConfirmation =
    announcement.requiresConfirmation && !announcement.confirmed;
  const pendingRead = !announcement.read || pendingConfirmation;

  return (
    <Card
      className={`p-5 ${
        pendingRead
          ? "border-primary-border bg-primary-soft/30"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex gap-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: iconBg.bg, color: iconBg.fg }}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-text-muted text-[12.5px]">
              {announcement.originLabel} - {announcement.authorName}
            </span>
            <span className="text-text-faint text-[12.5px]">
              {announcement.publishedLabel}
            </span>
          </div>
          <div
            className={`mt-1 text-[15px] ${
              pendingRead ? "font-semibold" : ""
            }`}
          >
            {announcement.title}
          </div>
          <p className="text-text-muted mt-2 text-sm leading-relaxed">
            {announcement.body}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {announcement.priority === "alta" && (
              <Chip className="bg-danger-soft text-danger-fg border-transparent text-[11px]">
                <AlertTriangle size={10} />
                Importante
              </Chip>
            )}
            {announcement.confirmed ? (
              <Badge tone="success" icon={<Check size={11} />}>
                Leitura confirmada
              </Badge>
            ) : announcement.read ? (
              <Badge tone="neutral">Lido</Badge>
            ) : null}
            {pendingRead && (
              <form action={markAnnouncementRead}>
                <input
                  type="hidden"
                  name="announcementId"
                  value={announcement.id}
                />
                <input
                  type="hidden"
                  name="confirm"
                  value={announcement.requiresConfirmation ? "true" : "false"}
                />
                <Button size="sm" variant="secondary">
                  {announcement.requiresConfirmation
                    ? "Confirmar leitura"
                    : "Marcar como lido"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function normalizeFilter(filter: string | undefined) {
  if (filter === "secretaria" || filter === "escola" || filter === "turma") {
    return filter;
  }
  return "tudo";
}
