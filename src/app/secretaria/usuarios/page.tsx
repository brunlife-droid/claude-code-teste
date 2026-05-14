import { Plus } from "lucide-react";
import { Avatar, Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";

const USERS = [
  { nome: "Cláudia Resende", papel: "Secretária", escopo: "Toda a rede", ativo: "agora" },
  { nome: "Patrícia Vilela", papel: "Coordenadora pedagógica", escopo: "EM Hélio Bagatini", ativo: "há 1h" },
  { nome: "Pedro Vilela", papel: "Orientador (SRE)", escopo: "EM Dr. S. Gualberto", ativo: "há 2h" },
  { nome: "Sandra Lima", papel: "Coordenadora pedagógica", escopo: "EM Dr. S. Gualberto", ativo: "há 4h" },
  { nome: "Adriana Costa", papel: "Diretora", escopo: "EM Senhora de Lourdes", ativo: "ontem" },
  { nome: "Joana Ferreira", papel: "Diretora", escopo: "EM Prof. José Marques", ativo: "ontem" },
  { nome: "Renato Alves", papel: "Suporte técnico", escopo: "Toda a rede", ativo: "há 6 dias" },
];

const ROLE_TONE: Record<string, "primary" | "warning" | "success" | "neutral"> = {
  Secretária: "primary",
  "Coordenadora pedagógica": "primary",
  "Orientador (SRE)": "warning",
  Diretora: "success",
  "Suporte técnico": "neutral",
};

export default function UsuariosPage() {
  return (
    <>
      <PageHeader
        title="Usuários internos"
        subtitle="Coordenadores, diretores, orientadores e suporte · permissões por escopo"
        actions={<Button icon={<Plus size={14} />}>Convidar pessoa</Button>}
      />
      <PageBody>
        <Card className="p-0">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {["Nome", "Papel", "Escopo", "Última atividade"].map((h) => (
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
              {USERS.map((u) => (
                <tr key={u.nome} className="hover:bg-surface-2">
                  <td className="border-border h-12 border-b px-4 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.nome} size={28} />
                      <span className="font-medium">{u.nome}</span>
                    </div>
                  </td>
                  <td className="border-border h-12 border-b px-4 align-middle">
                    <Badge tone={ROLE_TONE[u.papel] ?? "neutral"}>{u.papel}</Badge>
                  </td>
                  <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                    {u.escopo}
                  </td>
                  <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                    {u.ativo}
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
