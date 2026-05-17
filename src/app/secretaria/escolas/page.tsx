import { Download, MapPin } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";
import { loadSchoolsHealth } from "@/lib/secretaria/queries";

function pct(score: number): string {
  return score === 0 ? "-" : `${Math.round(score * 100)}%`;
}

export default async function EscolasPage() {
  const tenant = await getCurrentTenant();
  const schools = await loadSchoolsHealth({ tenantId: tenant.id });
  const avg =
    schools.length === 0
      ? 0
      : schools.reduce((sum, school) => sum + school.avgProficiency, 0) /
        schools.length;

  return (
    <>
      <PageHeader
        title="Escolas da rede"
        subtitle={`${schools.length} escolas - proficiencia media ${pct(avg)}`}
        actions={
          <Button
            variant="secondary"
            icon={<Download size={14} />}
            disabled
            title="Exportacao CSV entra no bloco de relatorios operacionais."
          >
            Exportar CSV
          </Button>
        }
      />
      <PageBody>
        <Card className="p-0">
          {schools.length === 0 ? (
            <div className="p-8 text-sm text-text-muted">
              Nenhuma escola cadastrada neste tenant.
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {[
                    "Escola",
                    "Regiao",
                    "Alunos",
                    "Turmas",
                    "Profs",
                    "Proficiencia",
                    "Risco",
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
                {schools.map((school) => (
                  <tr key={school.id} className="hover:bg-surface-2">
                    <td className="border-border h-11 border-b px-4 align-middle font-medium">
                      {school.name}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <span className="text-text-muted inline-flex items-center gap-1.5 text-xs">
                        <MapPin size={12} className="text-text-faint" />
                        {school.region ?? "-"}
                      </span>
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs">
                      {school.studentsTotal}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs">
                      {school.classesTotal}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs">
                      {school.teachersTotal}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs font-semibold">
                      {pct(school.avgProficiency)}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <Badge tone={school.atRiskCount > 0 ? "warning" : "success"}>
                        {school.atRiskCount}
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
