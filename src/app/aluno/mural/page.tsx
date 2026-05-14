import { AlertTriangle, Building, School, Users } from "lucide-react";
import { Badge, Chip } from "@/components/ui";
import { getCurrentTenant } from "@/lib/tenants/server";
import { COMUNICADOS } from "@/lib/mocks";

const FILTERS = ["Tudo", "Secretaria", "Escola", "Turma"];

export default async function MuralPage() {
  const tenant = await getCurrentTenant();

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Recados</h1>
            <p className="text-text-muted mt-2 text-[15px]">
              Comunicados da secretaria, escola e turma. Confirme a leitura
              quando o assunto for importante.
            </p>
          </div>
          <Badge tone="primary">2 novos</Badge>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f, i) => (
            <Chip
              key={f}
              className="cursor-pointer"
              style={
                i === 0
                  ? {
                      background: tenant.primarySoft,
                      color: tenant.primary,
                      borderColor: "transparent",
                    }
                  : undefined
              }
            >
              {f}
            </Chip>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2.5">
          {COMUNICADOS.map((c) => {
            const Icon =
              c.origem === "Secretaria"
                ? Building
                : c.origem === "Escola"
                  ? School
                  : Users;
            const iconBg =
              c.origem === "Secretaria"
                ? { bg: "var(--secondary-soft)", fg: "var(--warning-fg)" }
                : c.origem === "Escola"
                  ? { bg: tenant.primarySoft, fg: tenant.primary }
                  : { bg: "var(--success-soft)", fg: "var(--success-fg)" };

            return (
              <button
                key={c.id}
                type="button"
                className={`text-left rounded-xl border p-5 transition-colors hover:bg-surface-2 ${
                  !c.lido
                    ? "border-primary-border bg-primary-soft/30"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: iconBg.bg, color: iconBg.fg }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-muted text-[12.5px]">
                        {c.origem} · {c.autor}
                      </span>
                      <span className="text-text-faint text-[12.5px]">
                        {c.data}
                      </span>
                    </div>
                    <div
                      className={`mt-1 text-[15px] ${!c.lido ? "font-semibold" : ""}`}
                    >
                      {c.titulo}
                    </div>
                    {c.prioridade === "alta" && (
                      <div className="mt-2.5">
                        <Chip className="bg-danger-soft text-danger-fg border-transparent text-[11px]">
                          <AlertTriangle size={10} />
                          Importante
                        </Chip>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
