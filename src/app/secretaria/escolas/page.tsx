import { Download, Filter, MapPin } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { ESCOLAS_ALFENAS } from "@/lib/mocks";

export default function EscolasPage() {
  return (
    <>
      <PageHeader
        title="Escolas da rede"
        subtitle={`${ESCOLAS_ALFENAS.length} escolas · IEB médio ${(ESCOLAS_ALFENAS.reduce((s, e) => s + e.ieb, 0) / ESCOLAS_ALFENAS.length).toFixed(1)}`}
        actions={
          <>
            <Button variant="secondary" icon={<Filter size={14} />}>
              Filtros
            </Button>
            <Button variant="secondary" icon={<Download size={14} />}>
              Exportar
            </Button>
          </>
        }
      />
      <PageBody>
        <Card className="p-0">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {["Escola", "Região", "Alunos", "Profs", "IEB", "Risco"].map((h) => (
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
              {ESCOLAS_ALFENAS.map((e) => (
                <tr key={e.id} className="hover:bg-surface-2 cursor-default">
                  <td className="border-border h-11 border-b px-4 align-middle font-medium">
                    {e.nome}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle">
                    <span className="text-text-muted inline-flex items-center gap-1.5 text-xs">
                      <MapPin size={12} className="text-text-faint" />
                      {e.regiao}
                    </span>
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                    {e.alunos}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                    {e.profs}
                  </td>
                  <td
                    className="border-border h-11 border-b px-4 align-middle text-xs font-semibold"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color:
                        e.risco === "alto"
                          ? "var(--danger-fg)"
                          : e.risco === "medio"
                            ? "var(--warning-fg)"
                            : "var(--success-fg)",
                    }}
                  >
                    {e.ieb}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle">
                    <Badge
                      tone={
                        e.risco === "alto"
                          ? "danger"
                          : e.risco === "medio"
                            ? "warning"
                            : "success"
                      }
                    >
                      {e.risco}
                    </Badge>
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
