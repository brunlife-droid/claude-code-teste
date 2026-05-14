import Link from "next/link";
import { ArrowRight, Check, Pencil, Shield, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { getCurrentTenant } from "@/lib/tenants/server";

const TERMS = [
  {
    icon: Shield,
    title: "Suas conversas são privadas",
    desc: "Só você, a escola e seus responsáveis veem o conteúdo. Nada vai para a internet.",
  },
  {
    icon: Sparkles,
    title: "Eu vou guardar o que ajuda você aprender",
    desc: "Tipo: quando frações ficam difíceis, ou quando você manda bem em redação. Pra te ajudar melhor.",
  },
  {
    icon: Shield,
    title: "Se você me contar algo grave, eu aviso quem cuida de você",
    desc: "Bullying, violência ou tristeza muito grande não devem ficar só com a gente. Não fico sozinha com isso.",
  },
];

const DADOS = [
  { lbl: "Nome", val: "João Pedro Silva" },
  { lbl: "Escola", val: "EM Dr. Sebastião Gualberto" },
  { lbl: "Turma", val: "7º ano A" },
  { lbl: "Como você gosta de ser chamado?", val: "João", edit: true },
];

export default async function OnboardingPage() {
  const tenant = await getCurrentTenant();

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-8 py-12">
        {/* Hero · Boas-vindas */}
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
            você, tirar suas dúvidas e lembrar do seu jeito de aprender.
          </p>
        </section>

        {/* Confirmar dados */}
        <section className="mt-12">
          <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
            Passo 1 de 2
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Confirma se é você?
          </h2>
          <p className="text-text-muted mt-1 text-sm">
            A escola já me passou seus dados. Confere e me diz como prefere ser
            chamado.
          </p>

          <Card className="mt-5 p-2">
            {DADOS.map((d, i) => (
              <div
                key={d.lbl}
                className={`flex items-center justify-between gap-4 px-4 py-3.5 ${
                  i < DADOS.length - 1 ? "border-border border-b" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="text-text-faint text-[11px] tracking-wider uppercase">
                    {d.lbl}
                  </div>
                  <div className="mt-0.5 text-[15px]">{d.val}</div>
                </div>
                {d.edit && (
                  <button className="text-text-muted hover:bg-surface-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors">
                    <Pencil size={12} />
                    Editar
                  </button>
                )}
              </div>
            ))}
          </Card>
        </section>

        {/* Termo adaptado */}
        <section className="mt-12">
          <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
            Passo 2 de 2
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Combinado entre a gente
          </h2>
          <p className="text-text-muted mt-1 text-sm">
            Leia bem rapidinho — é importante que você entenda como eu funciono.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {TERMS.map((t) => {
              const Icon = t.icon;
              return (
                <Card key={t.title} className="flex gap-4 p-5">
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
                    <div className="text-[14.5px] font-semibold">{t.title}</div>
                    <p className="text-text-muted mt-1 text-sm leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          <label className="text-text-muted mt-5 flex cursor-pointer items-start gap-3 text-sm">
            <span
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 text-white"
              style={{
                background: tenant.primary,
                borderColor: tenant.primary,
              }}
            >
              <Check size={12} />
            </span>
            <span>
              Li, entendi e estou de acordo. Meu responsável também sabe que eu
              vou usar a {tenant.tutorName}.
            </span>
          </label>
        </section>

        {/* CTA */}
        <section className="mt-12 flex flex-col items-center gap-3">
          <Link href="/aluno/chat">
            <Button size="lg" iconRight={<ArrowRight size={16} />}>
              Bora estudar
            </Button>
          </Link>
          <span className="text-text-faint text-xs">
            Você pode revisar essas configurações a qualquer momento.
          </span>
        </section>
      </div>
    </div>
  );
}
