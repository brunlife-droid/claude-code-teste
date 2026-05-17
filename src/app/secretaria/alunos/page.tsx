import { Plus, Search } from "lucide-react";
import { Badge, Button, Card, ProfBadge } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";
import {
  loadNetworkClasses,
  loadNetworkStudents,
} from "@/lib/secretaria/queries";
import { createStudent } from "@/lib/secretaria/actions";
import { scoreToProficiency } from "@/lib/teacher/queries";

interface AlunosSecretariaPageProps {
  searchParams?: Promise<{ q?: string }>;
}

export default async function AlunosSecretariaPage({
  searchParams,
}: AlunosSecretariaPageProps) {
  const params = await searchParams;
  const query = String(params?.q ?? "").trim().toLowerCase();
  const tenant = await getCurrentTenant();
  const [students, classes] = await Promise.all([
    loadNetworkStudents({ tenantId: tenant.id, limit: 300 }),
    loadNetworkClasses({ tenantId: tenant.id }),
  ]);
  const filteredStudents = query
    ? students.filter((student) =>
        [student.fullName, student.schoolName, student.className, student.grade]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : students;

  return (
    <>
      <PageHeader
        title="Alunos - drill da rede"
        subtitle={`Busca operacional em ${students.length} aluno(s) do tenant atual`}
      />
      <PageBody>
        <Card className="p-5">
          <div className="text-sm font-semibold">Novo aluno</div>
          <p className="text-text-muted mt-1 text-xs">
            Cadastro manual com escopo derivado da turma selecionada.
          </p>
          <form action={createStudent} className="mt-4 grid gap-3 lg:grid-cols-6">
            <input
              name="fullName"
              required
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none lg:col-span-2"
              placeholder="Nome completo"
            />
            <select
              name="classId"
              required
              defaultValue=""
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none lg:col-span-2"
            >
              <option value="" disabled>
                Turma
              </option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.schoolName} - {cls.name}
                </option>
              ))}
            </select>
            <input
              name="nickname"
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
              placeholder="Apelido"
            />
            <input
              name="cpf"
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
              placeholder="CPF"
            />
            <input
              name="birthDate"
              type="date"
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
            />
            <label className="text-text-muted flex h-9 items-center gap-2 text-xs lg:col-span-2">
              <input
                type="checkbox"
                name="bolsaFamilia"
                className="size-4 rounded border-border-strong"
              />
              Bolsa Familia / CadUnico
            </label>
            <Button
              type="submit"
              icon={<Plus size={14} />}
              disabled={classes.length === 0}
              className="lg:col-span-3"
            >
              Cadastrar aluno
            </Button>
          </form>
        </Card>

        <Card className="p-4">
          <form className="flex w-full max-w-xl gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                size={14}
                className="text-text-faint absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                name="q"
                defaultValue={query}
                className="bg-surface border-border-strong h-9 w-full rounded-md border pr-3 pl-9 text-sm outline-none"
                placeholder="Nome, escola, turma..."
              />
            </div>
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>
        </Card>

        <Card className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-sm text-text-muted">
              Nenhum aluno encontrado para os filtros atuais.
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {[
                    "Aluno",
                    "Escola",
                    "Turma",
                    "Proficiencia",
                    "Conversas",
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-2">
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-soft text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                          {student.fullName
                            .split(" ")
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <span>{student.fullName}</span>
                      </div>
                    </td>
                    <td className="border-border text-text-muted h-11 border-b px-4 align-middle text-xs">
                      {student.schoolName}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs">
                      {student.className}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle">
                      <ProfBadge value={scoreToProficiency(student.avgScore)} />
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle text-xs">
                      {student.conversationCount}
                    </td>
                    <td className="border-border h-11 border-b px-4 align-middle">
                      {student.avgScore < 0.45 && (
                        <Badge tone="danger">em risco</Badge>
                      )}
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
