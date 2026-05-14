import { Plus, School } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { ESCOLAS_ALFENAS } from "@/lib/mocks";
import { getCurrentTenant } from "@/lib/tenants/server";

export default async function RedePage() {
  const tenant = await getCurrentTenant();
  const totalAlunos = ESCOLAS_ALFENAS.reduce((s, e) => s + e.alunos, 0);
  const totalProfs = ESCOLAS_ALFENAS.reduce((s, e) => s + e.profs, 0);

  return (
    <>
      <PageHeader
        title="Administração da rede"
        subtitle={`${tenant.short} · cadastros de escolas, turmas, professores e alunos`}
        actions={
          <>
            <Button variant="secondary">Importar CSV</Button>
            <Button icon={<Plus size={14} />}>Nova escola</Button>
          </>
        }
      />
      <PageBody>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Escolas", v: tenant.schools.toString() },
            { l: "Alunos", v: totalAlunos.toLocaleString("pt-BR") },
            { l: "Professores", v: totalProfs.toString() },
            { l: "Coordenadores", v: "12" },
          ].map((k) => (
            <Card key={k.l} className="p-4">
              <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
                {k.l}
              </div>
              <div className="mt-1.5 text-[28px] leading-none font-semibold tracking-tight">
                {k.v}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-0">
          <div className="border-border border-b px-6 py-4">
            <div className="text-sm font-semibold">Escolas cadastradas</div>
            <div className="text-text-muted mt-0.5 text-xs">
              Cada linha permite editar turmas e responsáveis
            </div>
          </div>
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {["Escola", "Região", "Alunos", "Profs", "Status"].map((h) => (
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
                <tr key={e.id} className="hover:bg-surface-2">
                  <td className="border-border h-11 border-b px-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-soft text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
                        <School size={13} />
                      </div>
                      <span className="font-medium">{e.nome}</span>
                    </div>
                  </td>
                  <td className="border-border text-text-muted h-11 border-b px-4 align-middle text-xs">
                    {e.regiao}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                    {e.alunos}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                    {e.profs}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle">
                    <Badge tone="success">ativa</Badge>
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
