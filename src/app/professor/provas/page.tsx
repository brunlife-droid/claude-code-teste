import { PageHeader, PageBody } from "@/components/layout";
import { ProvasClient } from "./provas-client";

export default function ProvasPage() {
  return (
    <>
      <PageHeader
        title="Gerador de prova"
        subtitle="Tema + série → IA gera prova com matriz BNCC, versões e gabarito comentado."
      />
      <PageBody>
        <ProvasClient />
      </PageBody>
    </>
  );
}
