import { Upload } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { PrefLogo } from "@/components/tenant";
import { PageHeader, PageBody } from "@/components/layout";
import { getCurrentTenant } from "@/lib/tenants/server";

export default async function IdentidadePage() {
  const tenant = await getCurrentTenant();

  return (
    <>
      <PageHeader
        title="Identidade visual"
        subtitle="Configure como o Nexus aparece para alunos, professores e família · todas as marcas brandeadas em tempo real"
        actions={<Button>Salvar alterações</Button>}
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-5">
            <Card className="p-6">
              <div className="text-sm font-semibold">Logotipo</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Aparece no app, no PDF do relatório, nos comunicados.
              </div>
              <div className="mt-4 flex items-center gap-4">
                <PrefLogo tenant={tenant} size={64} withName={false} />
                <div>
                  <div className="text-sm font-medium">Atual: monograma</div>
                  <div className="text-text-muted mt-0.5 text-xs">
                    {tenant.monogram} · gerado automaticamente do nome
                  </div>
                </div>
                <div className="flex-1" />
                <Button variant="secondary" icon={<Upload size={14} />}>
                  Trocar
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-semibold">Cores da marca</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Aplicadas em botões, gráficos, badges, fundos sutis. Mudanças
                refletem em todos os usuários da rede.
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <ColorRow label="Primária" value={tenant.primary} sample={tenant.primary} fg={tenant.primaryFg} />
                <ColorRow label="Primária soft" value={tenant.primarySoft} sample={tenant.primarySoft} fg={tenant.primary} />
                <ColorRow label="Secundária" value={tenant.secondary} sample={tenant.secondary} fg={tenant.secondaryFg} />
                <ColorRow label="Secundária soft" value={tenant.secondarySoft} sample={tenant.secondarySoft} fg={tenant.secondary} />
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-semibold">Tutora IA</div>
              <div className="text-text-muted mt-0.5 text-xs">
                Persona usada no chat com alunos.
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nome curto" value={tenant.tutorName} />
                <Field label="Nome completo" value={tenant.tutorFull} />
                <Field label="Voz (TTS)" value="Feminina · BR · regional" />
                <Field label="Tom de fala" value="Acolhedora · firme · brasileira" />
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-3 sticky top-6 self-start">
            <div className="text-text-faint text-[11.5px] font-semibold tracking-wider uppercase">
              Preview ao vivo
            </div>
            <Card className="p-5">
              <PrefLogo tenant={tenant} />
              <div className="mt-4 space-y-2">
                <button
                  className="w-full rounded-md px-3 py-2 text-sm font-medium"
                  style={{
                    background: tenant.primary,
                    color: tenant.primaryFg,
                  }}
                >
                  Botão primário
                </button>
                <button
                  className="border-border-strong w-full rounded-md border px-3 py-2 text-sm"
                >
                  Botão secundário
                </button>
                <div
                  className="rounded-md p-3 text-xs"
                  style={{
                    background: tenant.primarySoft,
                    color: tenant.primary,
                  }}
                >
                  Comunicado da escola · destaque
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}

function ColorRow({ label, value, sample, fg }: { label: string; value: string; sample: string; fg: string }) {
  return (
    <div>
      <div className="text-text-faint text-[11.5px] tracking-wider uppercase">
        {label}
      </div>
      <div
        className="border-border mt-1 flex items-center justify-between rounded-md border px-3 py-2"
        style={{ background: sample, color: fg }}
      >
        <span className="text-xs font-medium">Amostra</span>
        <span className="text-xs" style={{ fontFamily: "var(--font-mono)" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-text-faint text-[11.5px] tracking-wider uppercase">
        {label}
      </div>
      <div className="bg-surface-2 border-border mt-1 rounded-md border px-3 py-2 text-sm">
        {value}
      </div>
    </div>
  );
}
