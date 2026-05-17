import { BookOpen, Check, CircleOff, Focus, Info, Type } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { saveAccessibilityMode } from "@/lib/student/actions";
import { loadStudentContext, type A11yMode } from "@/lib/student/queries";
import { getCurrentTenant } from "@/lib/tenants/server";

const MODES: Array<{
  id: A11yMode;
  Icon: typeof CircleOff;
  title: string;
  desc: string;
}> = [
  {
    id: "none",
    Icon: CircleOff,
    title: "Padrão",
    desc: "Interface regular, sem adaptação ativa.",
  },
  {
    id: "easy-read",
    Icon: BookOpen,
    title: "Leitura facilitada",
    desc: "Texto maior, espaçamento generoso e frases mais diretas.",
  },
  {
    id: "dyslexia",
    Icon: Type,
    title: "Modo dislexia",
    desc: "Leitura com mais respiro e menos ruído visual.",
  },
  {
    id: "tdah",
    Icon: Focus,
    title: "Modo TDAH",
    desc: "Blocos curtos, foco em uma tarefa e movimento reduzido.",
  },
];

export default async function AcessibilidadePage() {
  const user = await requireRole("aluno", "responsavel");
  const tenant = await getCurrentTenant();
  const context = await loadStudentContext({
    userId: user.id,
    tenantId: tenant.id,
  });
  const activeMode = MODES.find((mode) => mode.id === context.a11yMode) ?? MODES[0];

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Acessibilidade
            </h1>
            <p className="text-text-muted mt-2 max-w-xl text-[15px] leading-relaxed">
              Configure seu jeito de aprender. A {tenant.tutorName} lembra da
              escolha no seu perfil de aluno.
            </p>
          </div>
          <Badge tone="primary">{activeMode.title}</Badge>
        </header>

        <section className="mt-10">
          <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
            Modos de leitura
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {MODES.map((mode) => {
              const Icon = mode.Icon;
              const active = mode.id === context.a11yMode;

              return (
                <form key={mode.id} action={saveAccessibilityMode}>
                  <input type="hidden" name="mode" value={mode.id} />
                  <button
                    type="submit"
                    className="bg-surface hover:bg-surface-2 w-full rounded-lg border p-5 text-left transition-all"
                    style={{
                      borderColor: active ? tenant.primary : "var(--border)",
                      boxShadow: active
                        ? `0 0 0 3px ${tenant.primarySoft}`
                        : undefined,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex size-10 items-center justify-center rounded-lg"
                        style={{
                          background: active
                            ? tenant.primarySoft
                            : "var(--surface-2)",
                          color: active ? tenant.primary : "var(--text-muted)",
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <span
                        className="relative h-[22px] w-9 shrink-0 rounded-full transition-colors"
                        style={{
                          background: active
                            ? tenant.primary
                            : "var(--border-strong)",
                        }}
                      >
                        <span
                          className="absolute top-0.5 flex size-[18px] items-center justify-center rounded-full bg-white transition-all"
                          style={{ left: active ? 16 : 2 }}
                        >
                          {active && <Check size={11} color={tenant.primary} />}
                        </span>
                      </span>
                    </div>
                    <div className="mt-4 text-[14.5px] font-semibold">
                      {mode.title}
                    </div>
                    <p className="text-text-muted mt-1.5 text-[13px] leading-relaxed">
                      {mode.desc}
                    </p>
                  </button>
                </form>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
            Preferência ativa
          </div>
          <Card className="mt-3 p-2">
            <PreferenceRow label="Modo salvo" value={activeMode.title} />
            <PreferenceRow
              label="Aplicação"
              value="Chat, trilha, mural e estudo guiado"
            />
            <PreferenceRow
              label="Visível para responsável"
              value="Sim, no registro pedagógico do aluno"
            />
          </Card>
        </section>

        <Card
          className="mt-8 flex items-start gap-3 p-5"
          style={{
            background: tenant.primarySoft,
            borderColor: tenant.primaryBorder,
          }}
        >
          <Info
            size={16}
            style={{ color: tenant.primary }}
            className="mt-0.5 shrink-0"
          />
          <div className="text-sm leading-relaxed" style={{ color: tenant.primary }}>
            Suas escolhas ficam guardadas com segurança e podem ser ajustadas a
            qualquer momento, em conformidade com a LGPD.
          </div>
        </Card>
      </div>
    </div>
  );
}

function PreferenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex items-center justify-between gap-4 border-b px-3 py-3.5 last:border-b-0">
      <span className="text-[14.5px]">{label}</span>
      <span className="text-text-muted text-right text-[13px]">{value}</span>
    </div>
  );
}
