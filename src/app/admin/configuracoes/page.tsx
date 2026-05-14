import { Eye, Send, Sparkles } from "lucide-react";
import { Button, Card, Chip } from "@/components/ui";
import { PageHeader, PageBody } from "@/components/layout";

const SYSTEM_PROMPT = `Você é {{tutor_name}}, tutora pedagógica da {{prefeitura}}.
Atende alunos brasileiros de 9 a 15 anos.

REGRAS:
1. Use método socrático — guie, não entregue respostas prontas
2. Alinhe-se à BNCC. Sempre identifique habilidades trabalhadas.
3. Adapte vocabulário à idade do aluno. Sem infantilizar.
4. Se detectar risco socioemocional → acione protocolo SRE-1.
5. Responda em português do Brasil, regional quando contextual.

{{aluno_context}}`;

const FLAGS = [
  { f: "aluno.audio_input", d: "Permitir entrada de áudio no chat do aluno", on: true, scope: "todas" },
  { f: "aluno.foto_input", d: "Foto de exercício (OCR + IA)", on: true, scope: "todas" },
  { f: "professor.copiloto_streaming", d: "Geração de plano em streaming", on: true, scope: "todas" },
  { f: "professor.gerador_prova", d: "Gerador de prova multi-versão", on: true, scope: "todas" },
  { f: "secretaria.relatorio_pdf", d: "Geração e envio automático de PDF mensal", on: true, scope: "todas" },
  { f: "admin.observabilidade", d: "Painel observabilidade técnica", on: true, scope: "nexus" },
  { f: "beta.tutor_voz", d: "Resposta em áudio sintetizado (TTS BR)", on: false, scope: "alfenas, pousoalegre" },
  { f: "beta.mural_ia", d: "IA reescreve comunicado da secretaria", on: false, scope: "alfenas" },
];

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        title="Configurações globais"
        subtitle="Prompts, feature flags e limites · aplicam a TODAS as prefeituras"
        actions={<Button icon={<Sparkles size={14} />}>Aplicar mudanças</Button>}
      />
      <PageBody>
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Prompt sistêmico */}
          <Card className="p-0">
            <div className="border-border border-b px-6 py-4 text-sm font-semibold">
              Prompt sistêmico do tutor
            </div>
            <div className="p-6">
              <div className="text-text-faint mb-1 text-[11.5px] tracking-wider uppercase">
                Versão atual
              </div>
              <div className="flex items-center gap-2">
                <Chip style={{ fontFamily: "var(--font-mono)" }}>v4.2 · estável</Chip>
                <span className="text-text-faint text-[11px]">
                  publicado em 02/05/2026
                </span>
              </div>

              <div className="text-text-faint mt-4 mb-1 text-[11.5px] tracking-wider uppercase">
                Conteúdo
              </div>
              <textarea
                className="bg-surface border-border-strong w-full rounded-md border p-3 text-xs leading-relaxed outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
                rows={12}
                defaultValue={SYSTEM_PROMPT}
              />

              <div className="mt-4 flex gap-1.5">
                <Button variant="secondary" size="sm" icon={<Eye size={12} />}>
                  Diff vs. v4.1
                </Button>
                <Button variant="secondary" size="sm">
                  Testar em sandbox
                </Button>
                <Button size="sm" icon={<Send size={12} />}>
                  Publicar v4.3
                </Button>
              </div>
            </div>
          </Card>

          {/* Feature flags */}
          <Card className="p-0">
            <div className="border-border border-b px-6 py-4 text-sm font-semibold">
              Feature flags
            </div>
            <div>
              {FLAGS.map((f, i) => (
                <div
                  key={f.f}
                  className={`flex items-center gap-4 px-6 py-3.5 ${
                    i < FLAGS.length - 1 ? "border-border border-b" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[12.5px] font-medium"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {f.f}
                    </div>
                    <div className="text-text-muted mt-0.5 text-[11.5px]">
                      {f.d}
                    </div>
                  </div>
                  <span className="text-text-faint text-[11px]">{f.scope}</span>
                  <div
                    className="relative h-[22px] w-9 shrink-0 rounded-full"
                    style={{
                      background: f.on ? "var(--success)" : "var(--surface-3)",
                    }}
                  >
                    <div
                      className="absolute top-0.5 size-[18px] rounded-full bg-white"
                      style={{ left: f.on ? 16 : 2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
