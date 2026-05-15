import { PageHeader, PageBody } from "@/components/layout";
import { requireRole } from "@/lib/auth/session";
import { CorrecaoClient } from "./correcao-client";

export default async function CorrecaoPage() {
  await requireRole("professor", "coordenador", "diretor", "orientador");

  return (
    <>
      <PageHeader
        title="Correção assistida · Redação"
        subtitle="Cola o texto do aluno → IA analisa nas 5 competências ENEM e sugere devolutiva."
      />
      <PageBody>
        <CorrecaoClient />
      </PageBody>
    </>
  );
}
