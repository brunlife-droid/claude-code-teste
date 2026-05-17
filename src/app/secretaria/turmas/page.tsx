import { Plus } from "lucide-react";
import { Badge, Button, Card, ProfBadge } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";
import { loadNetworkClasses, loadSchoolsHealth } from "@/lib/secretaria/queries";
import { createClass } from "@/lib/secretaria/actions";
import { scoreToProficiency } from "@/lib/teacher/queries";

export default async function TurmasPage() {
  const tenant = await getCurrentTenant();
  const [classes, schools] = await Promise.all([
    loadNetworkClasses({ tenantId: tenant.id }),
    loadSchoolsHealth({ tenantId: tenant.id }),
  ]);

  return (
    <>
      <PageHeader
        title="Turmas da rede"
        subtitle="Drill por escola e turma, calculado a partir do banco"
      />
      <PageBody>
        <Card className="p-5">
          <div className="text-sm font-semibold">Nova turma</div>
          <p className="text-text-muted mt-1 text-xs">
            Cria a turma vinculada a uma escola do tenant atual.
          </p>
          <form action={createClass} className="mt-4 grid gap-3 sm:grid-cols-5">
            <select
              name="schoolId"
              required
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none sm:col-span-2"
              defaultValue=""
            >
              <option value="" disabled>
                Escola
              </option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            <input
              name="name"
              required
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
              placeholder="Turma"
            />
            <input
              name="grade"
              required
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
              placeholder="Serie"
            />
            <input
              name="year"
              type="number"
              min={2020}
              max={2100}
              defaultValue={new Date().getFullYear()}
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
              placeholder="Ano"
            />
            <Button
              type="submit"
              icon={<Plus size={14} />}
              disabled={schools.length === 0}
              className="sm:col-span-5"
            >
              Cadastrar turma
            </Button>
          </form>
        </Card>

        {classes.length === 0 ? (
          <Card className="p-8 text-sm text-text-muted">
            Nenhuma turma cadastrada neste tenant.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card key={cls.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold">{cls.name}</div>
                  {cls.atRiskCount > 0 && (
                    <Badge tone={cls.atRiskCount >= 3 ? "danger" : "warning"}>
                      {cls.atRiskCount} em risco
                    </Badge>
                  )}
                </div>
                <div className="text-text-muted mt-1 text-xs">{cls.schoolName}</div>
                <div className="text-text-muted mt-3 text-xs">
                  {cls.studentsTotal} alunos - {cls.teachersTotal} profs
                </div>
                <div className="mt-3">
                  <ProfBadge value={scoreToProficiency(cls.avgProficiency)} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
