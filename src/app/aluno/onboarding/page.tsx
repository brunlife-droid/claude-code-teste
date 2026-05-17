import Link from "next/link";
import { ArrowRight, Check, Pencil, Shield, Sparkles } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { requireRole } from "@/lib/auth/session";
import { completeStudentOnboarding } from "@/lib/student/actions";
import { loadStudentContext } from "@/lib/student/queries";
import { getCurrentTenant } from "@/lib/tenants/server";

const TERMS = [
  {
    icon: Shield,
    title: "Suas conversas são privadas",
    desc:
      "Você, a escola e seus responsáveis podem acompanhar o que importa para sua aprendizagem.",
  },
  {
    icon: Sparkles,
    title: "Eu guardo apenas o que ajuda você a aprender",
    desc:
      "Dificuldades, avanços e combinados pedagógicos viram memória para eu te orientar melhor.",
  },
  {
    icon: Shield,
    title: "Se aparecer algo grave, a escola será avisada",
    desc:
      "Bullying, violência ou risco emocional precisam de adulto responsável acompanhando.",
  },
];

export default async function OnboardingPage() {
  const user = await requireRole("aluno", "responsavel");
  const tenant = await getCurrentTenant();
  const context = await loadStudentContext({
    userId: user.id,
    tenantId: tenant.id,
  });

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-8 py-12">
        <section className="flex flex-col items-center text-center">
          <div
            className="flex size-24 items-center justify-center rounded-full shadow-[var(--shadow-lg)]"
            style={{
              background: `linear-gradient(135deg, ${tenant.primary} 0%, ${tenant.primary} 60%, ${tenant.secondary} 100%)`,
              color: tenant.primaryFg,
              fontFamily: "var(--font-serif)",
              fontSize: 44,
              fontWeight: 600,
            }}
          >
            {tenant.tutorName[0]}
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Oi, eu sou a {tenant.tutorName}.
          </h1>
          <p className="text-text-muted mt-3 max-w-md text-[15px] leading-relaxed">
            Sou sua tutora da rede municipal de {tenant.short}. Vou estudar com
            você, tirar dúvidas e lembrar do seu jeito de aprender.
          </p>
        </section>

        <form action={completeStudentOnboarding}>
          <section className="mt-12">
            <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
              Passo 1 de 2
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold tracking-tight">
                Confirma se é você?
              </h2>
              {context.hasActiveConsent && (
                <Badge tone="success">Consentimento registrado</Badge>
              )}
            </div>
            <p className="text-text-muted mt-1 text-sm">
              A escola já informou seus dados. Confira e diga como prefere ser
              chamado.
            </p>

            <Card className="mt-5 p-2">
              <DataRow label="Nome" value={context.fullName} />
              <DataRow label="Escola" value={context.schoolName} />
              <DataRow label="Turma" value={context.className} />
              <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="nickname"
                    className="text-text-faint text-[11px] tracking-wider uppercase"
                  >
                    Como você gosta de ser chamado?
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Pencil size={13} className="text-text-faint" />
                    <input
                      id="nickname"
                      name="nickname"
                      defaultValue={context.nickname}
                      className="border-border bg-surface text-text focus:border-primary h-9 w-full rounded-md border px-3 text-sm outline-none"
                      maxLength={60}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section className="mt-12">
            <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
              Passo 2 de 2
            </div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Combinado entre a gente
            </h2>
            <p className="text-text-muted mt-1 text-sm">
              Esse registro fica no histórico LGPD da escola.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              {TERMS.map((term) => {
                const Icon = term.icon;
                return (
                  <Card key={term.title} className="flex gap-4 p-5">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: tenant.primarySoft,
                        color: tenant.primary,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-[14.5px] font-semibold">
                        {term.title}
                      </div>
                      <p className="text-text-muted mt-1 text-sm leading-relaxed">
                        {term.desc}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>

            <label
              htmlFor="guardianName"
              className="text-text-faint mt-5 block text-[11px] tracking-wider uppercase"
            >
              Nome do responsável que autorizou
            </label>
            <input
              id="guardianName"
              name="guardianName"
              defaultValue={context.guardianName ?? ""}
              className="border-border bg-surface text-text focus:border-primary mt-1 h-10 w-full rounded-md border px-3 text-sm outline-none"
              placeholder="Ex.: Maria Aparecida Silva"
              required
            />

            <label className="text-text-muted mt-5 flex cursor-pointer items-start gap-3 text-sm">
              <input
                name="accepted"
                type="checkbox"
                required
                className="sr-only peer"
                defaultChecked={context.hasActiveConsent}
              />
              <span
                className="border-border mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 text-white peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)]"
                style={
                  context.hasActiveConsent
                    ? {
                        background: tenant.primary,
                        borderColor: tenant.primary,
                      }
                    : undefined
                }
              >
                <Check size={12} />
              </span>
              <span>
              Li, entendi e estou de acordo. Meu responsável sabe que eu vou
                usar a {tenant.tutorName}.
              </span>
            </label>
          </section>

          <section className="mt-12 flex flex-col items-center gap-3">
            <Button type="submit" size="lg" iconRight={<ArrowRight size={16} />}>
              Salvar e estudar
            </Button>
            <Link href="/aluno/chat" className="text-text-faint text-xs">
              Abrir chat sem alterar agora
            </Link>
          </section>
        </form>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex items-center justify-between gap-4 border-b px-4 py-3.5">
      <div className="min-w-0">
        <div className="text-text-faint text-[11px] tracking-wider uppercase">
          {label}
        </div>
        <div className="mt-0.5 text-[15px]">{value}</div>
      </div>
    </div>
  );
}
