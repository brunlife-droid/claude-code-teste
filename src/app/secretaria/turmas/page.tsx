import { Badge, Card, ProfBadge } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";

const TURMAS = [
  { id: "t1", escola: "EM Dr. Sebastião Gualberto", turma: "7º A", profs: "Ricardo · Patrícia", alunos: 28, risco: 2, prof: "adequada" as const },
  { id: "t2", escola: "EM Dr. Sebastião Gualberto", turma: "7º B", profs: "Ricardo · Patrícia", alunos: 26, risco: 1, prof: "adequada" as const },
  { id: "t3", escola: "EM Dr. Sebastião Gualberto", turma: "8º A", profs: "Ricardo · Carlos", alunos: 30, risco: 0, prof: "avancada" as const },
  { id: "t4", escola: "EM Senhora de Lourdes", turma: "5º A", profs: "Joana · Sandra", alunos: 27, risco: 5, prof: "basica" as const },
  { id: "t5", escola: "EM Senhora de Lourdes", turma: "5º B", profs: "Joana · Sandra", alunos: 25, risco: 4, prof: "basica" as const },
  { id: "t6", escola: "EM Hélio Bagatini", turma: "9º A", profs: "Patrícia · Carlos", alunos: 31, risco: 1, prof: "adequada" as const },
];

export default function TurmasPage() {
  return (
    <>
      <PageHeader
        title="Turmas da rede"
        subtitle="Drill por escola → turma. Identifica concentração de risco."
      />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TURMAS.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold">{t.turma}</div>
                {t.risco > 0 && (
                  <Badge tone={t.risco >= 3 ? "danger" : "warning"}>
                    {t.risco} em risco
                  </Badge>
                )}
              </div>
              <div className="text-text-muted mt-1 text-xs">{t.escola}</div>
              <div className="text-text-muted mt-3 text-xs">
                {t.alunos} alunos · {t.profs}
              </div>
              <div className="mt-3">
                <ProfBadge value={t.prof} />
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </>
  );
}
