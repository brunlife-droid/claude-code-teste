import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  CalendarClock,
  Clock3,
  MessageSquare,
  MessageSquarePlus,
  Search,
  Sparkles,
} from "lucide-react";
import { Chip } from "@/components/ui";
import { getCurrentTenant } from "@/lib/tenants/server";
import { requireRole } from "@/lib/auth/session";
import { resolveStudentId } from "@/lib/db/student-resolver";
import { listConversations, type ConversationSummary } from "@/lib/chat/persistence";

const FILTERS = [
  "Tudo",
  "Matemática",
  "Português",
  "Ciências",
  "História",
  "Geografia",
];

interface PageProps {
  searchParams: Promise<{ q?: string; area?: string }>;
}

interface BucketItem {
  id: string;
  area: string;
  tema: string;
  hora: string;
}

interface Bucket {
  title: string;
  items: BucketItem[];
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function bucketLabel(updatedAt: Date, today: Date): string {
  const day = startOfDay(updatedAt);
  const todayStart = startOfDay(today);
  const diffDays = Math.floor(
    (todayStart.getTime() - day.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return "Esta semana";
  if (diffDays < 30) return "Este mês";
  return "Anteriores";
}

function formatHora(updatedAt: Date, today: Date): string {
  const day = startOfDay(updatedAt);
  const todayStart = startOfDay(today);
  const diffDays = Math.floor(
    (todayStart.getTime() - day.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 1) {
    return updatedAt.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return updatedAt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function filterConversations(
  rows: ConversationSummary[],
  input: { query: string; area: string },
): ConversationSummary[] {
  const query = normalize(input.query);
  const area = normalize(input.area);
  return rows.filter((row) => {
    const rowArea = row.area ?? "Conversa";
    const text = normalize(`${row.title ?? ""} ${rowArea}`);
    const matchesQuery = !query || text.includes(query);
    const matchesArea = !area || normalize(rowArea) === area;
    return matchesQuery && matchesArea;
  });
}

function historyHref(input: { query: string; area: string }): string {
  const params = new URLSearchParams();
  if (input.query) params.set("q", input.query);
  if (input.area) params.set("area", input.area);
  const search = params.toString();
  return search ? `/aluno/historico?${search}` : "/aluno/historico";
}

function chatHref(conversationId: string): string {
  return `/aluno/chat?id=${conversationId}`;
}

function studyHref(conversationId: string): string {
  return `/aluno/estudo?conversationId=${conversationId}`;
}

function areaColor(area: string): string {
  const normalizedArea = normalize(area);
  if (normalizedArea === "matematica") return "var(--primary)";
  if (normalizedArea === "portugues") return "var(--accent-rose)";
  if (normalizedArea === "ciencias") return "var(--success)";
  if (normalizedArea === "historia") return "var(--warning)";
  if (normalizedArea === "geografia") return "var(--accent-sky)";
  return "var(--accent-violet)";
}

const BUCKET_ORDER = ["Hoje", "Ontem", "Esta semana", "Este mês", "Anteriores"];

function groupConversations(rows: ConversationSummary[]): Bucket[] {
  const today = new Date();
  const groups = new Map<string, BucketItem[]>();
  for (const row of rows) {
    const label = bucketLabel(row.updatedAt, today);
    const list = groups.get(label) ?? [];
    list.push({
      id: row.id,
      area: row.area ?? "Conversa",
      tema: row.title ?? "(sem título)",
      hora: formatHora(row.updatedAt, today),
    });
    groups.set(label, list);
  }
  return BUCKET_ORDER.filter((label) => groups.has(label)).map((label) => ({
    title: label,
    items: groups.get(label)!,
  }));
}

export default async function HistoricoPage({ searchParams }: PageProps) {
  const user = await requireRole("aluno", "responsavel");
  const tenant = await getCurrentTenant();
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const activeArea = params.area === "Tudo" ? "" : (params.area ?? "").trim();
  const studentId = await resolveStudentId({
    userId: user.id,
    tenantId: tenant.id,
  });
  const rows = studentId
    ? await listConversations({ tenantId: tenant.id, studentId })
    : [];
  const filteredRows = filterConversations(rows, {
    query,
    area: activeArea,
  });
  const buckets = groupConversations(filteredRows);
  const hasActiveFilter = query.length > 0 || activeArea.length > 0;
  const todayCount = rows.filter(
    (row) => bucketLabel(row.updatedAt, new Date()) === "Hoje",
  ).length;
  const areaCount = new Set(rows.map((row) => row.area ?? "Conversa")).size;
  const latest = rows[0] ?? null;

  return (
    <div className="scroll-thin relative isolate h-full overflow-y-auto">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, #ffffff) 0%, #f8fbff 42%, color-mix(in srgb, var(--secondary) 10%, #ffffff) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.26]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--primary) 20%, transparent) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage:
            "linear-gradient(180deg, black 0, black 420px, transparent 100%)",
        }}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <header className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
          <section className="rounded-lg border border-white/72 bg-white/80 p-5 shadow-[0_18px_50px_rgba(16,24,40,0.10)] backdrop-blur-xl sm:p-6">
            <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
              Linha do tempo - {tenant.short}
            </div>
            <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Materiais e conversas
                </h1>
                <p className="text-text-muted mt-2 max-w-2xl text-[15px] leading-relaxed">
                  Volte para uma dúvida, transforme uma conversa em treino ou
                  encontre o assunto que precisa revisar.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/aluno/chat"
                  className="lift-on-hover inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium shadow-[var(--shadow-sm)]"
                  style={{ background: tenant.primary, color: tenant.primaryFg }}
                >
                  <MessageSquarePlus size={16} />
                  Nova conversa
                </Link>
                <Link
                  href="/aluno/estudo"
                  className="border-primary-border bg-primary-soft text-primary lift-on-hover inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium"
                >
                  <Brain size={16} />
                  Estudo ativo
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <HeroStat
                icon={MessageSquare}
                label="conversas salvas"
                value={String(rows.length)}
                color={tenant.primary}
              />
              <HeroStat
                icon={Clock3}
                label="movimentos hoje"
                value={String(todayCount)}
                color="var(--accent-sky)"
              />
              <HeroStat
                icon={BookOpenCheck}
                label="áreas estudadas"
                value={String(areaCount)}
                color="var(--success)"
              />
            </div>
          </section>

          <LatestConversationCard
            latest={latest}
            tenantPrimary={tenant.primary}
            tenantPrimaryFg={tenant.primaryFg}
            tenantSoft={tenant.primarySoft}
          />
        </header>

        <section className="rounded-lg border border-white/72 bg-white/78 p-4 shadow-[0_16px_42px_rgba(16,24,40,0.08)] backdrop-blur-xl">
          <form className="relative" action="/aluno/historico">
            <Search
              size={16}
              className="text-text-faint absolute top-1/2 left-4 -translate-y-1/2"
            />
            {activeArea && <input type="hidden" name="area" value={activeArea} />}
            <input
              name="q"
              defaultValue={query}
              className="border-border-strong bg-white/88 placeholder:text-text-faint focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-soft)] h-12 w-full rounded-lg border pr-4 pl-11 text-[15px] outline-none transition-all"
              placeholder="Buscar tema, palavra-chave..."
            />
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const value = f === "Tudo" ? "" : f;
              const active = value === activeArea;
              return (
                <Link
                  key={f}
                  href={historyHref({ query, area: value })}
                  aria-current={active ? "page" : undefined}
                >
                  <Chip
                    className="cursor-pointer bg-white/76 shadow-[var(--shadow-xs)]"
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
                    {f}
                  </Chip>
                </Link>
              );
            })}
            {hasActiveFilter && (
              <Link
                href="/aluno/historico"
                className="text-text-faint hover:text-text-muted inline-flex items-center px-2 text-xs"
              >
                Limpar filtros
              </Link>
            )}
          </div>
        </section>

        {buckets.length === 0 ? (
          <EmptyState
            filtered={hasActiveFilter}
            tenantPrimary={tenant.primary}
            tenantPrimaryFg={tenant.primaryFg}
            tenantSoft={tenant.primarySoft}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {buckets.map((g) => (
              <section
                key={g.title}
                className="rounded-lg border border-white/72 bg-white/76 p-4 shadow-[0_16px_42px_rgba(16,24,40,0.08)] backdrop-blur-xl sm:p-5"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="grid size-8 place-items-center rounded-md"
                    style={{ background: tenant.primarySoft, color: tenant.primary }}
                  >
                    <CalendarClock size={15} />
                  </div>
                  <div>
                    <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
                      {g.title}
                    </div>
                    <div className="text-text-muted text-xs">
                      {g.items.length} conversa{g.items.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {g.items.map((it) => (
                    <article
                      key={it.id}
                      className="group relative overflow-hidden rounded-lg border border-white/72 bg-white/82 p-4 shadow-[var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(16,24,40,0.10)]"
                    >
                      <div
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-1"
                        style={{ background: areaColor(it.area) }}
                      />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full border border-white/76 bg-white/78 px-2.5 py-1 text-[11.5px] font-medium"
                              style={{ color: areaColor(it.area) }}
                            >
                              <span
                                className="size-1.5 rounded-full"
                                style={{ background: areaColor(it.area) }}
                              />
                              {it.area}
                            </span>
                            <span className="text-text-faint text-xs">{it.hora}</span>
                          </div>
                          <Link
                            href={chatHref(it.id)}
                            className="text-text mt-2 block text-[15px] font-semibold leading-snug hover:text-primary"
                          >
                            {it.tema}
                          </Link>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Link
                            href={chatHref(it.id)}
                            className="border-border-strong hover:bg-surface-2 inline-flex h-9 items-center gap-2 rounded-md border bg-white/80 px-3 text-[12.5px] font-medium transition-colors"
                          >
                            Continuar
                            <ArrowRight size={14} />
                          </Link>
                          <Link
                            href={studyHref(it.id)}
                            className="border-primary-border bg-primary-soft text-primary inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12.5px] font-medium transition-colors hover:bg-white"
                          >
                            <Sparkles size={14} />
                            Criar estudo
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  filtered,
  tenantPrimary,
  tenantPrimaryFg,
  tenantSoft,
}: {
  filtered: boolean;
  tenantPrimary: string;
  tenantPrimaryFg: string;
  tenantSoft: string;
}) {
  const title = filtered
    ? "Nenhuma conversa encontrada"
    : "Você ainda não conversou com a sua tutora";
  const description = filtered
    ? "Tente limpar os filtros ou buscar por outra palavra-chave."
    : "Comece por uma dúvida, uma foto da atividade ou um áudio. Depois, tudo fica salvo para virar revisão.";
  const href = filtered ? "/aluno/historico" : "/aluno/chat";
  const cta = filtered ? "Limpar filtros" : "Começar a estudar";

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-white/80 bg-white/64 px-6 py-14 text-center shadow-[0_16px_42px_rgba(16,24,40,0.08)] backdrop-blur-xl">
      <div
        className="flex size-12 items-center justify-center rounded-lg"
        style={{ background: tenantSoft, color: tenantPrimary }}
      >
        <MessageSquare size={20} />
      </div>
      <div className="text-text mt-1 text-[15px] font-medium">{title}</div>
      <p className="text-text-muted max-w-sm text-[13.5px]">{description}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Link
          href={href}
          className="lift-on-hover inline-flex h-10 items-center gap-2 rounded-md px-4 text-[13.5px] font-medium shadow-[var(--shadow-sm)]"
          style={{ background: tenantPrimary, color: tenantPrimaryFg }}
        >
          {cta}
          <ArrowRight size={14} />
        </Link>
        {!filtered && (
          <Link
            href="/aluno/estudo"
            className="border-primary-border bg-primary-soft text-primary inline-flex h-10 items-center gap-2 rounded-md border px-4 text-[13.5px] font-medium"
          >
            <Brain size={14} />
            Abrir estudo ativo
          </Link>
        )}
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-white/72 bg-white/72 p-3 shadow-[var(--shadow-xs)]">
      <div className="flex items-center gap-2">
        <div
          className="grid size-8 place-items-center rounded-md"
          style={{
            background: "color-mix(in srgb, currentColor 12%, #ffffff)",
            color,
          }}
        >
          <Icon size={15} />
        </div>
        <div>
          <div className="text-lg font-semibold leading-none">{value}</div>
          <div className="text-text-muted mt-1 text-[11.5px]">{label}</div>
        </div>
      </div>
    </div>
  );
}

function LatestConversationCard({
  latest,
  tenantPrimary,
  tenantPrimaryFg,
  tenantSoft,
}: {
  latest: ConversationSummary | null;
  tenantPrimary: string;
  tenantPrimaryFg: string;
  tenantSoft: string;
}) {
  if (!latest) {
    return (
      <section className="rounded-lg border border-white/72 bg-white/78 p-5 shadow-[0_18px_50px_rgba(16,24,40,0.09)] backdrop-blur-xl">
        <div
          className="grid size-10 place-items-center rounded-md"
          style={{ background: tenantSoft, color: tenantPrimary }}
        >
          <Sparkles size={18} />
        </div>
        <div className="mt-4 text-sm font-semibold">Primeiro passo pronto</div>
        <p className="text-text-muted mt-2 text-sm leading-relaxed">
          O próximo estudo salvo vai aparecer aqui com atalho direto para
          continuar.
        </p>
        <Link
          href="/aluno/chat"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium shadow-[var(--shadow-sm)]"
          style={{ background: tenantPrimary, color: tenantPrimaryFg }}
        >
          Abrir chat
          <ArrowRight size={14} />
        </Link>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-lg border border-white/72 bg-white/78 p-5 shadow-[0_18px_50px_rgba(16,24,40,0.09)] backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: areaColor(latest.area ?? "Conversa") }}
      />
      <div className="flex items-start gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-md"
          style={{ background: tenantSoft, color: tenantPrimary }}
        >
          <MessageSquare size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
            Última conversa
          </div>
          <Link
            href={chatHref(latest.id)}
            className="mt-1 block text-base font-semibold leading-snug hover:text-primary"
          >
            {latest.title ?? "Conversa com a tutora"}
          </Link>
          <div className="text-text-muted mt-1 text-xs">
            {latest.area ?? "Conversa"} · {formatHora(latest.updatedAt, new Date())}
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <Link
          href={chatHref(latest.id)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium shadow-[var(--shadow-sm)]"
          style={{ background: tenantPrimary, color: tenantPrimaryFg }}
        >
          Continuar
          <ArrowRight size={14} />
        </Link>
        <Link
          href={studyHref(latest.id)}
          className="border-primary-border bg-primary-soft text-primary inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium"
        >
          <Brain size={14} />
          Virar estudo
        </Link>
      </div>
    </section>
  );
}
