import { Check, ChevronLeft, ChevronRight, Info, Upload } from "lucide-react";
import { Button, Card, Chip } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";

const STEPS = ["Dados cadastrais", "Configuração técnica", "White-label", "Provisionamento", "Confirmação"];
const CURRENT = 2;

export default function OnboardingWizardPage() {
  return (
    <>
      <PageHeader
        title="Nova prefeitura · onboarding"
        subtitle="5 passos · ~30min · provisionamento automático ao final"
        actions={
          <>
            <Button variant="ghost">Salvar rascunho</Button>
            <Button variant="secondary">Cancelar</Button>
          </>
        }
      />
      <PageBody>
        {/* Stepper */}
        <Card className="p-0">
          <div className="flex items-center gap-0 px-6 py-5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? 1 : "0 0 auto" }}>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-[13px] font-semibold ${
                      i < CURRENT
                        ? "bg-success text-white"
                        : i === CURRENT
                          ? "bg-primary text-primary-fg border-primary-soft border-[3px]"
                          : "bg-surface-2 text-text-faint"
                    }`}
                  >
                    {i < CURRENT ? <Check size={14} /> : i + 1}
                  </div>
                  <div
                    className={`text-center text-xs ${i === CURRENT ? "font-semibold" : "text-text-muted"}`}
                  >
                    {s}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="mx-2 mb-6 h-0.5 flex-1"
                    style={{
                      background:
                        i < CURRENT ? "var(--success)" : "var(--border)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card className="p-6">
            <div className="text-sm font-semibold">
              Passo 3 · White-label da prefeitura
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Logotipo">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-16 items-center justify-center rounded-md text-xl font-bold"
                    style={{
                      background: "#15803D",
                      color: "white",
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    PML
                  </div>
                  <Button variant="secondary" size="sm" icon={<Upload size={12} />}>
                    Trocar
                  </Button>
                </div>
              </Field>
              <Field label="Nome da prefeitura">
                <input
                  className="bg-surface border-border-strong h-9 w-full rounded-md border px-3 text-sm outline-none"
                  defaultValue="Prefeitura Municipal de Lavras"
                />
              </Field>
              <Field label="Cor primária">
                <div className="flex gap-1.5">
                  {["#15803D", "#1E40AF", "#B91C1C", "#7C3AED", "#0891B2"].map(
                    (c, i) => (
                      <button
                        key={c}
                        className="size-8 rounded-md"
                        style={{
                          background: c,
                          border:
                            i === 0
                              ? "3px solid var(--text)"
                              : "1px solid var(--border)",
                        }}
                      />
                    ),
                  )}
                  <input
                    className="bg-surface border-border-strong h-8 flex-1 rounded-md border px-3 text-xs outline-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                    defaultValue="#15803D"
                  />
                </div>
              </Field>
              <Field label="Cor secundária">
                <div className="flex gap-1.5">
                  {["#FFFFFF", "#F59E0B", "#475569", "#B08D57"].map((c, i) => (
                    <button
                      key={c}
                      className="size-8 rounded-md"
                      style={{
                        background: c,
                        border:
                          i === 0
                            ? "3px solid var(--text)"
                            : "1px solid var(--border)",
                      }}
                    />
                  ))}
                  <input
                    className="bg-surface border-border-strong h-8 flex-1 rounded-md border px-3 text-xs outline-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                    defaultValue="#FFFFFF"
                  />
                </div>
              </Field>
              <Field label="Nome do tutor IA">
                <input
                  className="bg-surface border-border-strong h-9 w-full rounded-md border px-3 text-sm outline-none"
                  defaultValue="Tika de Lavras"
                />
              </Field>
              <Field label="Voz do tutor">
                <select className="bg-surface border-border-strong h-9 w-full rounded-md border px-3 text-sm outline-none">
                  <option>Feminina · BR · regional</option>
                  <option>Masculina · BR</option>
                </select>
              </Field>
            </div>

            <hr className="border-border my-5" />

            <div className="text-text-muted text-[11.5px] font-semibold tracking-wider uppercase">
              Preview ao vivo
            </div>
            <div
              className="mt-3 flex flex-col gap-3 rounded-md p-4"
              style={{ background: "#E8F3EC" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex size-8 items-center justify-center rounded-md text-[13px] font-bold"
                  style={{
                    background: "#15803D",
                    color: "white",
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  PML
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">Lavras</div>
                  <div className="text-xs" style={{ color: "#54544D" }}>
                    Educação Municipal
                  </div>
                </div>
              </div>
              <button
                className="w-fit rounded-md px-3.5 py-2 text-sm font-medium"
                style={{ background: "#15803D", color: "white" }}
              >
                Botão primário
              </button>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="secondary" icon={<ChevronLeft size={14} />}>
                Anterior
              </Button>
              <Button iconRight={<ChevronRight size={14} />}>
                Próximo passo
              </Button>
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Card className="p-5">
              <div className="text-sm font-semibold">Resumo</div>
              <div className="mt-3 flex flex-col gap-2 text-xs">
                {[
                  { l: "CNPJ", v: "18.243.218/0001-04", state: "done" },
                  { l: "Contato", v: "Renato Alves", state: "done" },
                  { l: "Plano", v: "Standard · R$ 4,80/aluno", state: "done" },
                  { l: "Subdomínio", v: "lavras.nexus.edu", state: "done" },
                  { l: "Cobrança", v: "Empenho municipal", state: "done" },
                  { l: "White-label", v: "em configuração", state: "current" },
                  { l: "Provisionamento", v: "—", state: "pending" },
                  { l: "Credenciais", v: "—", state: "pending" },
                ].map((s) => (
                  <div key={s.l} className="flex items-center justify-between gap-2">
                    <span className="text-text-faint flex items-center gap-1.5">
                      {s.state === "done" && (
                        <Check size={12} className="text-success" />
                      )}
                      {s.state === "current" && (
                        <span className="bg-primary size-2 rounded-full" />
                      )}
                      {s.state === "pending" && (
                        <span className="bg-surface-3 size-2 rounded-full" />
                      )}
                      {s.l}
                    </span>
                    <span
                      className={s.state === "done" ? "" : "text-text-faint"}
                      style={
                        s.l === "CNPJ" || s.l === "Subdomínio"
                          ? { fontFamily: "var(--font-mono)" }
                          : undefined
                      }
                    >
                      {s.v}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-start gap-2.5">
                <Info size={14} className="text-primary mt-0.5 shrink-0" />
                <div className="text-text-muted text-xs leading-relaxed">
                  Os tokens semânticos serão sobrescritos via CSS vars. Nenhum
                  deploy necessário — o tenant fica brandeado em segundos.
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap gap-1.5">
              <Chip>Lavras-MG</Chip>
              <Chip>78k hab.</Chip>
              <Chip>~8.400 alunos</Chip>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-text-faint mb-1 text-[11.5px] tracking-wider uppercase">
        {label}
      </div>
      {children}
    </div>
  );
}
