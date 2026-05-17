import { Calendar, Download, Send, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { PrefLogo } from "@/components/tenant";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";
import { loadNetworkKpis } from "@/lib/secretaria/queries";

export default async function RelatorioPage() {
  const tenant = await getCurrentTenant();
  const kpis = await loadNetworkKpis({ tenantId: tenant.id });
  const engagedPercent =
    kpis.studentsTotal > 0
      ? Math.round((kpis.studentsEngaged7d / kpis.studentsTotal) * 100)
      : 0;
  const teacherPercent =
    tenant.teachers > 0
      ? Math.round((kpis.teachersTotal / tenant.teachers) * 100)
      : 0;

  return (
    <>
      <PageHeader
        title="Relatorio mensal de educacao"
        subtitle="Preview com indicadores reais do tenant; PDF final entra no proximo bloco"
        actions={
          <>
            <Button variant="secondary" icon={<Calendar size={14} />}>
              Maio/26
            </Button>
            <Button
              variant="secondary"
              icon={<Sparkles size={14} />}
              disabled
              title="Regeneracao por IA entra junto da geracao real de PDF."
            >
              Regenerar
            </Button>
            <Button
              variant="secondary"
              icon={<Download size={14} />}
              disabled
              title="Download entra quando o PDF real for implementado."
            >
              Baixar PDF
            </Button>
            <Button
              icon={<Send size={14} />}
              disabled
              title="Envio entra quando o PDF real for implementado."
            >
              Enviar
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="flex justify-center rounded-lg bg-surface-3 p-6">
          <div
            className="w-[640px] rounded-md bg-white text-[#1a1a18] shadow-[var(--shadow-lg)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            <div
              className="px-10 pt-10 pb-8"
              style={{ borderBottom: `4px solid ${tenant.primary}` }}
            >
              <PrefLogo tenant={tenant} size={48} withName={false} />
              <h1 className="mt-6 text-[28px] leading-tight font-semibold tracking-tight">
                Relatorio mensal de educacao
              </h1>
              <p
                className="mt-2 text-sm text-[#54544D]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {tenant.name} - maio de 2026 - 2o bimestre
              </p>
            </div>

            <div className="px-10 py-8">
              <div
                className="text-[10.5px] font-semibold tracking-widest uppercase"
                style={{ color: tenant.primary, fontFamily: "var(--font-sans)" }}
              >
                Resumo executivo
              </div>
              <p className="mt-3 text-[14px] leading-[1.75]">
                Em maio, a rede municipal de {tenant.short} possui{" "}
                <b>{kpis.studentsTotal.toLocaleString("pt-BR")} alunos cadastrados</b>{" "}
                na plataforma Nexus Education, com{" "}
                <b>{kpis.studentsEngaged7d.toLocaleString("pt-BR")} alunos ativos</b>{" "}
                nos ultimos 7 dias. A proficiencia media registrada no banco e{" "}
                <b>{Math.round(kpis.avgProficiency * 100)}%</b>.
              </p>
              <p className="mt-3 text-[14px] leading-[1.75]">
                O relatorio abaixo ja usa indicadores reais do tenant. A
                geracao do PDF final, anexos e envio institucional seguem como
                proximo bloco operacional.
              </p>
            </div>

            <div className="px-10 pb-8">
              <div
                className="grid grid-cols-3 gap-3"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {[
                  {
                    l: "Alunos",
                    v: kpis.studentsTotal.toLocaleString("pt-BR"),
                    s: `${engagedPercent}% ativos 7d`,
                  },
                  {
                    l: "Profs. cadastrados",
                    v: kpis.teachersTotal.toString(),
                    s: `${teacherPercent}% da meta`,
                  },
                  {
                    l: "Em risco",
                    v: kpis.studentsAtRisk.toLocaleString("pt-BR"),
                    s: "prioridade pedagogica",
                  },
                ].map((k) => (
                  <div key={k.l} className="rounded bg-[#FAFAF9] p-3">
                    <div className="text-[9.5px] font-medium tracking-wider text-[#A8A8A0] uppercase">
                      {k.l}
                    </div>
                    <div className="mt-1 text-[20px] leading-none font-semibold">
                      {k.v}
                    </div>
                    <div className="mt-0.5 text-[10.5px] text-[#54544D]">
                      {k.s}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex justify-between px-10 py-6 text-[10.5px]"
              style={{
                background: "#FAFAF9",
                color: "#71716A",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span>Pagina 1 de 12 - preview operacional</span>
              <span>
                {tenant.short}-{tenant.uf} - Nexus Education
              </span>
            </div>
          </div>
        </div>

        <Card className="border-primary-border bg-primary-soft p-4">
          <div className="text-primary text-[11.5px] font-semibold tracking-wider uppercase">
            Proximo bloco
          </div>
          <p className="text-primary mt-1 text-sm leading-relaxed">
            Preview com indicadores reais. Ainda falta renderizar o PDF final,
            versionar snapshots mensais, armazenar no S3 e enviar por e-mail
            com auditoria.
          </p>
        </Card>
      </PageBody>
    </>
  );
}
