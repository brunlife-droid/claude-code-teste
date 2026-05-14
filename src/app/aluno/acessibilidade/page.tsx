import { ArrowUp, Info, Mic, Moon, X } from "lucide-react";
import { Card } from "@/components/ui";
import { getCurrentTenant } from "@/lib/tenants/server";

const MODES = [
  {
    id: "easy-read",
    icon: "📖",
    title: "Leitura facilitada",
    desc: "Texto maior, espaçamento generoso, frases mais curtas.",
    active: false,
  },
  {
    id: "dyslexia",
    icon: "🔤",
    title: "Modo dislexia",
    desc: "Fonte Atkinson Hyperlegible, mais espaço entre letras e linhas.",
    active: true,
  },
  {
    id: "tdah",
    icon: "🎯",
    title: "Modo TDAH",
    desc: "Sessões em blocos curtos, movimento reduzido, foco em uma tarefa.",
    active: false,
  },
];

const SETTINGS = [
  { label: "Tamanho da fonte", value: "Médio", Icon: ArrowUp },
  { label: "Modo escuro", value: "Automático", Icon: Moon },
  { label: "Voz da tutora", value: "Profe Mari · BR", Icon: Mic },
  { label: "Ler em voz alta automaticamente", value: "Não", Icon: X },
];

export default async function AcessibilidadePage() {
  const tenant = await getCurrentTenant();

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Acessibilidade
          </h1>
          <p className="text-text-muted mt-2 max-w-xl text-[15px] leading-relaxed">
            Configure seu jeito de aprender. A {tenant.tutorName} lembra das
            suas escolhas — no celular, no computador da escola, no WhatsApp.
          </p>
        </header>

        {/* Modos de leitura */}
        <section className="mt-10">
          <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
            Modos de leitura
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className="bg-surface rounded-xl border p-5 text-left transition-all hover:shadow-[var(--shadow-sm)]"
                style={{
                  borderColor: m.active ? tenant.primary : "var(--border)",
                  boxShadow: m.active ? `0 0 0 3px ${tenant.primarySoft}` : undefined,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{m.icon}</div>
                  <div
                    className="relative h-[22px] w-9 shrink-0 rounded-full transition-colors"
                    style={{
                      background: m.active
                        ? tenant.primary
                        : "var(--border-strong)",
                    }}
                  >
                    <div
                      className="absolute top-0.5 size-[18px] rounded-full bg-white transition-all"
                      style={{ left: m.active ? 16 : 2 }}
                    />
                  </div>
                </div>
                <div className="mt-4 text-[14.5px] font-semibold">
                  {m.title}
                </div>
                <p className="text-text-muted mt-1.5 text-[13px] leading-relaxed">
                  {m.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Aparência */}
        <section className="mt-10">
          <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
            Aparência
          </div>
          <Card className="mt-3 p-2">
            {SETTINGS.map((s, i) => {
              const Icon = s.Icon;
              return (
                <button
                  key={s.label}
                  type="button"
                  className={`hover:bg-surface-2 flex w-full items-center justify-between rounded-md px-3 py-3.5 text-left ${
                    i < SETTINGS.length - 1 ? "border-border border-b" : ""
                  }`}
                >
                  <span className="text-[14.5px]">{s.label}</span>
                  <span className="text-text-muted inline-flex items-center gap-2 text-[13px]">
                    <Icon size={14} />
                    {s.value}
                  </span>
                </button>
              );
            })}
          </Card>
        </section>

        {/* Info LGPD */}
        <Card
          className="mt-8 flex items-start gap-3 p-5"
          style={{ background: tenant.primarySoft, borderColor: tenant.primaryBorder }}
        >
          <Info size={16} style={{ color: tenant.primary }} className="mt-0.5 shrink-0" />
          <div className="text-sm leading-relaxed" style={{ color: tenant.primary }}>
            Suas escolhas são pessoais e ficam guardadas com segurança. Seus
            responsáveis podem ver e ajustar a qualquer momento, em
            conformidade com a LGPD.
          </div>
        </Card>
      </div>
    </div>
  );
}
