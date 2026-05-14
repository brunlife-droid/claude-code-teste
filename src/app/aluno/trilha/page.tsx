import { MapPin, Trophy } from "lucide-react";
import { Card } from "@/components/ui";
import { getCurrentTenant } from "@/lib/tenants/server";
import { TRILHA } from "@/lib/mocks";

export default async function TrilhaPage() {
  const tenant = await getCurrentTenant();

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-10">
        <header>
          <div className="text-text-faint text-[11.5px] font-semibold tracking-widest uppercase">
            Sua trilha · 2º bimestre
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Onde você está nas matérias
          </h1>
          <p className="text-text-muted mt-2 max-w-xl text-[15px] leading-relaxed">
            Cada barra mostra quantas habilidades você já dominou no bimestre.
            Sem competição com ninguém — só você e seu progresso.
          </p>
        </header>

        {/* Próximo passo destaque */}
        <div
          className="mt-8 flex items-center gap-5 rounded-2xl p-6"
          style={{ background: tenant.primary, color: tenant.primaryFg }}
        >
          <div className="relative size-20 shrink-0">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={tenant.secondary}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(62 / 100) * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
              62%
            </div>
          </div>
          <div>
            <div className="text-sm opacity-85">Próximo passo</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">
              Razão e proporção
            </div>
            <div className="mt-1 text-sm opacity-85">
              Matemática · 3 atividades curtas pra dominar
            </div>
          </div>
        </div>

        {/* Disciplinas */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {TRILHA.map((d) => (
            <Card key={d.area} className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold">{d.area}</div>
                <span
                  className="text-text-faint text-[11px]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {d.dominado}/{d.total}
                </span>
              </div>
              <div className="bg-surface-3 mt-3 h-2 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(d.dominado / d.total) * 100}%`,
                    background: d.cor,
                  }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <MapPin size={13} className="text-text-faint" />
                <span className="text-text-muted">
                  Estudando: <b className="text-text">{d.atual}</b>
                </span>
              </div>
              <div className="text-text-faint mt-1 text-xs">
                A seguir: {d.proximo}
              </div>
            </Card>
          ))}
        </div>

        {/* Conquista */}
        <Card className="bg-success-soft mt-6 flex gap-4 p-5">
          <Trophy size={24} className="text-success-fg mt-0.5 shrink-0" />
          <div>
            <div className="text-success-fg text-[15px] font-semibold">
              Você dominou frações!
            </div>
            <div className="text-success-fg/85 mt-1 text-sm leading-relaxed">
              14 habilidades de matemática consolidadas. Você pode partir pra
              razões e proporção tranquilo.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
