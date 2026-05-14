import { Megaphone, Plus, Sparkles } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";

const POSTS = [
  {
    titulo: "Campanha do agasalho 2026",
    publico: "Toda a rede",
    autor: "SEMED",
    data: "Hoje · 14:32",
    leitura: "78%",
    status: "publicado",
  },
  {
    titulo: "Calendário do 2º bimestre — provas",
    publico: "Famílias 6º-9º",
    autor: "Coord. Pedagógica",
    data: "Ontem",
    leitura: "92%",
    status: "publicado",
  },
  {
    titulo: "Inscrições para os jogos escolares",
    publico: "Diretores",
    autor: "SEMED · Esportes",
    data: "Há 3 dias",
    leitura: "100%",
    status: "publicado",
  },
  {
    titulo: "Programa Sala de Inovação · informativo",
    publico: "Professores",
    autor: "Cláudia Resende",
    data: "Rascunho",
    leitura: "—",
    status: "rascunho",
  },
];

export default function MuralSecretariaPage() {
  return (
    <>
      <PageHeader
        title="Mural de comunicação"
        subtitle="Comunicados oficiais da SEMED · alcance toda a rede em segundos"
        actions={
          <>
            <Button variant="secondary" icon={<Sparkles size={14} />}>
              Reescrever com IA
            </Button>
            <Button icon={<Plus size={14} />}>Novo comunicado</Button>
          </>
        }
      />
      <PageBody>
        <Card className="p-0">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {["Comunicado", "Público", "Autor", "Data", "Leitura", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="bg-surface-2 text-text-faint border-border border-b px-4 py-2 text-left text-[11px] font-medium tracking-wide uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {POSTS.map((p) => (
                <tr key={p.titulo} className="hover:bg-surface-2">
                  <td className="border-border h-12 border-b px-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-soft text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                        <Megaphone size={14} />
                      </div>
                      <span className="font-medium">{p.titulo}</span>
                    </div>
                  </td>
                  <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                    {p.publico}
                  </td>
                  <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                    {p.autor}
                  </td>
                  <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                    {p.data}
                  </td>
                  <td className="border-border h-12 border-b px-4 align-middle text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                    {p.leitura}
                  </td>
                  <td className="border-border h-12 border-b px-4 align-middle">
                    <Badge tone={p.status === "publicado" ? "success" : "neutral"}>
                      {p.status}
                    </Badge>
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
