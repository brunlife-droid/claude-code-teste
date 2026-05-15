import { PageHeader, PageBody } from "@/components/layout";
import { requireRole } from "@/lib/auth/session";
import { CopilotoClient } from "./copiloto-client";

export default async function CopilotoPage() {
  await requireRole("professor", "coordenador", "diretor", "orientador");

  return (
    <>
      <PageHeader
        title="Copiloto · Plano de aula"
        subtitle="Tema + série → IA gera plano alinhado à BNCC. Você revisa, ajusta e atribui."
      />
      <PageBody>
        <CopilotoClient />
      </PageBody>
    </>
  );
}
