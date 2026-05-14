import { Calendar, Download, Send, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { PrefLogo } from "@/components/tenant";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";

export default async function RelatorioPage() {
  const tenant = await getCurrentTenant();
  return (
    <>
      <PageHeader
        title="Relatório mensal de educação"
        subtitle="Gerado pela IA · brandeado pela prefeitura · enviado para prefeito, vereadores, imprensa"
        actions={
          <>
            <Button variant="secondary" icon={<Calendar size={14} />}>
              Maio/26
            </Button>
            <Button variant="secondary" icon={<Sparkles size={14} />}>
              Regenerar
            </Button>
            <Button variant="secondary" icon={<Download size={14} />}>
              Baixar PDF
            </Button>
            <Button icon={<Send size={14} />}>Enviar</Button>
          </>
        }
      />
      <PageBody>
        <div className="flex justify-center bg-surface-3 rounded-lg p-6">
          {/* Mock PDF preview */}
          <div
            className="bg-white text-[#1a1a18] w-[640px] rounded-md shadow-[var(--shadow-lg)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {/* Cover */}
            <div
              className="px-10 pt-10 pb-8"
              style={{ borderBottom: `4px solid ${tenant.primary}` }}
            >
              <PrefLogo tenant={tenant} size={48} withName={false} />
              <h1 className="mt-6 text-[28px] font-semibold tracking-tight leading-tight">
                Relatório mensal de educação
              </h1>
              <p className="text-[#54544D] mt-2 text-sm" style={{ fontFamily: "var(--font-sans)" }}>
                {tenant.name} · maio de 2026 · 2º bimestre
              </p>
            </div>

            {/* Resumo executivo */}
            <div className="px-10 py-8">
              <div
                className="text-[10.5px] font-semibold tracking-widest uppercase"
                style={{ color: tenant.primary, fontFamily: "var(--font-sans)" }}
              >
                Resumo executivo
              </div>
              <p className="mt-3 text-[14px] leading-[1.75]">
                Em maio, a rede municipal de {tenant.short} alcançou{" "}
                <b>{tenant.students.toLocaleString("pt-BR")} alunos ativos</b>{" "}
                na plataforma Nexus Education, com{" "}
                <b>14.382 horas pedagógicas</b> de uso estruturado. O IDEB
                projetado para 2025 atinge <b>5,7</b> — superando a meta
                nacional em 0,2 pontos.
              </p>
              <p className="mt-3 text-[14px] leading-[1.75]">
                Destaque para a escola EM Padre Vitor Coelho, que liderou em
                proficiência em leitura, e para o trabalho de reforço na EM
                Senhora de Lourdes, que demanda atenção especial no próximo
                bimestre.
              </p>
            </div>

            {/* KPI cards */}
            <div className="px-10 pb-8">
              <div
                className="grid grid-cols-3 gap-3"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {[
                  { l: "Alunos ativos", v: tenant.students.toLocaleString("pt-BR"), s: "88% da base" },
                  { l: "Profs. engajados", v: tenant.teachers.toString(), s: "85% da base" },
                  { l: "Horas pedagógicas", v: "14.382h", s: "+24%" },
                ].map((k) => (
                  <div key={k.l} className="bg-[#FAFAF9] rounded p-3">
                    <div className="text-[#A8A8A0] text-[9.5px] font-medium tracking-wider uppercase">
                      {k.l}
                    </div>
                    <div className="mt-1 text-[20px] font-semibold leading-none">
                      {k.v}
                    </div>
                    <div className="text-[#54544D] mt-0.5 text-[10.5px]">{k.s}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-10 py-6 text-[10.5px] flex justify-between"
              style={{
                background: "#FAFAF9",
                color: "#71716A",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span>Página 1 de 12 · gerado automaticamente</span>
              <span>{tenant.short}-{tenant.uf} · Nexus Education</span>
            </div>
          </div>
        </div>

        <Card className="bg-primary-soft border-primary-border p-4">
          <div className="text-primary text-[11.5px] font-semibold tracking-wider uppercase">
            Fase 0
          </div>
          <p className="text-primary mt-1 text-sm leading-relaxed">
            Preview parcial do PDF. A geração real virá via{" "}
            <code>@react-pdf/renderer</code> na Fase 3 do roadmap. Enviar para
            prefeito/vereadores via e-mail entra em Fase 5.
          </p>
        </Card>
      </PageBody>
    </>
  );
}
