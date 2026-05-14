import { Plus } from "lucide-react";
import { Avatar, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";

const FOLDERS = [
  { l: "Todos abertos", n: 14, active: true },
  { l: "Atribuídos a mim", n: 5 },
  { l: "Não respondidos", n: 3 },
  { l: "Aguardando cliente", n: 4 },
  { l: "Resolvidos hoje", n: 8 },
];

const TICKETS = [
  { p: "Lavras-MG", t: "Trial expira em 8 dias e secretária não respondeu", d: "há 2h", sev: "alta", a: "BA" },
  { p: "Varginha-MG", t: "NF-e da fatura abril não chegou no e-mail", d: "há 4h", sev: "media", a: "CR" },
  { p: "Pouso Alegre-MG", t: "Solicitação: integrar com sistema acadêmico atual", d: "ontem", sev: "media", a: "BA" },
  { p: "Alfenas-MG", t: "Profe Mari deu resposta incorreta em frações — checar prompt", d: "ontem", sev: "media", a: "LF" },
  { p: "Três Corações-MG", t: "Cadastro em massa de 5.120 alunos travou em 78%", d: "2 dias", sev: "baixa", a: "LF" },
  { p: "Itajubá-MG", t: "Pedido de exportação de IDEB consolidado anual", d: "2 dias", sev: "baixa", a: "BA" },
];

const ONBOARDINGS = [
  { p: "Lavras-MG", step: 1, total: 5 },
  { p: "Machado-MG", step: 3, total: 5 },
];

const MEETINGS = [
  { d: "Hoje · 14h", p: "Pouso Alegre-MG", t: "QBR · trimestral" },
  { d: "Sex · 09h", p: "Lavras-MG", t: "Conversão trial → contrato" },
  { d: "Sex · 15h", p: "Machado-MG", t: "Kickoff onboarding" },
];

const SEV_COLOR: Record<string, string> = {
  alta: "var(--danger)",
  media: "var(--warning)",
  baixa: "var(--text-faint)",
};

export default function SuportePage() {
  return (
    <>
      <PageHeader
        title="Suporte & CSM"
        subtitle="Tickets · onboardings · reuniões agendadas"
        actions={<Button icon={<Plus size={14} />}>Novo ticket</Button>}
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[260px_1fr_320px]">
          {/* Folders */}
          <Card className="p-4">
            <div className="text-text-faint text-[11.5px] font-semibold tracking-wider uppercase">
              Inbox
            </div>
            <div className="mt-2.5 flex flex-col gap-0.5">
              {FOLDERS.map((f) => (
                <div
                  key={f.l}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] ${
                    f.active
                      ? "bg-primary-soft text-primary font-medium"
                      : "text-text-muted"
                  }`}
                >
                  <span className="flex-1">{f.l}</span>
                  <span
                    className="text-text-faint text-[11px]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {f.n}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Tickets */}
          <Card className="p-0">
            <div className="border-border border-b px-4 py-3 text-[13px] font-semibold">
              Tickets · prioridade
            </div>
            {TICKETS.map((tk, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-4 py-3.5 ${
                  i < TICKETS.length - 1 ? "border-border border-b" : ""
                }`}
              >
                <div
                  className="w-1 self-stretch rounded"
                  style={{ background: SEV_COLOR[tk.sev] }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-text-muted text-xs font-medium">
                      {tk.p}
                    </span>
                    <span className="text-text-faint text-[11px]">{tk.d}</span>
                  </div>
                  <div className="mt-0.5 text-[13.5px] leading-snug">
                    {tk.t}
                  </div>
                </div>
                <Avatar name={`${tk.a} ${tk.a}`} size={26} />
              </div>
            ))}
          </Card>

          {/* Side */}
          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <div className="text-sm font-semibold">
                Onboardings em andamento
              </div>
              {ONBOARDINGS.map((o) => (
                <div
                  key={o.p}
                  className="border-border py-2.5 not-last:border-b"
                >
                  <div className="flex justify-between">
                    <span className="text-[12.5px] font-medium">{o.p}</span>
                    <span
                      className="text-text-muted text-[11px]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {o.step}/{o.total}
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    {Array.from({ length: o.total }).map((_, i) => (
                      <div
                        key={i}
                        className="h-0.5 flex-1 rounded"
                        style={{
                          background:
                            i < o.step ? "var(--primary)" : "var(--surface-3)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </Card>

            <Card className="p-5">
              <div className="text-sm font-semibold">Reuniões esta semana</div>
              {MEETINGS.map((r, i) => (
                <div
                  key={i}
                  className="border-border py-2 not-last:border-b"
                >
                  <div className="text-text-muted text-[11.5px]">{r.d}</div>
                  <div className="mt-0.5 text-[13px] font-medium">{r.p}</div>
                  <div className="text-text-muted text-[11.5px]">{r.t}</div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
