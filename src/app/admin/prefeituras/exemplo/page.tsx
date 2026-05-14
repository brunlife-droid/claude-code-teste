import { Edit, Globe } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { PrefLogo } from "@/components/tenant";
import { PageHeader, PageBody } from "@/components/layout";
import { TENANTS } from "@/lib/tenants";

const TABS = [
  "Métricas de uso",
  "Financeiro",
  "Logs de acesso",
  "Suporte",
  "White-label",
];

const KPIS = [
  { l: "Alunos ativos", v: "8.247", d: "88% da base" },
  { l: "Profs. engajados", v: "518", d: "85% engajados" },
  { l: "Horas pedagógicas", v: "14.382h", d: "+24% este mês" },
];

const STATS = [
  { k: "Total", v: "982k tokens" },
  { k: "Custo", v: "R$ 1.482" },
  { k: "Margem", v: "92%" },
  { k: "Modelo principal", v: "Claude Haiku 4.5" },
];

export default function PerfilPrefeituraPage() {
  const tenant = TENANTS.alfenas;
  return (
    <>
      <PageHeader
        title={`${tenant.short}-${tenant.uf}`}
        subtitle={`Ativo desde fev/2025 · contrato 24 meses · subdomínio ${tenant.subdomain}.nexus.edu`}
        actions={
          <>
            <Button variant="secondary" icon={<Edit size={14} />}>
              Editar contrato
            </Button>
            <Button variant="secondary" icon={<Globe size={14} />}>
              Abrir tenant
            </Button>
          </>
        }
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <Card className="p-5">
            <PrefLogo tenant={tenant} size={64} withName={false} />
            <div className="mt-3 text-base font-semibold">
              Prefeitura de {tenant.short}
            </div>
            <div className="text-text-muted text-xs">
              {tenant.uf} · {tenant.population}
            </div>
            <hr className="border-border my-4" />
            <div className="flex flex-col gap-2.5 text-xs">
              <Row k="CNPJ" v="18.243.218/0001-04" mono />
              <Row k="Contato" v="Cláudia Resende" />
              <Row k="Plano" v="Standard" />
              <Row k="Início" v="01/02/2025" />
              <Row k="Renovação" v="01/02/2027" />
              <Row k="Health" v={<Badge tone="success">saudável</Badge>} />
              <Row k="MRR" v="R$ 18.840" mono />
              <Row k="LTV estimado" v="R$ 452k" mono />
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="border-border flex border-b">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  className={`px-4 py-2.5 text-sm ${
                    i === 0
                      ? "text-text border-primary -mb-px border-b-2 font-semibold"
                      : "text-text-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {KPIS.map((k) => (
                <Card key={k.l} className="p-4">
                  <div className="text-text-faint text-[11.5px] font-medium tracking-wider uppercase">
                    {k.l}
                  </div>
                  <div className="mt-1.5 text-[26px] leading-none font-semibold tracking-tight">
                    {k.v}
                  </div>
                  <div className="text-success-fg mt-1 text-xs">{k.d}</div>
                </Card>
              ))}
            </div>

            <Card className="p-0">
              <div className="border-border border-b px-6 py-4 text-sm font-semibold">
                Uso de tokens · últimos 30 dias
              </div>
              <div className="p-6">
                <svg viewBox="0 0 600 200" className="h-44 w-full">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1={36}
                      x2={580}
                      y1={20 + i * 36}
                      y2={20 + i * 36}
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                    />
                  ))}
                  <polyline
                    fill="none"
                    stroke={tenant.primary}
                    strokeWidth="2.5"
                    points={[12, 14, 16, 15, 18, 22, 24, 28, 32, 30, 35, 42, 38, 45]
                      .map((v, i, arr) => `${36 + (i * 544) / (arr.length - 1)},${180 - (v / 50) * 160}`)
                      .join(" ")}
                  />
                </svg>
                <div className="mt-4 flex flex-wrap gap-6 text-xs">
                  {STATS.map((s) => (
                    <div key={s.k}>
                      <div className="text-text-faint text-[11px] tracking-wider uppercase">
                        {s.k}
                      </div>
                      <div className="mt-0.5 text-base font-semibold">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}

function Row({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-text-muted">{k}</span>
      <span style={mono ? { fontFamily: "var(--font-mono)", fontSize: 11 } : undefined}>
        {v}
      </span>
    </div>
  );
}
