import { Plus } from "lucide-react";
import { Avatar, Badge, Button, Card } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";
import {
  loadNetworkClasses,
  loadNetworkUsers,
  loadSchoolsHealth,
} from "@/lib/secretaria/queries";
import { createUserMembership } from "@/lib/secretaria/actions";

const ROLE_TONE: Record<string, "primary" | "warning" | "success" | "neutral"> = {
  secretaria: "primary",
  coordenador: "primary",
  orientador: "warning",
  diretor: "success",
  professor: "success",
};

export default async function UsuariosPage() {
  const tenant = await getCurrentTenant();
  const [users, schools, classes] = await Promise.all([
    loadNetworkUsers({ tenantId: tenant.id }),
    loadSchoolsHealth({ tenantId: tenant.id }),
    loadNetworkClasses({ tenantId: tenant.id }),
  ]);

  return (
    <>
      <PageHeader
        title="Usuarios internos"
        subtitle="Pessoas com membership neste tenant, com escopo de escola/turma"
      />
      <PageBody>
        <Card className="p-5">
          <div className="text-sm font-semibold">Convidar pessoa</div>
          <p className="text-text-muted mt-1 text-xs">
            Cria ou atualiza o usuario, define papel e escopo. A senha
            provisoria libera login por credenciais enquanto o fluxo de e-mail
            nao estiver pronto.
          </p>
          <form
            action={createUserMembership}
            className="mt-4 grid gap-3 lg:grid-cols-6"
          >
            <input
              name="name"
              required
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none lg:col-span-2"
              placeholder="Nome"
            />
            <input
              name="email"
              type="email"
              required
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none lg:col-span-2"
              placeholder="E-mail"
            />
            <select
              name="role"
              required
              defaultValue="professor"
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
            >
              <option value="professor">Professor</option>
              <option value="coordenador">Coordenador</option>
              <option value="diretor">Diretor</option>
              <option value="orientador">Orientador</option>
              <option value="secretaria">Secretaria</option>
            </select>
            <input
              name="temporaryPassword"
              type="password"
              minLength={8}
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none"
              placeholder="Senha provisoria"
            />
            <select
              name="schoolId"
              defaultValue="none"
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none lg:col-span-2"
            >
              <option value="none">Toda a rede</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            <select
              name="classId"
              defaultValue="none"
              className="border-border-strong bg-surface h-9 rounded-md border px-3 text-sm outline-none lg:col-span-3"
            >
              <option value="none">Sem turma especifica</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.schoolName} - {cls.name}
                </option>
              ))}
            </select>
            <Button type="submit" icon={<Plus size={14} />}>
              Salvar acesso
            </Button>
          </form>
        </Card>

        <Card className="p-0">
          {users.length === 0 ? (
            <div className="p-8 text-sm text-text-muted">
              Nenhum usuario vinculado a este tenant.
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  {["Nome", "Papel", "Escopo", "E-mail"].map((h) => (
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
                {users.map((u) => (
                  <tr key={`${u.id}-${u.role}`} className="hover:bg-surface-2">
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size={28} />
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="border-border h-12 border-b px-4 align-middle">
                      <Badge tone={ROLE_TONE[u.role] ?? "neutral"}>{u.role}</Badge>
                    </td>
                    <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                      {u.className ?? u.schoolName ?? "Toda a rede"}
                    </td>
                    <td className="border-border text-text-muted h-12 border-b px-4 align-middle text-xs">
                      {u.email ?? "-"}
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
