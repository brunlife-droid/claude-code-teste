import { Search } from "lucide-react";
import { Badge, Card, ProfBadge } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { ALUNOS_7A } from "@/lib/mocks";

export default function AlunosSecretariaPage() {
  return (
    <>
      <PageHeader
        title="Alunos · drill rede"
        subtitle={`Busca em toda a rede · ${ALUNOS_7A.length} alunos visíveis (filtrado: 7º A)`}
      />
      <PageBody>
        <Card className="p-4">
          <div className="relative w-full max-w-md">
            <Search
              size={14}
              className="text-text-faint absolute top-1/2 left-3 -translate-y-1/2"
            />
            <input
              className="bg-surface border-border-strong h-9 w-full rounded-md border pr-3 pl-9 text-sm outline-none"
              placeholder="Nome, escola, CPF do responsável…"
            />
          </div>
        </Card>

        <Card className="p-0">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {["Aluno", "Escola", "Série", "Proficiência", "Acessos", "Risco"].map((h) => (
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
              {ALUNOS_7A.map((al) => (
                <tr key={al.id} className="hover:bg-surface-2">
                  <td className="border-border h-11 border-b px-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-soft text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                        {al.foto}
                      </div>
                      <span>{al.nome}</span>
                    </div>
                  </td>
                  <td className="border-border text-text-muted h-11 border-b px-4 align-middle text-xs">
                    {al.escola}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle text-xs">
                    {al.serie}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle">
                    <ProfBadge value={al.prof} />
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                    {al.acessos}
                  </td>
                  <td className="border-border h-11 border-b px-4 align-middle">
                    {al.risco && <Badge tone="danger">em risco</Badge>}
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
