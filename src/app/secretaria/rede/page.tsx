import { Plus, School, Upload } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";
import { loadNetworkKpis, loadSchoolsHealth } from "@/lib/secretaria/queries";
import { createSchool, importStudentsCsv } from "@/lib/secretaria/actions";

export default async function RedePage() {
  const tenant = await getCurrentTenant();
  const [kpis, schools] = await Promise.all([
    loadNetworkKpis({ tenantId: tenant.id }),
    loadSchoolsHealth({ tenantId: tenant.id }),
  ]);

  return (
    <>
      <PageHeader
        title="Administracao da rede"
        subtitle={`${tenant.short} - cadastros reais de escolas, turmas, professores e alunos`}
      />
      <PageBody>
        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="p-5">
            <div className="text-sm font-semibold">Nova escola</div>
            <p className="text-text-muted mt-1 text-xs">
              Cadastro imediato no tenant atual, com trilha em auditoria.
            </p>
            <form action={createSchool} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                name="name"
                required
                className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
                placeholder="Nome da escola"
              />
              <input
                name="region"
                className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
                placeholder="Regiao"
              />
              <input
                name="address"
                className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none sm:col-span-2"
                placeholder="Endereco"
              />
              <Button type="submit" icon={<Plus size={14} />} className="sm:col-span-2">
                Cadastrar escola
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <div className="text-sm font-semibold">Importar alunos por CSV</div>
            <p className="text-text-muted mt-1 text-xs">
              Colunas aceitas: nome, escola, turma, serie, cpf, nascimento,
              bolsa_familia. Escolas e turmas ausentes sao criadas.
            </p>
            <form action={importStudentsCsv} className="mt-4 grid gap-3">
              <input
                name="file"
                type="file"
                accept=".csv,text/csv"
                required
                className="border-border-strong bg-surface rounded-md border px-3 py-2 text-sm outline-none"
              />
              <Button type="submit" variant="secondary" icon={<Upload size={14} />}>
                Importar CSV
              </Button>
            </form>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Escolas", v: kpis.schoolsTotal.toString() },
            { l: "Alunos", v: kpis.studentsTotal.toLocaleString("pt-BR") },
            { l: "Professores", v: kpis.teachersTotal.toString() },
            { l: "Turmas", v: kpis.classesTotal.toString() },
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
              Base operacional lida do Postgres
            </div>
          </div>
          {schools.length === 0 ? (
            <div className="p-8 text-sm text-text-muted">
              Nenhuma escola cadastrada ainda.
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {["Escola", "Regiao", "Alunos", "Turmas", "Status"].map((h) => (
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
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-soft text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
                          <School size={13} />
                        </div>
                        <span className="font-medium">{school.name}</span>
                      </div>
                    </td>
                    <td className="border-border text-text-muted h-11 border-b px-4 align-middle text-xs">
                      {school.region ?? "-"}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs">
                      {school.studentsTotal}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs">
                      {school.classesTotal}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <Badge tone="success">ativa</Badge>
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
