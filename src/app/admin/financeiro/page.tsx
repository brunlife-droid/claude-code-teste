import { Download, FileText } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";

const KPIS = [
  { l: "Faturado · maio", v: "R$ 108.180", d: "+8% mês anterior" },
  { l: "A receber", v: "R$ 28.800", d: "1 prefeitura · Varginha · vencendo 10/05" },
  { l: "Inadimplência", v: "0%", d: "0 atrasos · rolling 90d" },
  { l: "Custo LLM", v: "R$ 9.640", d: "8,9% da receita · maio" },
];

const INVOICES = [
  { nf: "NEXUS-2026-0231", p: "Alfenas-MG", v: "01/06", val: 18840, s: "pendente" },
  { nf: "NEXUS-2026-0230", p: "Pouso Alegre-MG", v: "15/05", val: 32200, s: "pendente" },
  { nf: "NEXUS-2026-0229", p: "Varginha-MG", v: "10/05", val: 28800, s: "atencao" },
  { nf: "NEXUS-2026-0228", p: "Itajubá-MG", v: "20/05", val: 13900, s: "pendente" },
  { nf: "NEXUS-2026-0227", p: "Três Corações-MG", v: "28/05", val: 10240, s: "pendente" },
  { nf: "NEXUS-2026-0226", p: "Alfenas-MG", v: "01/04", val: 18840, s: "pago" },
  { nf: "NEXUS-2026-0225", p: "Pouso Alegre-MG", v: "15/04", val: 32200, s: "pago" },
];

export default function FinanceiroPage() {
  return (
    <>
      <PageHeader
        title="Financeiro"
        subtitle="Faturas, inadimplência, reajustes e relatórios consolidados"
        actions={<Button icon={<Download size={14} />}>Exportar tudo</Button>}
      />
      <PageBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KPIS.map((k) => (
            <Card key={k.l} className="p-4">
              <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
                {k.l}
              </div>
              <div className="mt-1.5 text-[26px] leading-none font-semibold tracking-tight">
                {k.v}
              </div>
              <div className="text-text-muted mt-1 text-xs">{k.d}</div>
            </Card>
          ))}
        </div>

        <Card className="p-0">
          <div className="border-border border-b px-6 py-4 text-sm font-semibold">
            Faturas
          </div>
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {["Fatura", "Prefeitura", "Vencimento", "Valor", "Status", "NF-e"].map(
                  (h) => (
                    <th
                      key={h}
                      className="bg-surface-2 text-text-faint border-border border-b px-4 py-2 text-left text-[11px] font-medium tracking-wide uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((f) => (
                <tr key={f.nf} className="hover:bg-surface-2">
                  <td className="border-border h-12 border-b px-4 align-middle text-[11.5px]" style={{ fontFamily: "var(--font-mono)" }}>
                    {f.nf}
                  </td>
                  <td className="border-border h-12 border-b px-4 align-middle">
                    {f.p}
                  </td>
                  <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                    {f.v}
                  </td>
                  <td className="border-border h-12 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                    R$ {f.val.toLocaleString("pt-BR")}
                  </td>
                  <td className="border-border h-12 border-b px-4 align-middle">
                    {f.s === "pago" && <Badge tone="success">pago</Badge>}
                    {f.s === "pendente" && <Badge>pendente</Badge>}
                    {f.s === "atencao" && <Badge tone="warning">vence hoje</Badge>}
                  </td>
                  <td className="border-border h-12 border-b px-4 align-middle">
                    <Button variant="ghost" size="sm" icon={<FileText size={12} />}>
                      Baixar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </PageBody>
    </>
  );
}
