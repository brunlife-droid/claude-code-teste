import { Megaphone, Send } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";
import {
  loadNetworkKpis,
  loadSecretariaAnnouncements,
} from "@/lib/secretaria/queries";
import { createSecretariaAnnouncement } from "@/lib/secretaria/actions";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function readPercent(readCount: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((readCount / total) * 100)}%`;
}

export default async function MuralSecretariaPage() {
  const tenant = await getCurrentTenant();
  const [announcements, kpis] = await Promise.all([
    loadSecretariaAnnouncements({ tenantId: tenant.id }),
    loadNetworkKpis({ tenantId: tenant.id }),
  ]);

  return (
    <>
      <PageHeader
        title="Mural de comunicacao"
        subtitle="Comunicados oficiais da SEMED publicados para os alunos do tenant"
      />
      <PageBody>
        <Card className="p-5">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold">Novo comunicado</div>
            <p className="text-text-muted text-xs">
              O envio grava no Postgres, aparece no mural do aluno e gera
              auditoria da Secretaria.
            </p>
          </div>

          <form action={createSecretariaAnnouncement} className="mt-4 grid gap-3">
            <input
              name="title"
              required
              maxLength={120}
              className="border-border-strong bg-surface h-10 rounded-md border px-3 text-sm outline-none focus:border-primary"
              placeholder="Titulo do comunicado"
            />
            <textarea
              name="body"
              required
              rows={4}
              className="border-border-strong bg-surface resize-none rounded-md border px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Mensagem para os alunos e familias..."
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-text-muted flex items-center gap-2 text-xs">
                Prioridade
                <select
                  name="priority"
                  defaultValue="media"
                  className="border-border-strong bg-surface h-9 rounded-md border px-2 text-sm text-text outline-none"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </label>
              <label className="text-text-muted flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="requiresConfirmation"
                  className="size-4 rounded border-border-strong"
                />
                Exigir confirmacao de leitura
              </label>
              <Button type="submit" icon={<Send size={14} />} className="ml-auto">
                Publicar
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-0">
          {announcements.length === 0 ? (
            <div className="p-8 text-sm text-text-muted">
              Nenhum comunicado publicado ainda.
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {[
                    "Comunicado",
                    "Origem",
                    "Autor",
                    "Data",
                    "Leitura",
                    "Prioridade",
                  ].map((h) => (
                    <th
                      key={h}
                      className="bg-surface-2 text-text-faint border-border border-b px-4 py-2 text-left text-[11px] font-medium tracking-wide uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-surface-2">
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-soft text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                          <Megaphone size={14} />
                        </div>
                        <div>
                          <div className="font-medium">{announcement.title}</div>
                          {announcement.requiresConfirmation && (
                            <div className="text-text-faint mt-0.5 text-[11px]">
                              Exige confirmacao
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                      {announcement.origin}
                    </td>
                    <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                      {announcement.authorName}
                    </td>
                    <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                      {formatDate(announcement.publishedAt)}
                    </td>
                    <td
                      className="border-border h-12 border-b px-4 align-middle text-xs"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {readPercent(announcement.readCount, kpis.studentsTotal)}
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <Badge
                        tone={
                          announcement.priority === "alta"
                            ? "danger"
                            : announcement.priority === "baixa"
                              ? "neutral"
                              : "warning"
                        }
                      >
                        {announcement.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </PageBody>
    </>
  );
}
